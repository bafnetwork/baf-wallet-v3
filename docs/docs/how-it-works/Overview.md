---
sidebar_position: 1
---

# Overview

BAF wallet as a system has 3 parts:

1. Discord Bot
2. Approval UI
3. A BAF Wallet Global Smart Contract (referred to as Global Contract from here on out)
4. API

The discord bot just builds transactions - it listens to the discord channel for commands (i.e. messages), extracts transaction information (e.g. amount, recipient), and PM's the message sender a link to the Approval UI.

The Approval UI is a very simple webpage that allows a user to approve / deny transactions. It will show the transaction's contents and ask whether or not they would like to approve it. If they approve it, the Approval UI signs the transaction, sends it to the NEAR blockchain, and waits for confirmation.

In order to send/receive tokens using BAF, all users must first sign into the UI with their discord account and link their discord account an existing NEAR account. If they don't the Bot will give an error saying the recipient or sender has not set up their account. For a more detailed description of how this mapping is stored, please see [Account Mappings](./AccountMappings.md)

### The Global Contract

The Global Contract serves two main purposes:
1. Mappings between discord accounts and NEAR accounts for BAF wallet.
2. Maintaining each Discord Guild's metadata, such as a default NFT Contract. Currently, only BAF Wallet admins can add new communities to the Global Contract, this is set to change in the near future.

<!-- The access control exists so that we can support operations like adding/removing contracts from the community that should be permissioned. -->

### Torus and how we are noncustodial

BAF Wallet is noncustodial. This means that the Discord user is the only one who can know the keys associated with his/her account. This is done via [Torus](https://tor.us). Long story short, they use a distributed key generation method to derive a private/ public key pair from your OAuth login (this basically means just logging in with Discord, Google, or Facebook). Check out their [documentation](https://docs.tor.us/) to find out more.

### The API

The API serves two very small purposes. Firstly, it allows the bot (which doesn't have keys) to look up the near account ID associated with a give discord user ID through the smart contract. Secondly, refreshes the user's Discord OAuth Token, which is necessary because Discord by default caches it for 30 minutes, while [Torus](https://tor.us) requires a fresh token.
