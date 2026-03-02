import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { COINS, formatPrice, formatVolume } from "@/data/coins";
import { TrendingUp, TrendingDown, ArrowRight, Wallet, Eye, EyeOff } from "lucide-react";
import { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";

const Index = () => {
  const { user, isGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const totalBalance = useMemo(() => {
    if (!user?.balance) return 0;
    return Object.entries(user.balance).reduce((sum, [symbol, amount]) => {
      const coin = COINS.find((c) => c.symbol === symbol);
      return sum + amount * (coin?.price || (symbol === "USDT" ? 1 : 0));
    }, 0);
  }, [user]);

  const topGainers = useMemo(() => [...COINS].sort((a, b) => b.change24h - a.change24h).slice(0, 5), []);
  const topLosers = useMemo(() => [...COINS].sort((a, b) => a.change24h - b.change24h).slice(0, 5), []);
  const hotCoins = COINS.slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Balance Card */}
        {isAuthenticated && (
          <div className="glass-card rounded-xl p-5 glow-primary">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Total Balance</span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground">
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-3xl font-bold text-foreground font-mono">
              {showBalance ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate("/wallet")} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
                Deposit
              </button>
              <button onClick={() => navigate("/wallet")} className="flex-1 bg-secondary text-secondary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-secondary/80 transition-colors">
                Withdraw
              </button>
              <button onClick={() => navigate("/wallet")} className="flex-1 bg-secondary text-secondary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-secondary/80 transition-colors">
                Transfer
              </button>
            </div>
          </div>
        )}

        {isGuest && (
          <div className="glass-card rounded-xl p-5 text-center">
            <Wallet className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-foreground font-semibold">Sign up to start trading</p>
            <p className="text-sm text-muted-foreground mt-1">Get 10,000 USDT demo balance</p>
            <button onClick={() => navigate("/signup")} className="mt-3 bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-semibold">
              Create Account
            </button>
          </div>
        )}

        {/* Hot Coins */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Hot Coins</h2>
            <button onClick={() => navigate("/market")} className="text-sm text-primary flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {hotCoins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="glass-card rounded-lg p-3 text-left hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-sm font-semibold text-foreground">{coin.symbol}</span>
                </div>
                <p className="text-sm font-mono text-foreground">${formatPrice(coin.price)}</p>
                <p className={`text-xs font-medium ${coin.change24h >= 0 ? "text-success" : "text-danger"}`}>
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Top Gainers */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" /> Top Gainers
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            {topGainers.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">${formatPrice(coin.price)}</p>
                  <p className="text-xs font-medium text-success">+{coin.change24h.toFixed(2)}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-danger" /> Top Losers
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            {topLosers.map((coin) => (
              <button
                key={coin.id}
                onClick={() => navigate(`/trade/${coin.symbol}`)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">${formatPrice(coin.price)}</p>
                  <p className="text-xs font-medium text-danger">{coin.change24h.toFixed(2)}%</p>
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
