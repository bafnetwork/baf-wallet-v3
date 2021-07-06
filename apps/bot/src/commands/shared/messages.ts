export const noDefaultNFTContractMessage = `The default NFT contract has not been set for this guild. Please contact your Discord's admins to fix this up`;
export const userUninitMessage = (user: string) =>
  `❌ invalid user ❌: ${user} has not initialized their account with BAF Wallet`;
export const usersUninitMessage = (users: string[]) =>
  `❌ invalid user ❌: ${users.join(', ')} ${
    users.length === 1 ? 'has' : 'have'
  } not initialized their account${
    users.length > 1 ? 's' : ''
  } with BAF Wallet`;
