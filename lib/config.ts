export const BURROW_CONFIG = {
  name: 'Burrow',
  handle: '@Burrow',
  xProfileUrl: 'https://x.com/Burrow',
  tagline: 'Dig through the mines. 2,500 workers. Free mint.',
  description: 'Underground Hill Climb–style driving game with a collection of 2,500 pixel miner NFTs ("workers") and a free mint on Robinhood Chain.',
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
  socials: {
    x: 'https://x.com/Burrow',
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
