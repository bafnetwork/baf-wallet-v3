use crate::contract_core::CommunityContract;
use std::convert::TryInto;

use near_sdk::{
    env::{current_account_id, is_valid_account_id, keccak256, signer_account_id},
    near_bindgen, AccountId,
};

use crate::contract_core::{AccountInfo, Community, SecpPK, SecpPKInternal};

/// The functionality which works with admin related code
pub trait Admin {
    fn add_admins(&mut self, admins: Vec<AccountId>);
    fn remove_admins(&mut self, admins: Vec<AccountId>);
    fn get_admins(&self) -> Vec<AccountId>;
}

#[near_bindgen]
impl Admin for Community {
    fn add_admins(&mut self, new_admins: Vec<AccountId>) {
        for admin in new_admins {
            self.admins.insert(&admin);
        }
    }

    fn remove_admins(&mut self, admins: Vec<AccountId>) {
        for admin in admins {
            self.admins.remove(&admin);
        }
    }

    fn get_admins(&self) -> Vec<AccountId> {
        self.admins.to_vec()
    }
}
