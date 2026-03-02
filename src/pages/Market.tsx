import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { COINS, formatPrice, formatVolume } from "@/data/coins";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";

type Tab = "all" | "gainers" | "losers";

const Market = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = [...COINS];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s));
    }
    if (tab === "gainers") list = list.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (tab === "losers") list = list.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    return list;
  }, [search, tab]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coins..." className="pl-10 bg-secondary border-border" />
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

        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-border">
          <span className="flex-1">Name / Vol</span>
          <span className="w-24 text-right">Last Price</span>
          <span className="w-20 text-right">24h Chg%</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((coin) => (
            <button
              key={coin.id}
              onClick={() => navigate(`/trade/${coin.symbol}`)}
              className="flex items-center justify-between w-full px-3 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{coin.symbol}<span className="text-xs text-muted-foreground ml-1">/USDT</span></p>
                  <p className="text-xs text-muted-foreground">{formatVolume(coin.volume)}</p>
                </div>
              </div>
              <div className="w-24 text-right">
                <p className="text-sm font-mono text-foreground">{formatPrice(coin.price)}</p>
              </div>
              <div className="w-20 text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  coin.change24h >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
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
