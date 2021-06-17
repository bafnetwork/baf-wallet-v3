import { Message } from 'discord.js';
import { Command } from '../Command';
import { BotClient } from '../types';

export default class Help extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'help',
      description: 'Help commands bot.',
      category: 'Information',
      usage: client.settings.prefix.concat('help'),
      cooldown: 1000,
      requiredPermissions: ['SEND_MESSAGES'],
    });
  }

  public async run(message: Message): Promise<void> {
    await super.respond(
      message.channel,
      'Help - List out all the commands \n' +
        'Ping - Respond Pong! \n' +
        `${this.client.settings.prefix}sendMoney - sends NEAR or NEP-141 tokens on NEAR \n` +
        `${this.client.settings.prefix}sendNFT - sends NEP171 compatible NFTs on NEAR`
    );
  }
}
