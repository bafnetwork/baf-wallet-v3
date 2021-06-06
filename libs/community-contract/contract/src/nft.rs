use std::convert::TryInto;

use near_sdk::{
    env::{current_account_id, is_valid_account_id, keccak256, signer_account_id},
    near_bindgen, AccountId,
};

use crate::contract_core::{AccountInfo, Community, CommunityContract, SecpPK, SecpPKInternal};

/// The functionality which works with NFT related functionality such as setting
/// default NFT addresses
pub trait NFTFunc {
    fn set_default_nft_contract(&mut self, nft_contract: AccountId);
    fn get_default_nft_contract(&self) -> &Option<AccountId>;
}

#[near_bindgen]
impl NFTFunc for Community {
    fn set_default_nft_contract(&mut self, nft_contract: AccountId) {
        self.default_nft_contract = Some(nft_contract);
    }
    fn get_default_nft_contract(&self) -> &Option<AccountId> {
        &self.default_nft_contract
    }
}
