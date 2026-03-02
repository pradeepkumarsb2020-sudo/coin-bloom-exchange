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
    <div className="min-h-screen bg-background pb-16">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="pl-10 bg-card border-border h-9 text-sm rounded-lg" />
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-3 border-b border-border">
          {(["all", "gainers", "losers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                tab === t ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "all" ? "All" : t === "gainers" ? "Gainers" : "Losers"}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between px-1 py-2 text-[11px] text-muted-foreground">
          <span className="flex-1">Name / Vol</span>
          <span className="w-24 text-right">Last Price</span>
          <span className="w-20 text-right">24h Chg%</span>
        </div>

        <div>
          {filtered.map((coin) => (
            <button
              key={coin.id}
              onClick={() => navigate(`/trade/${coin.symbol}`)}
              className={`flex items-center justify-between w-full px-1 py-3 hover:bg-card/60 transition-all rounded ${coin.priceDirection !== "neutral" ? (coin.priceDirection === "up" ? "price-flash-up" : "price-flash-down") : ""}`}
            >
              <div className="flex items-center gap-2.5 flex-1">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                    <span className="text-[10px] text-muted-foreground">/USDT</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{formatVolume(coin.volume)}</p>
                </div>
              </div>
              <div className="w-24 text-right">
                <PriceCell price={coin.price} direction={coin.priceDirection} />
              </div>
              <div className="w-20 text-right">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold min-w-[64px] text-center ${
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
