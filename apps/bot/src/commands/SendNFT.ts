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
import { createDiscordErrMsg, parseDiscordRecipient } from '@baf-wallet/utils';
import { getGlobalContract } from '@baf-wallet/global-contract';
import {
  noDefaultNFTContractMessage,
  userUninitMessage,
} from './shared/messages';
import { tryGetTorusPublicAddress } from '@baf-wallet/torus';
import { getUninitUsers } from './shared/utils';

export default class SendNFT extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'sendNFT',
      description: 'sends NEP171 compatible NFTs',
      category: 'Utility',
      usage: `You can do either \`${client.settings.prefix}sendNFT [NFT ID] to [recipient]\` to send from the default NFT contract or \`[NFT ID] from [NFT Contract] to [recipient]\``,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%sendNFT ((.*) from (.*) to (.*)|(.*) to (.*))$/g;
    const matched = rx.exec(content)?.filter((elem) => elem !== undefined);
    if (!matched) return null;
    // The first element of the match is the whole string if it matched, the second is the chunk of the or clause
    return matched.length < 2 ? null : matched.slice(2);
  }

  private async buildGenericTx(
    message: Message,
    contractAddress: string,
    tokenId: string,
    recipientParsed: string
  ): Promise<GenericTxParams | null> {
    const action: GenericTxActionTransferNFT = {
      type: GenericTxSupportedActions.TRANSFER_NFT,
      tokenId,
      contractAddress,
    };

    const tx: GenericTxParams = {
      recipientUserId: recipientParsed,
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
    } else if (args.length !== 2 && args.length !== 3) {
      await super.respond(
        message.channel,
        `expected 2 or 3 parameters, got ${args.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }

    const tokenId = args[0];
    const argsOffset = args.length === 3 ? 1 : 0;
    let community_nft_contract = '';
    if (args.length !== 3) {
      community_nft_contract = await getGlobalContract().get_community_default_nft_contract(
        { server: message.guild.id }
      );
      if (!community_nft_contract) {
        await super.respond(message.channel, noDefaultNFTContractMessage);
        return;
      }
    }
    const contractAddress =
      args.length === 3 ? args[argsOffset] : community_nft_contract;
    const recipient: string = args[1 + argsOffset];

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
    const { uninitUsers } = await getUninitUsers([recipientUser]);

    if (uninitUsers.length > 0) {
      await super.respond(
        message.channel,
        userUninitMessage(recipientUserReadable)
      );
      return;
    }
    try {
      const tx = await this.buildGenericTx(
        message,
        contractAddress,
        tokenId,
        recipientParsed
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
