use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};
use std::convert::TryInto;

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
        default_admins.insert(&signer_account_id());
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
