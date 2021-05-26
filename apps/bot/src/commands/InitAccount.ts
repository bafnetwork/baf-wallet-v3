
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

export default class InitAccount extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'initAccount',
      description: 'initializes a newly-created account with 1.1 NEAR + extra (optional)',
      category: 'Admin',
      usage: `${client.settings.prefix}initAccount [accountID of account to initialize] [associated discord username with 4-digit descriminator (e.g. sladuca#4629)] [additional NEAR to start them off with (optional)]`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  public async run(message: Message): Promise<void> {
    const content = message.content;
    if (!content) {
      throw Error('message content is empty!');
    }

    const params = content.split(' ');
    if (params.length < 2 || params.length > 4) {
      await super.respond(
        message.channel,
        `expected at least 1 parameter, got ${params.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }

    const accountID = parseInt(params[1]);

    const usernameWithDescriminator = params[2];

    let amountExtra = 0;

    if (params.length > 3) {
        const amount = parseInt(params[3])
        if (Number.isNaN(amount)) {
            await super.respond(
                message.channel,
                '❌ invalid amount ❌: amount must be a number!'
            );
            return;
        }
        amountExtra = amount;
    }

    const accountOwnerID = this.client.users.cache.find(u => u.tag === usernameWithDescriminator);
    if (accountOwnerID === undefined) {
        await super.respond(
            message.channel,
            `❌ user ${accountOwnerID} not found ❌`
        );
    }


    try {
      const tx: GenericTxParams = {
        recipientUserId: usernameWithDescriminator,
        recipientUserIdReadable: usernameWithDescriminator,
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER,
            amount: formatNativeTokenAmountToIndivisibleUnit(
              1 + amountExtra,
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
    }
  }
}

