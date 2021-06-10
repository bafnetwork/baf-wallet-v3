use crate::env::predecessor_account_id;
use crate::errors::throw_error;
use std::convert::TryInto;

use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};

use crate::{AccountInfo, Community, CommunityContract, SecpPK, SecpPKInternal};

/// The functionality which works with NFT related functionality such as setting
/// default NFT addresses
pub trait NFTFunc {
    fn set_default_nft_contract(&mut self, nft_contract: AccountId);
    fn get_default_nft_contract(&self) -> &Option<AccountId>;
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
    fn test_setting_default_nft() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        assert_eq!(contract.get_default_nft_contract(), &None);
        contract.set_default_nft_contract("AAA".to_string());
        assert_eq!(
            contract.get_default_nft_contract(),
            &Some("AAA".to_string())
        );
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_requires_admin() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        testing_env!(get_context(bob()));
        contract.set_default_nft_contract("AAA".to_string());
    }
}
