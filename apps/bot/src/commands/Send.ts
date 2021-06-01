import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import {
  formatNativeTokenAmountToIndivisibleUnit,
  formatTokenAmountToIndivisibleUnit,
} from '@baf-wallet/multi-chain';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import {
  Chain,
  GenericTxAction,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import { strToChain } from '@baf-wallet/utils';
import { getNearChain } from '@baf-wallet/global-state';

export default class SendMoney extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'sendMoney',
      description: 'sends NEAR or NEP-141 tokens on NEAR testnet',
      category: 'Utility',
      usage: `${client.settings.prefix}sendMoney [amount of fungible token] [asset, i.e. NEAR, Berries, etc.] to [recipient]`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%sendMoney (.*) (.*) to (.*)$/g;
    const matched = rx.exec(content);
    if (!matched) return null;
    // The first element of the match is the whole string if it matched
    return matched.length < 3 ? null : matched.slice(1);
  }

  private async buildGenericTx(
    message: Message,
    asset: string,
    amount: number,
    recipientParsed: string,
    recipientUserReadable: string
  ): Promise<GenericTxParams | null> {
    let actions: GenericTxAction[];
    const nearConstants = getNearChain().getConstants(environment.env);
    // assume that we are on NEAR for now
    if (asset === nearConstants.nativeTokenSymbol) {
      actions = [
        {
          type: GenericTxSupportedActions.TRANSFER,
          amount: formatNativeTokenAmountToIndivisibleUnit(amount, Chain.NEAR),
        },
      ];
    } else {
      const tokenIndex = nearConstants.tokens
        .map((token) => token.tokenSymbol)
        .indexOf(asset);
      if (tokenIndex === -1) {
        await super.respond(
          message.channel,
          `❌ invalid asset ❌: ${asset} is currently not supported`
        );
        return null;
      }
      actions = [
        {
          type: GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN,
          contractAddress: nearConstants.tokens[tokenIndex].contractAddress,
          amount: formatTokenAmountToIndivisibleUnit(
            amount,
            nearConstants.tokens[tokenIndex].decimals
          ),
        },
      ];
    }

    const tx: GenericTxParams = {
      recipientUserId: recipientParsed,
      recipientUserIdReadable: recipientUserReadable,
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

    // Recipient should look like <@86890631690977280>
    let recipientParsed: string;
    try {
      recipientParsed = recipient.split('<@!')[1].split('>')[0];
    } catch (e) {
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
        asset,
        amount,
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
        `To open BAF Wallet and approve your transaction, please open this link: ${link}`
      );
    } catch (err) {
      console.error(err);
      await super.respond(
        message.channel,
        `🚧 an error has occurred 🚧:
        \n\`${err}\`
        \nPlease create an issue at https://github.com/bafnetwork/baf-wallet-v2/issues and HODL tight until we fix it.`
      );
      return;
    }
  }
}
