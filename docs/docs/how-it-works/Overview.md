---
sidebar_position: 1
---

# Overview

BAF wallet as a system has 3 parts:

1. Discord Bot
2. Approval UI
3. BAF Wallet Smart Contract (1 for each community)

The discord bot just builds transactions - it listens to the discord channel for commands (i.e. messages), extracts transaction information (e.g. amount, recipient), and PM's the message sender a link to the Approval UI.

The Approval UI is a very simple webpage that allows a user to approve / deny transactions. It will show the transaction's contents and ask whether or not they would like to approve it. If they approve it, the Approval UI signs the transaction, sends it to the NEAR blockchain, and waits for confirmation.

In order to send/receive tokens using BAF, all users must first sign into the UI with their discord account and link their discord account an existing NEAR account. If they don't the Bot will give an error saying the recipient or sender has not set up their account. For a more detailed description of how this mapping is stored, please see [Account Mappings](./AccountMappings.md)

The Community Contract is used for access control and the storing the mappings between discord accounts and NEAR accounts for BAF wallet. The access control exists so that we can support operations like adding/removing contracts from the community that should be permissioned.
