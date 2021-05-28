/**
 *
 * @param recipient the snowflake ID recieved by the discord bot. Ex, <@86890631690977280>
 * @returns the snowflake ID, ex 86890631690977280
 */
export const parseDiscordRecipient = (recipient: string): string | null => {
  try {
    const recipientParsed = recipient.split('<@!')[1].split('>')[0];
    return recipientParsed;
  } catch (e) {
    return null;
  }
};

export const createDiscordErrMsg = (err: any): string => {
  return `🚧 an error has occurred 🚧:
        \n\`${err}\`
        \nPlease create an issue at https://github.com/bafnetwork/baf-wallet-v2/issues and HODL tight until we fix it.`;
};
