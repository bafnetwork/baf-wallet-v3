use crate::env::predecessor_account_id;
use crate::errors::throw_error;
use std::convert::TryInto;

use near_sdk::{
    env::{current_account_id, is_valid_account_id, keccak256, signer_account_id},
    near_bindgen, AccountId,
};

use crate::{AccountInfo, GlobalData, SecpPK, SecpPKInternal};

/// The functionality which stores information for community contract. It maps Discord Servers to GlobalData Contract Addresses
pub trait CommunityContract {
    fn get_community_contract(&self, server: String) -> Option<AccountId>;
    fn set_community_contract(&mut self, server: String, contract_address: AccountId);
}

impl GlobalData {}

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
    fn test_add_without_privilege() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        testing_env!(get_context(bob()));
        contract.set_community_contract("Server1".to_string(), "addr1".to_string());
    }

    #[test]
    fn test_set_comm_contract() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        let addr_uninit = contract.get_community_contract("Server1".to_string());
        assert_eq!(addr_uninit, None);
        contract.set_community_contract("Server1".to_string(), "addr1".to_string());
        let addr = contract.get_community_contract("Server1".to_string());
        assert_eq!(addr.unwrap(), "addr1".to_string());
    }
}