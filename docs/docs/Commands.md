---
sidebar_position: 3
---

# Commands

To see a list of command available to all users in a Discord Guild, type `%help`.

The following message should be printed out:
```
TODO:
```

For any command, simply typing `%<COMMAND NAME>` will give a little how-to guide. So, typing `%sendNFT` should have the Discord Bot return
```TODO:```

## Community Commands

### help
List out the commands which Discord users can perform

### send
Send either native NEAR or a NEP-141 (TODO: link) fungible token to another Discord user

### sendNFT


## Discord Guild Admin Commands

### addAdmins

Add admins for the Discord Guild. Tag other users who you would like to become admins

### removeAdmins
<!-- TODO: this feels like a power that could get abused? Or do we not worry about it for now cause its important to have a good discord community manager. Granted if one person get's faulty access, then the whole thing could get screwed. That being said, maybe we should have like a super admin? Like one that cannot be removed -->

Remove admins from the Discord Guild.

### setDefaultNFT

Set the default NEP 171 (TODO: link to 171 exp) NFT Contract. The command takes in an Account ID (TODO: link) which points to the NFT Contract. See the [sendNFT](./Commands#sendnft) for the default NFT Contract's use case.