use crate::contract_core::CommunityContract;
use std::convert::TryInto;

use near_sdk::{AccountId, env::{current_account_id, is_valid_account_id, keccak256, signer_account_id}, near_bindgen};

use crate::contract_core::{AccountInfo, Community, SecpPK, SecpPKInternal};

/// The functionality which connects public keys to a near address
pub trait AccountInfos {
    fn get_account_id(&self, secp_pk: SecpPK) -> Option<AccountId>;
    fn get_account_nonce(&self, secp_pk: SecpPK) -> i32;
    fn set_account_info(
        &mut self,
        user_id: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
        new_account_id: AccountId,
    );
    fn delete_account_info(&mut self, user_id: String, secp_pk: SecpPK, secp_sig_s: Vec<u8>);
}

#[near_bindgen]
impl AccountInfos for Community {
    fn get_account_nonce(&self, secp_pk: SecpPK) -> i32 {
        self.get_account_info(secp_pk)
            .map(|account_info| account_info.nonce)
            .unwrap_or(0)
    }

    fn get_account_id(&self, secp_pk: SecpPK) -> Option<AccountId> {
        self.get_account_info(secp_pk)
            .map(|account_info| account_info.account_id)
    }

    fn set_account_info(
        &mut self,
        user_id: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
        new_account_id: AccountId,
    ) {
        if !is_valid_account_id(new_account_id.as_bytes()) {
            panic!("new account id is invalid!");
        }
        // TODO: we have to consider if we want to allow just anybody to interact with
        // with the map or if we should have a control access list
        if false {
            let signer = signer_account_id();
            if signer != new_account_id && signer != current_account_id() {
                panic!("signer must own either new account id or the contract itself!");
            }
        }
        let (secp_pk_internal, nonce) = self.verify_sig(user_id, secp_pk, secp_sig_s);
        self.account_infos.insert(
            &secp_pk_internal,
            &AccountInfo {
                account_id: new_account_id,
                nonce: nonce + 1,
            },
        );
    }

    fn delete_account_info(&mut self, user_id: String, secp_pk: SecpPK, secp_sig_s: Vec<u8>) {
        let (secp_pk_internal, _) = self.verify_sig(user_id, secp_pk, secp_sig_s);
        // TODO: this leaves vulnrebaility to replay attacks. If an account is made, deleted, and made again,
        // The nonce resets to 0. Please see https://github.com/bafnetwork/baf-wallet-v2/issues/32
        self.account_infos.remove(&secp_pk_internal);
    }

}

impl Community {
    fn get_account_nonce_internal(&self, secp_pk: &SecpPKInternal) -> i32 {
        self.get_account_info_internal(secp_pk)
            .map(|account_info| account_info.nonce)
            .unwrap_or(0)
    }
    fn get_account_info_internal(&self, secp_pk: &SecpPKInternal) -> Option<AccountInfo> {
        self.account_infos.get(secp_pk)
    }

    fn get_account_info(&self, secp_pk: SecpPK) -> Option<AccountInfo> {
        let secp_pk_internal = Community::parse_secp_pk(secp_pk).unwrap();
        self.account_infos.get(&secp_pk_internal)
    }

    fn verify_sig(
        &mut self,
        user_id: String,
        secp_pk: SecpPK,
        secp_sig_s: Vec<u8>,
    ) -> (SecpPKInternal, i32) {
        let secp_pk_internal = Community::parse_secp_pk(secp_pk).unwrap();
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
            panic!("The signature is incorrect for message {}", msg_str);
        }
        return (secp_pk_internal, nonce);
    }
}
