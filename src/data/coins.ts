// Top 60 cryptocurrencies with static fallback data
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  image: string;
  networks: string[];
  depositAddress: string;
}

const generateAddress = (prefix: string) => {
  const chars = "0123456789abcdef";
  let addr = prefix;
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
};

export const COINS: CoinData[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 64119, change24h: -1.03, volume: 28_000_000_000, marketCap: 1_260_000_000_000, image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", networks: ["BTC", "BSC", "ETH"], depositAddress: generateAddress("bc1") },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 1843.8, change24h: -1.06, volume: 15_000_000_000, marketCap: 221_000_000_000, image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", networks: ["ETH", "BSC", "ARB"], depositAddress: generateAddress("0x") },
  { id: "tether", symbol: "USDT", name: "Tether", price: 1.0004, change24h: 0.01, volume: 52_000_000_000, marketCap: 110_000_000_000, image: "https://assets.coingecko.com/coins/images/325/small/Tether.png", networks: ["ETH", "BSC", "TRC20", "ARB", "BASE"], depositAddress: generateAddress("0x") },
  { id: "binancecoin", symbol: "BNB", name: "BNB", price: 598.34, change24h: 1.89, volume: 1_800_000_000, marketCap: 89_000_000_000, image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", networks: ["BSC", "ETH"], depositAddress: generateAddress("bnb1") },
  { id: "solana", symbol: "SOL", name: "Solana", price: 77.66, change24h: -0.27, volume: 3_200_000_000, marketCap: 33_000_000_000, image: "https://assets.coingecko.com/coins/images/4128/small/solana.png", networks: ["SOL", "ETH", "BSC"], depositAddress: generateAddress("So1") },
  { id: "ripple", symbol: "XRP", name: "XRP", price: 1.3481, change24h: 0.42, volume: 2_100_000_000, marketCap: 72_000_000_000, image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", networks: ["XRP", "ETH", "BSC"], depositAddress: "rN7" + generateAddress("").slice(0, 30) },
  { id: "cardano", symbol: "ADA", name: "Cardano", price: 0.461, change24h: -2.14, volume: 520_000_000, marketCap: 16_000_000_000, image: "https://assets.coingecko.com/coins/images/975/small/cardano.png", networks: ["ADA", "ETH", "BSC"], depositAddress: "addr1" + generateAddress("").slice(0, 50) },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 0.09261, change24h: -0.04, volume: 800_000_000, marketCap: 13_000_000_000, image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png", networks: ["DOGE", "BSC", "ETH"], depositAddress: "D" + generateAddress("").slice(0, 33) },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", price: 4.23, change24h: -1.82, volume: 220_000_000, marketCap: 5_500_000_000, image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png", networks: ["DOT", "ETH", "BSC"], depositAddress: "1" + generateAddress("").slice(0, 46) },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", price: 22.18, change24h: -3.21, volume: 380_000_000, marketCap: 8_200_000_000, image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png", networks: ["AVAX", "ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", price: 13.45, change24h: 0.87, volume: 450_000_000, marketCap: 7_800_000_000, image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png", networks: ["ETH", "BSC", "ARB"], depositAddress: generateAddress("0x") },
  { id: "polygon", symbol: "MATIC", name: "Polygon", price: 0.542, change24h: -1.45, volume: 310_000_000, marketCap: 5_000_000_000, image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png", networks: ["ETH", "BSC", "POLYGON"], depositAddress: generateAddress("0x") },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", price: 7.82, change24h: 2.34, volume: 180_000_000, marketCap: 4_700_000_000, image: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg", networks: ["ETH", "BSC", "ARB"], depositAddress: generateAddress("0x") },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", price: 68.92, change24h: -0.56, volume: 420_000_000, marketCap: 5_100_000_000, image: "https://assets.coingecko.com/coins/images/2/small/litecoin.png", networks: ["LTC", "ETH", "BSC"], depositAddress: "L" + generateAddress("").slice(0, 33) },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos", price: 6.78, change24h: -2.89, volume: 150_000_000, marketCap: 2_600_000_000, image: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png", networks: ["ATOM", "ETH", "BSC"], depositAddress: "cosmos1" + generateAddress("").slice(0, 38) },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol", price: 3.42, change24h: -4.12, volume: 210_000_000, marketCap: 3_800_000_000, image: "https://assets.coingecko.com/coins/images/10365/small/near.jpg", networks: ["NEAR", "ETH", "BSC"], depositAddress: generateAddress("") + ".near" },
  { id: "stellar", symbol: "XLM", name: "Stellar", price: 0.112, change24h: 0.23, volume: 95_000_000, marketCap: 3_200_000_000, image: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png", networks: ["XLM", "ETH", "BSC"], depositAddress: "G" + generateAddress("").slice(0, 55).toUpperCase() },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum", price: 0.823, change24h: -1.67, volume: 320_000_000, marketCap: 2_900_000_000, image: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg", networks: ["ARB", "ETH"], depositAddress: generateAddress("0x") },
  { id: "optimism", symbol: "OP", name: "Optimism", price: 1.67, change24h: -2.34, volume: 180_000_000, marketCap: 1_800_000_000, image: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png", networks: ["OP", "ETH"], depositAddress: generateAddress("0x") },
  { id: "filecoin", symbol: "FIL", name: "Filecoin", price: 3.89, change24h: -3.45, volume: 140_000_000, marketCap: 1_900_000_000, image: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png", networks: ["FIL", "ETH", "BSC"], depositAddress: "f1" + generateAddress("").slice(0, 38) },
  { id: "aptos", symbol: "APT", name: "Aptos", price: 5.23, change24h: -1.98, volume: 110_000_000, marketCap: 2_300_000_000, image: "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png", networks: ["APT", "ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "sui", symbol: "SUI", name: "Sui", price: 0.892, change24h: 3.45, volume: 250_000_000, marketCap: 2_500_000_000, image: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg", networks: ["SUI", "ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "pepe", symbol: "PEPE", name: "Pepe", price: 0.0000089, change24h: 5.67, volume: 800_000_000, marketCap: 3_700_000_000, image: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", price: 0.0000082, change24h: -1.23, volume: 200_000_000, marketCap: 4_800_000_000, image: "https://assets.coingecko.com/coins/images/11939/small/shiba.png", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "tron", symbol: "TRX", name: "TRON", price: 0.124, change24h: 0.89, volume: 340_000_000, marketCap: 10_800_000_000, image: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png", networks: ["TRC20", "ETH", "BSC"], depositAddress: "T" + generateAddress("").slice(0, 33) },
  { id: "wrapped-bitcoin", symbol: "WBTC", name: "Wrapped Bitcoin", price: 64050, change24h: -1.01, volume: 220_000_000, marketCap: 10_200_000_000, image: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png", networks: ["ETH", "BSC", "ARB"], depositAddress: generateAddress("0x") },
  { id: "dai", symbol: "DAI", name: "Dai", price: 1.0001, change24h: 0.0, volume: 180_000_000, marketCap: 5_300_000_000, image: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png", networks: ["ETH", "BSC", "ARB", "BASE"], depositAddress: generateAddress("0x") },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", price: 1.0002, change24h: 0.01, volume: 6_800_000_000, marketCap: 32_000_000_000, image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png", networks: ["ETH", "BSC", "ARB", "BASE", "SOL"], depositAddress: generateAddress("0x") },
  { id: "the-sandbox", symbol: "SAND", name: "The Sandbox", price: 0.312, change24h: -2.56, volume: 85_000_000, marketCap: 720_000_000, image: "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "aave", symbol: "AAVE", name: "Aave", price: 89.45, change24h: 1.23, volume: 150_000_000, marketCap: 1_300_000_000, image: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png", networks: ["ETH", "BSC", "ARB"], depositAddress: generateAddress("0x") },
  { id: "maker", symbol: "MKR", name: "Maker", price: 1450, change24h: -0.78, volume: 65_000_000, marketCap: 1_300_000_000, image: "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png", networks: ["ETH"], depositAddress: generateAddress("0x") },
  { id: "fantom", symbol: "FTM", name: "Fantom", price: 0.267, change24h: -3.89, volume: 95_000_000, marketCap: 750_000_000, image: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png", networks: ["FTM", "ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "algorand", symbol: "ALGO", name: "Algorand", price: 0.156, change24h: -1.34, volume: 45_000_000, marketCap: 1_200_000_000, image: "https://assets.coingecko.com/coins/images/4380/small/download.png", networks: ["ALGO", "ETH", "BSC"], depositAddress: generateAddress("") },
  { id: "vechain", symbol: "VET", name: "VeChain", price: 0.0213, change24h: -2.45, volume: 55_000_000, marketCap: 1_500_000_000, image: "https://assets.coingecko.com/coins/images/1167/small/VeChain-Logo-768x725.png", networks: ["VET", "ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "theta-token", symbol: "THETA", name: "Theta Network", price: 0.892, change24h: -1.67, volume: 32_000_000, marketCap: 892_000_000, image: "https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png", networks: ["THETA", "ETH"], depositAddress: generateAddress("0x") },
  { id: "injective-protocol", symbol: "INJ", name: "Injective", price: 12.34, change24h: 2.89, volume: 78_000_000, marketCap: 1_100_000_000, image: "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png", networks: ["INJ", "ETH", "BSC"], depositAddress: "inj1" + generateAddress("").slice(0, 38) },
  { id: "render-token", symbol: "RNDR", name: "Render", price: 4.56, change24h: -2.12, volume: 120_000_000, marketCap: 1_700_000_000, image: "https://assets.coingecko.com/coins/images/11636/small/rndr.png", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "immutable-x", symbol: "IMX", name: "Immutable", price: 1.23, change24h: -3.45, volume: 45_000_000, marketCap: 1_800_000_000, image: "https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "gala", symbol: "GALA", name: "Gala", price: 0.0189, change24h: -4.56, volume: 95_000_000, marketCap: 650_000_000, image: "https://assets.coingecko.com/coins/images/12493/small/GALA_token_image_-_200PNG.png", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "flow", symbol: "FLOW", name: "Flow", price: 0.567, change24h: -1.89, volume: 35_000_000, marketCap: 830_000_000, image: "https://assets.coingecko.com/coins/images/13446/small/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png", networks: ["FLOW", "ETH"], depositAddress: generateAddress("0x") },
  { id: "axie-infinity", symbol: "AXS", name: "Axie Infinity", price: 5.67, change24h: -2.34, volume: 42_000_000, marketCap: 770_000_000, image: "https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "eos", symbol: "EOS", name: "EOS", price: 0.623, change24h: -1.12, volume: 120_000_000, marketCap: 690_000_000, image: "https://assets.coingecko.com/coins/images/738/small/eos-eos-logo.png", networks: ["EOS", "ETH", "BSC"], depositAddress: generateAddress("") },
  { id: "mantle", symbol: "MNT", name: "Mantle", price: 0.478, change24h: 1.56, volume: 65_000_000, marketCap: 1_500_000_000, image: "https://assets.coingecko.com/coins/images/30980/small/token-logo.png", networks: ["ETH", "MNT"], depositAddress: generateAddress("0x") },
  { id: "sei-network", symbol: "SEI", name: "Sei", price: 0.234, change24h: -5.67, volume: 110_000_000, marketCap: 780_000_000, image: "https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png", networks: ["SEI", "ETH"], depositAddress: "sei1" + generateAddress("").slice(0, 38) },
  { id: "celestia", symbol: "TIA", name: "Celestia", price: 5.89, change24h: -3.21, volume: 95_000_000, marketCap: 1_100_000_000, image: "https://assets.coingecko.com/coins/images/31967/small/tia.jpg", networks: ["TIA", "ETH"], depositAddress: "celestia1" + generateAddress("").slice(0, 38) },
  { id: "starknet", symbol: "STRK", name: "Starknet", price: 0.567, change24h: -4.32, volume: 78_000_000, marketCap: 520_000_000, image: "https://assets.coingecko.com/coins/images/26433/small/starknet.png", networks: ["STRK", "ETH"], depositAddress: generateAddress("0x") },
  { id: "bonk", symbol: "BONK", name: "Bonk", price: 0.00001234, change24h: 8.92, volume: 180_000_000, marketCap: 820_000_000, image: "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg", networks: ["SOL", "ETH"], depositAddress: generateAddress("") },
  { id: "worldcoin-wld", symbol: "WLD", name: "Worldcoin", price: 1.89, change24h: -2.78, volume: 85_000_000, marketCap: 670_000_000, image: "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg", networks: ["ETH", "OP"], depositAddress: generateAddress("0x") },
  { id: "fetch-ai", symbol: "FET", name: "Fetch.ai", price: 0.789, change24h: 3.45, volume: 120_000_000, marketCap: 650_000_000, image: "https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg", networks: ["ETH", "BSC"], depositAddress: generateAddress("0x") },
  { id: "kaspa", symbol: "KAS", name: "Kaspa", price: 0.112, change24h: -1.56, volume: 55_000_000, marketCap: 2_700_000_000, image: "https://assets.coingecko.com/coins/images/25751/small/kaspa-icon-exchanges.png", networks: ["KAS"], depositAddress: "kaspa:" + generateAddress("").slice(0, 61) },
];

export const formatPrice = (price: number): string => {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(6);
  return price.toFixed(8);
};

export const formatVolume = (vol: number): string => {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
  return `$${vol.toLocaleString()}`;
};

export const formatMarketCap = formatVolume;
