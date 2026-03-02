import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice } from "@/data/coins";
import { TrendingUp, TrendingDown, ArrowRight, Wallet, Eye, EyeOff, Gift, Star, Users, Percent, Sparkles, RefreshCw, Trophy, MoreHorizontal, Plus, Send, ArrowLeftRight } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import TopBar from "@/components/TopBar";

const PriceCell = ({ price, direction, symbol }: { price: number; direction: string; symbol: string }) => {
  const [flash, setFlash] = useState("");
  const prevDir = useRef(direction);

  useEffect(() => {
    if (direction !== "neutral" && direction !== prevDir.current) {
      setFlash(direction === "up" ? "price-flash-up" : "price-flash-down");
      const t = setTimeout(() => setFlash(""), 800);
      prevDir.current = direction;
      return () => clearTimeout(t);
    }
  }, [direction, price]);

  return (
    <span className={`font-mono transition-colors duration-300 ${flash} ${direction === "up" ? "text-success" : direction === "down" ? "text-danger" : "text-foreground"}`}>
      ${formatPrice(price)}
    </span>
  );
};

const Index = () => {
  const { user, isGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { coins, lastUpdate } = useLiveMarket();
  const [showBalance, setShowBalance] = useState(true);
  const [marketTab, setMarketTab] = useState<"favorites" | "hot" | "new" | "gainers">("hot");

  const totalBalance = useMemo(() => {
    if (!user?.balance) return 0;
    return Object.entries(user.balance).reduce((sum, [symbol, amount]) => {
      const coin = coins.find((c) => c.symbol === symbol);
      return sum + amount * (coin?.price || (symbol === "USDT" ? 1 : 0));
    }, 0);
  }, [user, coins]);

  const topGainers = useMemo(() => [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, 5), [coins]);
  const topLosers = useMemo(() => [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, 5), [coins]);
  const hotCoins = coins.slice(0, 8);

  const quickActions = [
    { icon: Gift, label: "Rewards Hub", color: "text-primary" },
    { icon: Star, label: "Earn", color: "text-primary" },
    { icon: Users, label: "Referral", color: "text-primary" },
    { icon: Percent, label: "Convert", color: "text-primary" },
    { icon: Sparkles, label: "Alpha", color: "text-primary" },
    { icon: RefreshCw, label: "Swap", color: "text-primary" },
    { icon: Trophy, label: "Rewards", color: "text-primary" },
    { icon: MoreHorizontal, label: "More", color: "text-muted-foreground" },
  ];

  const displayCoins = useMemo(() => {
    if (marketTab === "gainers") return topGainers;
    if (marketTab === "new") return [...coins].reverse().slice(0, 5);
    return hotCoins;
  }, [marketTab, coins, topGainers, hotCoins]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-3 space-y-4">

        {/* Balance Card */}
        {isAuthenticated && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">Est. Total Value (USDT)</p>
              <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground">
                {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
              {showBalance ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {showBalance ? `≈ ₹${(totalBalance * 83.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "••••"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-success font-medium">Today's PNL +$0.00</span>
              <span className="text-xs text-success">(+0.00%)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button onClick={() => navigate("/wallet?tab=deposit")} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Funds
              </button>
              <button onClick={() => navigate("/wallet?tab=transfer")} className="flex-1 bg-secondary text-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-1.5">
                <Send className="h-4 w-4" /> Send
              </button>
              <button onClick={() => navigate("/wallet?tab=internal")} className="flex-1 bg-secondary text-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4" /> Transfer
              </button>
            </div>
          </div>
        )}

        {isGuest && (
          <div className="rounded-xl bg-card p-5 text-center border border-border">
            <Wallet className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-foreground font-semibold">Sign up to start trading</p>
            <p className="text-sm text-muted-foreground mt-1">Get 10,000 USDT demo balance</p>
            <button onClick={() => navigate("/signup")} className="mt-3 bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold">
              Create Account
            </button>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button key={action.label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card hover:bg-secondary transition-colors">
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                <action.icon className={`h-4.5 w-4.5 ${action.color}`} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Market Tabs */}
        <div>
          <div className="flex gap-4 border-b border-border mb-3">
            {(["favorites", "hot", "new", "gainers"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMarketTab(t)}
                className={`pb-2 text-sm font-medium capitalize transition-colors relative ${
                  marketTab === t ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "favorites" ? "⭐ Favorites" : t}
                {marketTab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
            <button onClick={() => navigate("/market")} className="ml-auto pb-2 text-xs text-muted-foreground flex items-center gap-0.5">
              More <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Market List */}
          <div className="space-y-0">
            {displayCoins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="flex items-center justify-between w-full py-3 hover:bg-card/50 transition-all rounded-lg px-1"
              >
                <div className="flex items-center gap-3 flex-1">
                  <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1 py-0.5 rounded">/USDT</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right mr-2">
                  <p className="text-sm font-mono">
                    <PriceCell price={coin.price} direction={coin.priceDirection} symbol={coin.symbol} />
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded text-xs font-semibold min-w-[72px] text-center ${
                  coin.change24h >= 0 ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"
                }`}>
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Gainers */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" /> Top Gainers
          </h2>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            {topGainers.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-secondary/50 transition-all border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">{coin.symbol}<span className="text-[10px] text-muted-foreground ml-1">/USDT</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono"><PriceCell price={coin.price} direction={coin.priceDirection} symbol={coin.symbol} /></span>
                  <span className="bg-success text-success-foreground text-[10px] font-semibold px-2 py-0.5 rounded min-w-[56px] text-center">+{coin.change24h.toFixed(2)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-danger" /> Top Losers
          </h2>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            {topLosers.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-secondary/50 transition-all border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">{coin.symbol}<span className="text-[10px] text-muted-foreground ml-1">/USDT</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono"><PriceCell price={coin.price} direction={coin.priceDirection} symbol={coin.symbol} /></span>
                  <span className="bg-danger text-danger-foreground text-[10px] font-semibold px-2 py-0.5 rounded min-w-[56px] text-center">{coin.change24h.toFixed(2)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
