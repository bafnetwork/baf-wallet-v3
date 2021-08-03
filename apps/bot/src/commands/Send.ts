import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import {
  Chain,
  GenericTxAction,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import {
  createDiscordErrMsg,
  formatTokenAmountToIndivisibleUnit,
  parseDiscordRecipient,
  strToChain,
} from '@baf-wallet/utils';
import { getNearChain } from '@baf-wallet/global-state';
import { getContractTokenInfoFromSymbol } from '@baf-wallet/chain-info';
import { nearToYoctoNear } from '@baf-wallet/near';
import {
  getTorusPublicAddress,
  tryGetTorusPublicAddress,
} from '@baf-wallet/torus';
import { userUninitMessage } from './shared/messages';
import { getUninitUsers } from './shared/utils';

const getUsage = (prefix: string) =>
  `${prefix}send [amount of fungible token] [asset, i.e. NEAR, Berries, etc.] to [recipient]\n\n` +
  `Supported assets include: ${Object.keys(
    getNearChain()?.constants.tokens
  ).join(', ')}, and NEAR`;

export default class send extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'send',
      description: 'sends NEAR or NEP-141 tokens on NEAR testnet',
      category: 'Utility',
      usage: getUsage(client.settings.prefix),
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%send (.*) (.*) to (.*)$/g;
    const matched = rx.exec(content);
    if (!matched) return null;
    // The first element of the match is the whole string if it matched
    return matched.length < 3 ? null : matched.slice(1);
  }

  private async buildGenericTx(
    message: Message,
    asset: string,
    amount: number,
    recipientParsed: string
  ): Promise<GenericTxParams | null> {
    let actions: GenericTxAction[];
    const nearConstants = getNearChain().constants;
    // assume that we are on NEAR for now
    if (asset === (await nearConstants.nativeTokenInfo()).symbol) {
      actions = [
        {
          type: GenericTxSupportedActions.TRANSFER,
          amount: nearToYoctoNear(amount),
        },
      ];
    } else {
      // TODO not right
      const tokenInfoFn = getNearChain()?.constants.tokens[asset];
      if (!tokenInfoFn) {
        await super.respond(
          message.channel,
          `❌ invalid asset ❌: ${asset} is currently not supported`
        );
        return null;
      }
      const tokenInfoRet = await tokenInfoFn();
      actions = [
        {
          type: GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN,
          contractAddress: tokenInfoRet.contractAddress,
          amount: formatTokenAmountToIndivisibleUnit(
            amount,
            tokenInfoRet.decimals
          ),
        },
      ];
    }

    const tx: GenericTxParams = {
      recipientUserId: recipientParsed,
      actions,
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

    // If there are only two arguments, assume that the user is sending an NFT
    const amount = parseInt(args[0]);
    if (Number.isNaN(amount) || amount < 0) {
      await super.respond(
        message.channel,
        '❌ invalid amount ❌: amount must be a nonnegative number!'
      );
      return;
    }
    const asset = args[1];
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
        asset,
        amount,
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
        `To open BAF Wallet and approve your transfer to ${recipientUserReadable}, please open this link: ${link}`
      );
    } catch (err) {
      console.error(err);
      await super.respond(message.channel, createDiscordErrMsg(err));
      return;
    }
  }
}
