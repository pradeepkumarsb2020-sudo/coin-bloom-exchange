import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { COINS, CoinData } from "@/data/coins";

interface LiveCoin extends CoinData {
  prevPrice: number;
  priceDirection: "up" | "down" | "neutral";
}

interface MarketContextType {
  coins: LiveCoin[];
  lastUpdate: number;
}

const MarketContext = createContext<MarketContextType>({ coins: [], lastUpdate: 0 });

// Simulate realistic price movements
const simulatePriceChange = (price: number): number => {
  const volatility = 0.002; // 0.2% max change per tick
  const change = (Math.random() - 0.5) * 2 * volatility;
  return price * (1 + change);
};

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [coins, setCoins] = useState<LiveCoin[]>(() =>
    COINS.map((c) => ({ ...c, prevPrice: c.price, priceDirection: "neutral" as const }))
  );
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Try to fetch from CoinGecko initially
  useEffect(() => {
    const ids = COINS.slice(0, 50).map((c) => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`)
      .then((r) => r.json())
      .then((data) => {
        setCoins((prev) =>
          prev.map((coin) => {
            const d = data[coin.id];
            if (!d) return coin;
            return {
              ...coin,
              prevPrice: coin.price,
              price: d.usd || coin.price,
              change24h: d.usd_24h_change ?? coin.change24h,
              volume: d.usd_24h_vol ?? coin.volume,
              priceDirection: (d.usd || coin.price) > coin.price ? "up" : (d.usd || coin.price) < coin.price ? "down" : "neutral",
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  // Simulate live price changes every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) => {
        // Only update ~30% of coins each tick for realism
        const updateCount = Math.floor(prev.length * 0.3);
        const indicesToUpdate = new Set<number>();
        while (indicesToUpdate.size < updateCount) {
          indicesToUpdate.add(Math.floor(Math.random() * prev.length));
        }

        return prev.map((coin, i) => {
          if (!indicesToUpdate.has(i)) return coin;
          const newPrice = simulatePriceChange(coin.price);
          const changeFromOriginal = ((newPrice - COINS[i]?.price || coin.price) / (COINS[i]?.price || coin.price)) * 100;
          return {
            ...coin,
            prevPrice: coin.price,
            price: newPrice,
            change24h: coin.change24h + (newPrice > coin.price ? 0.001 : -0.001),
            priceDirection: newPrice > coin.price ? "up" : newPrice < coin.price ? "down" : "neutral",
          };
        });
      });
      setLastUpdate(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ coins, lastUpdate }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useLiveMarket = () => useContext(MarketContext);
