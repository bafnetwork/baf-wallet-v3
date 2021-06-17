import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import {
  Chain,
  GenericTxActionTransferNFT,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import {
  createDiscordErrMsg,
  parseDiscordRecipient,
} from '@baf-wallet/utils';

export default class SendNFT extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'sendNFT',
      description: 'sends NEP171 compatible NFTs',
      category: 'Utility',
      usage: `${client.settings.prefix}sendNFT [NFT ID] from [NFT Contract] to [recipient]`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%sendNFT (.*) from (.*) to (.*)$/g;
    const matched = rx.exec(content);
    if (!matched) return null;
    // The first element of the match is the whole string if it matched
    return matched.length < 3 ? null : matched.slice(1);
  }

  private async buildGenericTx(
    message: Message,
    contractAddress: string,
    tokenId: string,
    recipientParsed: string,
    recipientUserReadable: string
  ): Promise<GenericTxParams | null> {
    const action: GenericTxActionTransferNFT = {
      type: GenericTxSupportedActions.TRANSFER_NFT,
      tokenId,
      contractAddress,
    };

    const tx: GenericTxParams = {
      recipientUserId: recipientParsed,
      recipientUserIdReadable: recipientUserReadable,
      actions: [action],
      oauthProvider: 'discord',
    };
    return tx;
  }

  public async run(message: Message): Promise<void> {
    const content = message.content;
    if (!content) {
      throw Error('message content is empty!');
    }
    const args = this.extractArgs(content);

    if (!args) {
      await super.respond(
        message.channel,
        `Invalid command, \n\`usage: ${this.conf.usage}\``
      );
      return;
    } else if (args.length !== 3) {
      await super.respond(
        message.channel,
        `expected 3 parameters, got ${args.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }

    const tokenId = args[0];
    const contractAddress = args[1];
    const recipient: string = args[2];

    const recipientParsed = parseDiscordRecipient(recipient);

    if (!recipientParsed) {
      await super.respond(
        message.channel,
        '❌ invalid user ❌: the user must be tagged!'
      );
      return;
    }

    const recipientUser = this.client.users.resolve(recipientParsed);
    const recipientUserReadable = `${recipientUser.username}#${recipientUser.discriminator}`;

    try {
      const tx = await this.buildGenericTx(
        message,
        contractAddress,
        tokenId,
        recipientParsed,
        recipientUserReadable
      );
      if (!tx) return;
      const link = createApproveRedirectURL(
        Chain.NEAR,
        environment.BASE_WALLET_URL,
        tx
      );

      await super.respond(
        message.channel,
        "Please check your DM's for a link to approve the transaction!"
      );
      await message.author.send(
        `To open BAF Wallet and approve your NFT transfer, please open this link: ${link}`
      );
    } catch (err) {
      console.error(err);
      await super.respond(message.channel, createDiscordErrMsg(err));
      return;
    }
  }
}
