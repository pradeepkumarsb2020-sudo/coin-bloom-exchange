import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice, formatVolume } from "@/data/coins";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";

type Tab = "all" | "gainers" | "losers";

const PriceCell = ({ price, direction }: { price: number; direction: string }) => {
  const [flash, setFlash] = useState("");
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? "price-flash-up" : "price-flash-down");
      const t = setTimeout(() => setFlash(""), 800);
      prevPrice.current = price;
      return () => clearTimeout(t);
    }
  }, [price]);

  return (
    <span className={`font-mono text-sm transition-colors duration-200 ${flash} ${direction === "up" ? "text-success" : direction === "down" ? "text-danger" : "text-foreground"}`}>
      {formatPrice(price)}
    </span>
  );
};

const Market = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const navigate = useNavigate();
  const { coins } = useLiveMarket();

  const filtered = useMemo(() => {
    let list = [...coins];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s));
    }
    if (tab === "gainers") list = list.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (tab === "losers") list = list.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    return list;
  }, [search, tab, coins]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          Live · {coins.length} coins
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Coin Pairs" className="pl-10 bg-secondary border-border" />
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "gainers", "losers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : t === "gainers" ? "🟢 Gainers" : "🔴 Losers"}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-border">
          <span className="flex-1">Name ↕ / Vol ↕</span>
          <span className="w-24 text-right">Last Price ↕</span>
          <span className="w-20 text-right">24h Chg% ↕</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((coin) => (
            <button
              key={coin.id}
              onClick={() => navigate(`/trade/${coin.symbol}`)}
              className={`flex items-center justify-between w-full px-3 py-3 hover:bg-secondary/50 transition-all ${coin.priceDirection !== "neutral" ? (coin.priceDirection === "up" ? "price-flash-up" : "price-flash-down") : ""}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-foreground">{coin.symbol}</p>
                    <span className="text-xs text-muted-foreground">/USDT</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatVolume(coin.volume)}</p>
                </div>
              </div>
              <div className="w-24 text-right">
                <PriceCell price={coin.price} direction={coin.priceDirection} />
              </div>
              <div className="w-20 text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  coin.change24h >= 0 ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"
                }`}>
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Market;
