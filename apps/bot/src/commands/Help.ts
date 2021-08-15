import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';

export default class Help extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'help',
      description: 'Shows help messages',
      category: 'Information',
      usage: client.settings.prefix.concat('help'),
      cooldown: 1000,
      requiredPermissions: ['SEND_MESSAGES'],
    });
  }

  public async run(message: Message): Promise<void> {
    await super.respond(
      message.channel,
      'BAF Wallet is a discord bot that lets you send crypto assets through discord.\n\n'
      + 'Built with ❤️ on NEAR by the Blockchain Acceleration Foundation.\n\n'
      + '**List of commands**:\n\n'
      + '`Ping` - Respond Pong! \n'
      + `\`${this.client.settings.prefix}send\` - sends NEAR or NEP-141 tokens on NEAR.\n`
      +  `\`${this.client.settings.prefix}sendNFT\` - sends NEP171 compatible NFTs on NEAR.\n`
      + `\`${this.client.settings.prefix}help\` - lists the available commands and what they do.\n`
      + `\n`
      + `To see usage details of a particular command, do \`${this.client.settings.prefix}<Command Name>\`.`
    );
  }
}
