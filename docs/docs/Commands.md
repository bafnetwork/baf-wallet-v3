---
sidebar_position: 3
---

# Commands

To see a list of command available to all users in a Discord Guild, type `%help`.

The following message should be printed out:
```
BAF Wallet is a discord bot that lets you send crypto assets through discord.

Built with :heart: on NEAR by the Blockchain Acceleration Foundation.

List of commands:

Ping - Respond Pong! 
%send - sends NEAR or NEP-141 tokens on NEAR.
%sendNFT - sends NEP171 compatible NFTs on NEAR.
%help - lists the available commands and what they do.

To see usage details of a particular command, do %<Command Name>.
```

For any command, simply typing `%<COMMAND NAME>` will give a little how-to guide. So, typing `%sendNFT` should have the Discord Bot return
```usage: You can do either %sendNFT [NFT ID] to [recipient] to send from the default NFT contract or [NFT ID] from [NFT Contract] to [recipient]```

## Community Commands

### help
List out the commands which Discord users can perform

### send
Send either native NEAR or a [NEP-141](https://learn.figment.io/network-documentation/near/tutorials/1-project_overview/2-fungible-token) fungible token to another Discord user

### sendNFT
Send an NFT to another Discord user. The NFT's contract can either be the Discord Guild's default contract or a contract specified in the command

## Discord Guild Admin Commands

### addAdmins

Add admins for the Discord Guild. Tag other users who you would like to become admins

### removeAdmins
<!-- TODO: this feels like a power that could get abused? Or do we not worry about it for now cause its important to have a good discord community manager. Granted if one person get's faulty access, then the whole thing could get screwed. That being said, maybe we should have like a super admin? Like one that cannot be removed -->

Remove admins from the Discord Guild.

### setDefaultNFT

Set the default [NEP 171](https://github.com/near/NEPs/discussions/171) NFT Contract. The command takes in an Account ID which points to the NFT Contract. See the [sendNFT](./Commands#sendnft) for the default NFT Contract's use case.