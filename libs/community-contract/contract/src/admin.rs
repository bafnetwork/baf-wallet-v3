use crate::errors::throw_error;
use crate::env::predecessor_account_id;
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

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use near_sdk::AccountId;

    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};
    use secp256k1::{PublicKey, SecretKey};
    use std::convert::TryInto;

    use super::*;

    fn alice() -> AccountId {
        "alice.near".to_string()
    }
    fn bob() -> AccountId {
        "bob.near".to_string()
    }
    fn carol() -> AccountId {
        "carol.near".to_string()
    }
    fn get_context(predecessor_account_id: AccountId) -> VMContext {
        VMContext {
            current_account_id: alice(),
            signer_account_id: bob(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id,
            input: vec![],
            block_index: 0,
            block_timestamp: 0,
            account_balance: 1_000_000_000_000_000_000_000_000_000u128,
            account_locked_balance: 0,
            storage_usage: 10u64.pow(6),
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view: false,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_remove_without_privilege() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        testing_env!(get_context(bob()));
        contract.remove_admins(vec![bob(), carol()]);
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_add_without_privilege() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        testing_env!(get_context(bob()));
        contract.add_admins(vec![bob(), carol()]);
    }

    #[test]
    fn test_add_remove_admins() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        contract.add_admins(vec![bob(), carol()]);
        let mut admins = contract.get_admins();
        // expect three because alice should be an original admin
        assert_eq!(admins.len(), 3);
        assert_eq!(admins.contains(&alice()), true);
        assert_eq!(admins.contains(&bob()), true);
        assert_eq!(admins.contains(&carol()), true);
        assert_eq!(admins.contains(&"JIM".to_string()), false);
        contract.remove_admins(vec![bob()]);
        admins = contract.get_admins();
        assert_eq!(admins.contains(&bob()), false);
        assert_eq!(admins.contains(&carol()), true);
    }
}
