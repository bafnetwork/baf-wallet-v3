import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import { formatNativeTokenAmountToIndivisibleUnit } from '@baf-wallet/multi-chain';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import {
  Chain,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';

export default class SendMoney extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'sendMoney',
      description: 'sends NEAR or NEP-141 tokens on NEAR testnet',
      category: 'Utility',
      usage: `${client.settings.prefix}sendNFT [amount of fungible token or NFT] [asset, i.e. NEAR, Berries, EventBadges] to [recipient]`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%sendMoney (.*) (.*) to (.*)$/g;
    const matched = rx.exec(content);
    if (!matched) return null;
    // The first element of the match is the whole string if it matched
    return matched.length < 2 ? null : matched.slice(1);
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
        `expected 2 parameters, got ${args.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }
   
    // If there are only two arguments, assume that the user is sending an NFT
    const sendingOne = args.length === 2 ? 0 : 1;
    const amount = sendingOne ? 1 : parseInt(args[0]);
    if (Number.isNaN(amount) || amount < 0) {
      await super.respond(
        message.channel,
        '❌ invalid amount ❌: amount must be a nonnegative number!'
      );
      return;
    }
    const asset = args[sendingOne];
    const recipient: string = args[1 + sendingOne];


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
      const tx: GenericTxParams = {
        recipientUserId: recipientParsed,
        recipientUserIdReadable: recipientUserReadable,
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER,
            amount: formatNativeTokenAmountToIndivisibleUnit(
              amount,
              Chain.NEAR
            ),
          },
        ],
        oauthProvider: 'discord',
      };
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
