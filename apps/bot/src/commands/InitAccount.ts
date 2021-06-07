import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import { formatNativeTokenAmountToIndivisibleUnit } from '@baf-wallet/multi-chain';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import { getNearChain } from '@baf-wallet/global-state';
import {
  Chain,
  GenericTxAction,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import { parseDiscordRecipient } from '@baf-wallet/utils';

export default class InitAccount extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'initAccount',
      description: 'initializes a newly-created account with 1.1 NEAR + extra (optional)',
      category: 'Admin',
      usage: `${client.settings.prefix}initAccount [new account ID] [tag discord user whose account it is] [additional NEAR to start them off with (optional)]`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }
  
  private buildGenericTx(
    amount: number,
    recipientUserId: string,
    newAccountId: string,
    recipientUsername: string
  ): GenericTxParams {
    let actions: GenericTxAction[];
    actions = [
      {
        type: GenericTxSupportedActions.CREATE_ACCOUNT,
        accountID: newAccountId, 
        amount: formatNativeTokenAmountToIndivisibleUnit(amount, Chain.NEAR),
      },
    ];

    const tx: GenericTxParams = {
      recipientUserId,
      recipientUserIdReadable: recipientUsername,
      actions,
      oauthProvider: 'discord',
    };

    return tx;
  }

  public async run(message: Message): Promise<void> {
    const content = message.content;
    console.log(content);
    if (!content) {
      throw Error('message content is empty!');
    }

    const params = content.split(' ');
    if (params.length < 3 || params.length > 4) {
      await super.respond(
        message.channel,
        `expected at least 1 parameter, got ${params.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }

    const newAccountId = params[1];
    const recipientTag = params[2];
    const recipientParsed = parseDiscordRecipient(recipientTag);
    
    if (!recipientParsed) {
      await super.respond(
        message.channel,
        '❌ invalid user ❌: the user must be tagged!'
      );
      return;
    }
    const recipientUser = this.client.users.resolve(recipientParsed);
    const recipientUserReadable = `${recipientUser.username}#${recipientUser.discriminator}`;

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


    try {
      await super.respond(
        message.channel,
        "Please check your DM's for a link to approve the transaction!"
      );

      const tx = this.buildGenericTx(amountExtra + 1, recipientUser.id, newAccountId, recipientUserReadable);

      const link = createApproveRedirectURL(
        Chain.NEAR,
        environment.BASE_WALLET_URL,
        tx
      );

      await message.author.send(
        `To create the new user's account, please open this link: ${link}`
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

