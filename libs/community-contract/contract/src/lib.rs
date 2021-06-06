mod account_info;
mod admin;
mod contract_core;
mod nft;

use contract_core::Community;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::env::{current_account_id, is_valid_account_id, keccak256, signer_account_id};
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::{collections::UnorderedMap, env, near_bindgen};

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc = near_sdk::wee_alloc::WeeAlloc::INIT;

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
        contract: &mut Community,
        nonce: i32,
        sk: &SecretKey,
        pk: &PublicKey,
    ) {
        let msg_hash = keccak256(msg_str.as_bytes());
        let msg_hash_array: [u8; 32] = msg_hash.try_into().unwrap();
        let msg = secp256k1::Message::parse(&msg_hash_array);

        let (sig, _) = secp256k1::sign(&msg, &sk);
        contract.set_account_info(
            user_id,
            pk.serialize().to_vec(),
            sig.serialize().to_vec(),
            alice(),
        );
    }

    #[test]
    fn test_update_account_id() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        let sk = secp256k1::SecretKey::default();
        let pk = secp256k1::PublicKey::from_secret_key(&sk);
        let nonce = 0;
        let msg_str = format!("John:{}", nonce);
        sign_and_set_account(msg_str, "John".to_string(), &mut contract, nonce, &sk, &pk);
        let set_account_id = contract.get_account_id(pk.serialize().to_vec()).unwrap();
        assert_eq!(set_account_id, alice());
    }

    #[test]
    #[should_panic(expected = "The signature is incorrect")]
    fn test_invalid_signature() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        let sk = secp256k1::SecretKey::default();
        let pk = secp256k1::PublicKey::from_secret_key(&sk);
        let bad_nonce = 1;
        let msg_str = format!("fake me {}", bad_nonce);
        sign_and_set_account(msg_str, "".to_string(), &mut contract, bad_nonce, &sk, &pk);
    }

    #[test]
    #[should_panic(expected = "Incorrect signature format")]
    fn test_invalid_signature_format() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        let sk = secp256k1::SecretKey::default();
        let pk = secp256k1::PublicKey::from_secret_key(&sk);
        let nonce = 0;
        let msg_str = format!("John:{}", nonce);
        let msg_hash = keccak256(msg_str.as_bytes());
        let msg_hash_array: [u8; 32] = msg_hash.try_into().unwrap();
        let msg = secp256k1::Message::parse(&msg_hash_array);

        let (sig, _) = secp256k1::sign(&msg, &sk);
        let mut faulty_sig = vec![1, 2, 3];
        faulty_sig.append(&mut sig.serialize().to_vec());
        contract.set_account_info(
            "John".to_string(),
            pk.serialize().to_vec(),
            faulty_sig,
            alice(),
        );
    }

    #[test]
    #[should_panic(expected = "Incorrect public key format")]
    fn test_invalid_public_key_format() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = Community::new();
        let sk = secp256k1::SecretKey::default();
        let pk = secp256k1::PublicKey::from_secret_key(&sk);
        let nonce = 1;
        let msg_str = format!("John:{}", nonce);
        let msg_hash = keccak256(msg_str.as_bytes());
        let msg_hash_array: [u8; 32] = msg_hash.try_into().unwrap();
        let msg = secp256k1::Message::parse(&msg_hash_array);

        let (sig, _) = secp256k1::sign(&msg, &sk);
        let mut faulty_pk = vec![1, 2, 3];
        faulty_pk.append(&mut pk.serialize().to_vec());
        contract.set_account_info(
            "John".to_string(),
            faulty_pk,
            sig.serialize().to_vec(),
            alice(),
        );
    }
}
