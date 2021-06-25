// pub mod account_info;
pub mod admin;
pub mod nft;
pub mod errors;

// use crate::account_info::AccountInfos;
use crate::admin::Admin;
use crate::errors::throw_error;
use crate::nft::NFTFunc;
use std::convert::TryInto;
use crate::env::predecessor_account_id;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};

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
pub struct Community {
    pub(crate) account_infos: UnorderedMap<SecpPKInternal, AccountInfo>,
    pub(crate) admins: UnorderedSet<AccountId>,
    pub(crate) default_nft_contract: Option<AccountId>,
}

#[near_bindgen]
impl Community {
    #[init]
    pub fn new() -> Self {
        let mut default_admins: UnorderedSet<AccountId> = UnorderedSet::new("admin-set".as_bytes());
        default_admins.insert(&predecessor_account_id());
        Self {
            admins: default_admins,
            account_infos: UnorderedMap::new("account-infos-map".as_bytes()),
            default_nft_contract: None,
        }
    }
    pub(crate) fn parse_secp_pk(secp_pk: SecpPK) -> Result<SecpPKInternal, String> {
        secp_pk
            .try_into()
            .map_err(|e| "Incorrect public key format".to_string())
    }
}

#[near_bindgen]
impl NFTFunc for Community {
    fn set_default_nft_contract(&mut self, nft_contract: AccountId) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error(crate::errors::UNAUTHORIZED);
        }
        self.default_nft_contract = Some(nft_contract);
    }
    fn get_default_nft_contract(&self) -> &Option<AccountId> {
        &self.default_nft_contract
    }
}

#[near_bindgen]
impl Admin for Community {
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
