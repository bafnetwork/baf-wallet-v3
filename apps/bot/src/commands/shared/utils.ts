import { getGlobalContract } from '@baf-wallet/global-contract';
import { tryGetTorusPublicAddress } from '@baf-wallet/torus';

interface UserInfo {
  userId: string;
  userReadable: string;
}

export async function getUninitUsers(users: UserInfo[]) {
  const uninitMarkers = await Promise.all(
    users.map(async (user) => {
      const userPk = await tryGetTorusPublicAddress(user.userId, 'discord');
      if (!userPk) {
        return false;
      }
      const userId = await getGlobalContract().getAccountId(userPk);
      return !userId;
    })
  );
  return users.filter((user, i) => uninitMarkers[i]);
}
