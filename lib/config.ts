export const BURROW_CONFIG = {
  name: 'Burrow',
  handle: '@burrowRH',
  xProfileUrl: 'https://x.com/burrowRH',
  tagline: 'Dig through the mines. 2,500 workers.',
  description: 'Underground Hill Climb–style driving game with a collection of 2,500 pixel miner NFTs ("workers") on Robinhood Chain.',
  totalWorkers: 2500,
  mintCost: 'Free (0 ETH + gas)',
  estimatedGas: '~0.02 gwei (~$0.01)',
  chain: {
    name: 'Robinhood Chain',
    id: 4663,
    rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
    explorerUrl: 'https://robinhoodchain.blockscout.com',
    currency: 'ETH',
  },
  xUsername: 'burrowRH',
  // ID of the Burrow post people must like and reply to.
  // It's the number at the end of the post link: x.com/burrowRH/status/<THIS NUMBER>
  // While empty, the Like and Reply tasks open the @burrowRH profile instead.
  taskPostId: '',
  socials: {
    x: 'https://x.com/burrowRH',
    discord: 'https://discord.gg/burrow',
    github: 'https://github.com/burrow-game',
    docs: 'https://docs.robinhood.com/chain/deploy-smart-contracts',
  },
  referral: {
    pointsPerReferral: 5,
    startingPoints: 10,
    cookieName: 'burrow_ref',
    cookieMaxAge: 60 * 60 * 24 * 30, // 30 days
  },
  admin: {
    defaultSecret: 'burrow-secret-key-2026',
  },
};
