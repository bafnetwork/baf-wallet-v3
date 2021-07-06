import { getGlobalContract } from '@baf-wallet/global-contract';
import { tryGetTorusPublicAddress } from '@baf-wallet/torus';
import { User } from 'discord.js';

export async function getUninitUsers(users: User[]) {
  const associatedAccounts = await Promise.all(
    users.map(async (user) => {
      const userPk = await tryGetTorusPublicAddress(user.id, 'discord');
      if (!userPk) {
        return false;
      }
      const userId = await getGlobalContract().getAccountId(userPk);
      return userId;
    })
  );
  return {
    uninitUsers: users.filter((user, i) => !associatedAccounts[i]),
    associatedAccounts: associatedAccounts.filter(
      (account) => !!account
    ) as string[],
  };
}
