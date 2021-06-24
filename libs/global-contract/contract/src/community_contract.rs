use crate::env::predecessor_account_id;
use crate::errors::throw_error;
use std::convert::TryInto;

use near_sdk::{
    env::{current_account_id, is_valid_account_id, keccak256, signer_account_id},
    near_bindgen, AccountId,
};

use crate::{AccountInfo, GlobalData, SecpPK, SecpPKInternal};

/// The functionality which stores information for community contract. It maps Discord Servers to Community Contract Addresses
pub trait CommunityContract {
    fn get_community_contract(&self, server: String) -> Option<AccountId>;
    fn set_community_contract(&mut self, server: String, contract_address: String);
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

    fn sign_and_set_account(
        msg_str: String,
        user_id: String,
        contract: &mut GlobalData,
        nonce: i32,
        sk: &SecretKey,
        pk: &PublicKey,
    ) {
        let msg_hash = keccak256(msg_str.as_bytes());
        let msg_hash_array: [u8; 32] = msg_hash.try_into().unwrap();
        let msg = secp256k1::Message::parse(&msg_hash_array);

        let (sig, _) = secp256k1::sign(&msg, &sk);
        // contract.set_account_info(
        //     user_id,
        //     pk.serialize().to_vec(),
        //     sig.serialize().to_vec(),
        //     alice(),
        // );
    }

    #[test]
    fn test_update_account_id() {}
}
