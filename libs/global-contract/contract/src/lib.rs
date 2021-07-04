pub mod account_info;
pub mod admin;
pub mod community_info;
pub mod errors;

use crate::env::predecessor_account_id;
use account_info::AccountInfos;
use admin::Admin;
use community_info::CommunityContract;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::serde::Serialize;
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};
use std::convert::TryInto;
use std::fmt::format;

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc = near_sdk::wee_alloc::WeeAlloc::INIT;

pub(crate) type SecpPKInternal = [u8; 65];
pub(crate) type SecpPK = Vec<u8>;

#[derive(BorshSerialize, BorshDeserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountInfo {
    pub(crate) user_name: String,
    pub(crate) account_id: AccountId,
    pub(crate) nonce: i32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CommunityInfo {
    pub(crate) admins: UnorderedSet<AccountId>,
    pub(crate) default_nft_contract: Option<AccountId>,
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct GlobalData {
    pub(crate) account_infos: UnorderedMap<SecpPKInternal, AccountInfo>,
    pub(crate) admins: UnorderedSet<AccountId>,
    pub(crate) guild_id_to_community_info: UnorderedMap<String, CommunityInfo>,
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
            guild_id_to_community_info: UnorderedMap::new("guild-community-info-map".as_bytes()),
        }
    }

    pub(crate) fn parse_secp_pk(secp_pk: SecpPK) -> Result<SecpPKInternal, String> {
        secp_pk
            .try_into()
            .map_err(|_e| "Incorrect public key format".to_string())
    }
}

#[near_bindgen]
impl CommunityContract for GlobalData {
    fn init_community(&mut self, guild_id: String, new_admins: Vec<AccountId>) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        let mut admins = UnorderedSet::new(format!("global-contract-{}", guild_id).as_bytes());
        for new_admin in new_admins.iter() {
            if !is_valid_account_id(new_admin.as_bytes()) {
                throw_error!(crate::errors::INVALID_ACCOUNT_ID);
            }
            admins.insert(new_admin);
        }
        self.guild_id_to_community_info.insert(
            &guild_id,
            &CommunityInfo {
                admins,
                default_nft_contract: None,
            },
        );
    }

    fn set_community_default_nft_contract(&mut self, guild_id: String, nft_contract: AccountId) {
        let mut community = self.get_community_info(&guild_id);
        let admins = community.admins;
        if !admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        community.default_nft_contract = Some(nft_contract);
        community.admins = admins;
        self.guild_id_to_community_info
            .insert(&guild_id, &community);
    }

    fn get_community_default_nft_contract(&self, guild_id: String) -> Option<AccountId> {
        let community = self.get_community_info(&guild_id);
        community.default_nft_contract
    }

    fn add_community_admins(&mut self, guild_id: String, new_admins: Vec<AccountId>) {
        let mut community = self.get_community_info(&guild_id);
        if !community.admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        for admin in new_admins {
            community.admins.insert(&admin);
        }
        self.guild_id_to_community_info
            .insert(&guild_id, &community);
    }
    fn remove_community_admins(&mut self, guild_id: String, admins: Vec<AccountId>) {
        let mut community = self.get_community_info(&guild_id);
        if !community.admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        for admin in admins {
            community.admins.remove(&admin);
        }
        self.guild_id_to_community_info
            .insert(&guild_id, &community);
    }
    fn get_community_admins(&self, guild_id: String) -> Vec<AccountId> {
        let mut community = self.get_community_info(&guild_id);
        community.admins.to_vec()
    }
}

#[near_bindgen]
impl AccountInfos for GlobalData {
    fn get_account_nonce(&self, secp_pk: SecpPK) -> i32 {
        self.get_account_info(secp_pk)
            .map(|account_info| account_info.nonce)
            .unwrap_or(0)
    }

    fn get_account_info(&self, secp_pk: SecpPK) -> Option<AccountInfo> {
        self.get_account_info(secp_pk)
    }

    fn set_account_info(
        &mut self,
        user_name: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
        new_account_id: AccountId,
    ) {
        if !is_valid_account_id(new_account_id.as_bytes()) {
            throw_error!(crate::errors::INVALID_ACCOUNT_ID);
        }

        if !(predecessor_account_id() == new_account_id) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }

        let (secp_pk_internal, nonce) = self.verify_sig(user_name.clone(), secp_pk, secp_sig_s);
        self.account_infos.insert(
            &secp_pk_internal,
            &AccountInfo {
                user_name,
                account_id: new_account_id,
                nonce: nonce + 1,
            },
        );
    }

    fn delete_account_info(&mut self, user_name: String, secp_pk: SecpPK, secp_sig_s: Vec<u8>) {
        let (secp_pk_internal, _) = self.verify_sig(user_name.clone(), secp_pk, secp_sig_s);
        let account_info_opts = self.account_infos.get(&secp_pk_internal);
        match account_info_opts {
            None => return,
            Some(account_info) => {
                if account_info.user_name != user_name {
                    throw_error!(crate::errors::INVALID_USER_NAME)
                }
                // TODO: this leaves vulnrebaility to replay attacks. If an account is made, deleted, and made again,
                // The nonce resets to 0. Please see https://github.com/bafnetwork/baf-wallet-v2/issues/32
                self.account_infos.remove(&secp_pk_internal);
            }
        }
    }
}
#[near_bindgen]
impl Admin for GlobalData {
    fn add_admins(&mut self, new_admins: Vec<AccountId>) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        for admin in new_admins {
            self.admins.insert(&admin);
        }
    }

    fn remove_admins(&mut self, admins: Vec<AccountId>) {
        if !self.admins.contains(&predecessor_account_id()) {
            throw_error!(crate::errors::UNAUTHORIZED);
        }
        for admin in admins {
            self.admins.remove(&admin);
        }
    }

    fn get_admins(&self) -> Vec<AccountId> {
        self.admins.to_vec()
    }
}
