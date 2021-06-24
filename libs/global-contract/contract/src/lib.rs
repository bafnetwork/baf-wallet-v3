pub mod account_info;
pub mod admin;
pub mod community_contract;
pub mod errors;

use crate::account_info::AccountInfos;
use crate::env::predecessor_account_id;
use crate::errors::throw_error;
use admin::Admin;
use community_contract::CommunityContract;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};
use std::convert::TryInto;

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc = near_sdk::wee_alloc::WeeAlloc::INIT;

pub(crate) type SecpPKInternal = [u8; 65];
pub(crate) type SecpPK = Vec<u8>;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AccountInfo {
    pub(crate) account_id: AccountId,
    pub(crate) nonce: i32,
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct GlobalData {
    pub(crate) account_infos: UnorderedMap<SecpPKInternal, AccountInfo>,
    pub(crate) admins: UnorderedSet<AccountId>,
    pub(crate) default_nft_contract: Option<AccountId>,
    pub(crate) server_to_community_contract: UnorderedMap<String, AccountId>,
}

#[near_bindgen]
impl GlobalData {
    #[init]
    pub fn new() -> Self {
        let mut default_admins: UnorderedSet<AccountId> = UnorderedSet::new("admin-set".as_bytes());
        default_admins.insert(&predecessor_account_id());
        Self {
            admins: default_admins,
            account_infos: UnorderedMap::new("account-infos-map".as_bytes()),
            server_to_community_contract: UnorderedMap::new(
                "server-community-contract-map".as_bytes(),
            ),
            default_nft_contract: None,
        }
    }

    // TODO: and add tests
    // pub fn add_admins()
    // pub fn remove_admins()

    pub(crate) fn parse_secp_pk(secp_pk: SecpPK) -> Result<SecpPKInternal, String> {
        secp_pk
            .try_into()
            .map_err(|_e| "Incorrect public key format".to_string())
    }
}

#[near_bindgen]
impl CommunityContract for GlobalData {
    fn set_community_contract(&mut self, server: String, contract_address: AccountId) {
        if !(self.admins.contains(&predecessor_account_id())) {
            throw_error(crate::errors::UNAUTHORIZED);
        }
        self.server_to_community_contract
            .insert(&server, &contract_address);
    }
    fn get_community_contract(&self, server: String) -> Option<AccountId> {
        self.server_to_community_contract.get(&server)
    }
}

#[near_bindgen]
impl AccountInfos for GlobalData {
    fn get_account_nonce(&self, secp_pk: SecpPK) -> i32 {
        self.get_account_info(secp_pk)
            .map(|account_info| account_info.nonce)
            .unwrap_or(0)
    }

    fn get_account_id(&self, secp_pk: SecpPK) -> Option<AccountId> {
        self.get_account_info(secp_pk)
            .map(|account_info| account_info.account_id)
    }

    fn set_account_info(
        &mut self,
        user_id: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
        new_account_id: AccountId,
    ) {
        if !is_valid_account_id(new_account_id.as_bytes()) {
            throw_error(crate::errors::INVALID_ACCOUNT_ID);
        }

        if !(predecessor_account_id() == new_account_id) {
            throw_error(crate::errors::UNAUTHORIZED);
        }

        let (secp_pk_internal, nonce) = self.verify_sig(user_id, secp_pk, secp_sig_s);
        self.account_infos.insert(
            &secp_pk_internal,
            &AccountInfo {
                account_id: new_account_id,
                nonce: nonce + 1,
            },
        );
    }

    fn delete_account_info(&mut self, user_id: String, secp_pk: SecpPK, secp_sig_s: Vec<u8>) {
        let (secp_pk_internal, _) = self.verify_sig(user_id, secp_pk, secp_sig_s);
        // TODO: this leaves vulnrebaility to replay attacks. If an account is made, deleted, and made again,
        // The nonce resets to 0. Please see https://github.com/bafnetwork/baf-wallet-v2/issues/32
        self.account_infos.remove(&secp_pk_internal);
    }
}
#[near_bindgen]
impl Admin for GlobalData {
    fn add_admins(&mut self, new_admins: Vec<AccountId>) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error(crate::errors::UNAUTHORIZED);
        }
        for admin in new_admins {
            self.admins.insert(&admin);
        }
    }

    fn remove_admins(&mut self, admins: Vec<AccountId>) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error(crate::errors::UNAUTHORIZED);
        }
        for admin in admins {
            self.admins.remove(&admin);
        }
    }

    fn get_admins(&self) -> Vec<AccountId> {
        self.admins.to_vec()
    }
}
