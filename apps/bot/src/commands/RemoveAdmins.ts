import { GuildAuditLogs, Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';
import { createApproveRedirectURL } from '@baf-wallet/redirect-generator';
import { environment } from '../environments/environment';
import {
  Chain,
  GenericTxAction,
  GenericTxActionTransferNFT,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import { createDiscordErrMsg, parseDiscordRecipient } from '@baf-wallet/utils';
import { constants } from '../config/config';

export default class RemoveAdmins extends Command {
  constructor(protected client: BotClient) {
    super(client, {
      name: 'removeAdmins',
      description: 'Remove admin Near Accounts from the contract',
      category: 'Utility',
      usage: `${client.settings.prefix}removeAdmins adminAccount1, adminAccount2, adminAccount3...`,
      cooldown: 1000,
      requiredPermissions: [],
    });
  }

  private buildGenericTx(
    guildId: string,
    contractAddress: string,
    admins: string[]
  ): GenericTxParams {
    let actions: GenericTxAction[];
    actions = [
      {
        type: GenericTxSupportedActions.CONTRACT_CALL,
        functionName: 'remove_community_admins',
        functionArgs: {
          admins,
          guild_id: GuildAuditLogs,
        },
        deposit: '0',
      },
    ];

    const tx: GenericTxParams = {
      recipientAddress: contractAddress,
      recipientUserIdReadable: 'Community Contract',
      actions,
      oauthProvider: 'discord',
    };

    return tx;
  }

  private extractArgs(content: string): string[] | null {
    const rx = /^\%removeAdmins (.*)$/g;
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
    } else if (args.length !== 1) {
      await super.respond(
        message.channel,
        `expected 1 parameter, got ${args.length - 1}.\n\`usage: ${
          this.conf.usage
        }\``
      );
      return;
    }

    const admins = args[0].split(', ');

    try {
      const tx = await this.buildGenericTx(
        message.guild.id,
        constants.globalContractAddress,
        admins
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
        `To open BAF Wallet and remove ${JSON.stringify(admins)} as admins, please open this link: ${link}`
      );
    } catch (err) {
      console.error(err);
      await super.respond(message.channel, createDiscordErrMsg(err));
      return;
    }
  }
}
