use std::convert::TryInto;

use near_sdk::{env::keccak256, AccountId};

use crate::{throw_error, AccountInfo, GlobalData, SecpPK, SecpPKInternal};

/// The functionality which connects public keys to a near address
pub trait AccountInfos {
    fn get_account_info(&self, secp_pk: SecpPK) -> Option<AccountInfo>;
    fn get_account_nonce(&self, secp_pk: SecpPK) -> i32;
    fn set_account_info(
        &mut self,
        user_name: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
        new_account_id: AccountId,
    );
    fn delete_account_info(&mut self, user_name: String, secp_pk: SecpPK, secp_sig_s: Vec<u8>);
}

impl GlobalData {
    fn get_account_nonce_internal(&self, secp_pk: &SecpPKInternal) -> i32 {
        self.get_account_info_internal(secp_pk)
            .map(|account_info| account_info.nonce)
            .unwrap_or(0)
    }
    fn get_account_info_internal(&self, secp_pk: &SecpPKInternal) -> Option<AccountInfo> {
        self.account_infos.get(secp_pk)
    }

    pub(crate) fn get_account_info(&self, secp_pk: SecpPK) -> Option<AccountInfo> {
        let secp_pk_internal = GlobalData::parse_secp_pk(secp_pk).unwrap();
        self.account_infos.get(&secp_pk_internal)
    }

    pub(crate) fn verify_sig(
        &mut self,
        user_id: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
    ) -> (SecpPKInternal, i32) {
        let secp_pk_internal = GlobalData::parse_secp_pk(secp_pk).unwrap();
        let nonce = self.get_account_nonce_internal(&secp_pk_internal);
        let msg_str = format!("{}:{}", user_id, nonce);
        let msg_prehash = msg_str.as_bytes();
        let hash: [u8; 32] = keccak256(msg_prehash)
            .try_into()
            .map_err(|e| "An error occured hashing the message")
            .unwrap();
        let sig = &secp256k1::Signature::parse_slice(&secp_sig_s.as_slice())
            .map_err(|e| "Incorrect signature format")
            .unwrap();
        let pubkey = secp256k1::PublicKey::parse(&secp_pk_internal)
            .map_err(|e| "Error parsing pk")
            .unwrap();
        if !secp256k1::verify(&secp256k1::Message::parse(&hash), sig, &pubkey) {
            throw_error!(crate::errors::INCORRECT_SIGNATURE);
        }
        return (secp_pk_internal, nonce);
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
        let mut contract = GlobalData::new();
        let sk = secp256k1::SecretKey::default();
        let pk = secp256k1::PublicKey::from_secret_key(&sk);
        let nonce = 0;
        let msg_str = format!("John:{}", nonce);
        sign_and_set_account(msg_str, "John".to_string(), &mut contract, nonce, &sk, &pk);
        let set_account_id = contract
            .get_account_info(pk.serialize().to_vec())
            .unwrap()
            .account_id;
        assert_eq!(set_account_id, alice());
    }

    #[test]
    #[should_panic(expected = "The signature is incorrect")]
    fn test_invalid_signature() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
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
        let mut contract = GlobalData::new();
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
        let mut contract = GlobalData::new();
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
