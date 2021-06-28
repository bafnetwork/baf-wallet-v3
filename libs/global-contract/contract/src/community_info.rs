use near_sdk::AccountId;

use crate::{CommunityInfo, GlobalData, throw_error};

/// The functionality which stores information for community contract. It maps Discord Servers to GlobalData Contract Addresses
pub trait CommunityContract {
    /// Only global contract admins can initialize new communities for now
    fn init_community(&mut self, guild_id: String, new_admins: Vec<AccountId>);

    fn add_community_admins(&mut self, guild_id: String, new_admins: Vec<AccountId>);
    fn remove_community_admins(&mut self, guild_id: String, admins: Vec<AccountId>);
    fn get_community_admins(&self, guild_id: String) -> Vec<AccountId>;
    fn set_community_default_nft_contract(&mut self, guild_id: String, nft_contract: AccountId);
    fn get_community_default_nft_contract(&self, guild_id: String) -> Option<AccountId>;
}

impl GlobalData {
    pub(crate) fn get_community_info(&self, guild_id: &String) -> CommunityInfo {
        let community_opts = self.guild_id_to_community_info.get(guild_id);
        match community_opts {
            None => {
                throw_error!(crate::errors::GUILD_ID_NOT_REGISTERED);
            }
            Some(community) => community,
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use near_sdk::AccountId;

    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

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
    fn test_removing_community_admins_non_admin() {
        let mut context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec![alice()]);
        context = get_context(bob());
        testing_env!(context);
        contract.remove_community_admins("Server1".to_string(), vec![carol()]);
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_add_community_admins_non_admin() {
        let mut context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec![alice()]);
        context = get_context(bob());
        testing_env!(context);
        contract.add_community_admins("Server1".to_string(), vec![carol()]);
    }

    #[test]
    fn test_add_community_admins() {
        let mut context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec![bob()]);
        context = get_context(bob());
        testing_env!(context);
        contract.add_community_admins("Server1".to_string(), vec![carol()]);
        let addrs = contract.get_community_admins("Server1".to_string());
        assert_eq!(addrs.len(), 2);
        assert!(addrs.contains(&carol()));
        assert!(addrs.contains(&bob()));
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_init_community_non_admin() {
        let mut context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        context = get_context(bob());
        testing_env!(context);
        contract.init_community("Server1".to_string(), vec!["addr1".to_string()]);
    }

    #[test]
    fn test_init_community() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec!["addr1".to_string()]);
        let addrs = contract.get_community_admins("Server1".to_string());
        assert_eq!(addrs.len(), 1);
        assert_eq!(addrs[0], "addr1".to_string());
    }

    #[test]
    #[should_panic(expected = "This action requires admin privileges")]
    fn test_set_nft_contract_non_admin() {
        let mut context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec![alice()]);
        context = get_context(bob());
        testing_env!(context);
        contract
            .set_community_default_nft_contract("Server1".to_string(), "NFT CONTRACT".to_string());
    }

    #[test]
    fn test_set_nft_contract() {
        let context = get_context(alice());
        testing_env!(context);
        let mut contract = GlobalData::new();
        contract.init_community("Server1".to_string(), vec![alice()]);
        let mut nft = contract.get_community_default_nft_contract("Server1".to_string());
        assert_eq!(nft, None);
        contract
            .set_community_default_nft_contract("Server1".to_string(), "NFT CONTRACT".to_string());
        nft = contract.get_community_default_nft_contract("Server1".to_string());
        assert_eq!(nft.unwrap(), "NFT CONTRACT");
    }
}
