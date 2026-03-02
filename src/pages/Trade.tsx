import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice } from "@/data/coins";
import { addTransaction, Transaction } from "@/data/transactions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Trade = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest } = useAuth();
  const { coins } = useLiveMarket();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const coin = useMemo(() => coins.find((c) => c.symbol === (symbol || "BTC")) || coins[0], [symbol, coins]);
  const price = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : coin.price;
  const total = amount ? parseFloat(amount) * price : 0;

  const handleTrade = () => {
    if (!isAuthenticated) {
      if (isGuest) navigate("/login");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }

    const userBalance = user!.balance;
    if (side === "buy") {
      if ((userBalance.USDT || 0) < total) { toast.error("Insufficient USDT balance"); return; }
      userBalance.USDT = (userBalance.USDT || 0) - total;
      userBalance[coin.symbol] = (userBalance[coin.symbol] || 0) + parseFloat(amount);
    } else {
      if ((userBalance[coin.symbol] || 0) < parseFloat(amount)) { toast.error(`Insufficient ${coin.symbol} balance`); return; }
      userBalance[coin.symbol] = (userBalance[coin.symbol] || 0) - parseFloat(amount);
      userBalance.USDT = (userBalance.USDT || 0) + total;
    }

    // Save updated balance
    const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === user!.id);
    if (idx >= 0) { users[idx].balance = userBalance; localStorage.setItem("cryptox_all_users", JSON.stringify(users)); }
    localStorage.setItem("cryptox_user", JSON.stringify({ ...user!, balance: userBalance }));

    const txn: Transaction = {
      id: crypto.randomUUID(),
      type: side,
      coin: coin.symbol,
      amount: parseFloat(amount),
      price,
      total,
      date: new Date().toISOString(),
      status: "completed",
    };
    addTransaction(user!.id, txn);
    toast.success(`${side === "buy" ? "Bought" : "Sold"} ${amount} ${coin.symbol} for $${total.toFixed(2)}`);
    setAmount("");

    // Force re-render by updating user in context
    window.location.reload();
  };

  // Fake order book
  const orderBook = useMemo(() => {
    const asks = Array.from({ length: 10 }, (_, i) => ({
      price: coin.price + coin.price * 0.0001 * (i + 1),
      amount: Math.random() * 100 + 10,
    }));
    const bids = Array.from({ length: 10 }, (_, i) => ({
      price: coin.price - coin.price * 0.0001 * (i + 1),
      amount: Math.random() * 100 + 10,
    }));
    return { asks: asks.reverse(), bids };
  }, [coin]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <div className="flex items-center gap-2">
            <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-semibold text-foreground">{coin.symbol}/USDT</span>
          </div>
          <span className={`text-sm font-mono font-bold ${'priceDirection' in coin && (coin as any).priceDirection === "up" ? "text-success" : 'priceDirection' in coin && (coin as any).priceDirection === "down" ? "text-danger" : "text-foreground"}`}>
            ${formatPrice(coin.price)}
          </span>
          <span className={`text-xs font-medium ${coin.change24h >= 0 ? "text-success" : "text-danger"}`}>
            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* TradingView Widget */}
        <div className="glass-card rounded-xl overflow-hidden" style={{ height: 300 }}>
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=BINANCE:${coin.symbol}USDT&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=1a1e2e&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&showvolume=0&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
            className="w-full h-full border-0"
            title="TradingView Chart"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Price */}
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-foreground">${formatPrice(coin.price)}</p>
          <p className="text-sm text-muted-foreground">{coin.name}</p>
        </div>

        {/* Order Form */}
        <div className="glass-card rounded-xl p-4">
          {/* Buy/Sell Toggle */}
          <div className="flex rounded-lg bg-secondary overflow-hidden mb-4">
            <button onClick={() => setSide("buy")} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${side === "buy" ? "bg-success text-success-foreground" : "text-muted-foreground"}`}>
              Buy
            </button>
            <button onClick={() => setSide("sell")} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${side === "sell" ? "bg-danger text-danger-foreground" : "text-muted-foreground"}`}>
              Sell
            </button>
          </div>

          {/* Order Type */}
          <div className="flex gap-3 mb-4">
            <button onClick={() => setOrderType("market")} className={`text-sm font-medium ${orderType === "market" ? "text-foreground" : "text-muted-foreground"}`}>Market</button>
            <button onClick={() => setOrderType("limit")} className={`text-sm font-medium ${orderType === "limit" ? "text-foreground" : "text-muted-foreground"}`}>Limit</button>
          </div>

          {orderType === "limit" && (
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">Price (USDT)</label>
              <Input value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={formatPrice(coin.price)} type="number" className="bg-secondary border-border font-mono" />
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">Amount ({coin.symbol})</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="bg-secondary border-border font-mono" />
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-3">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button key={pct} onClick={() => {
                if (!isAuthenticated) return;
                const p = parseInt(pct) / 100;
                if (side === "buy") {
                  const avail = (user?.balance?.USDT || 0) * p / coin.price;
                  setAmount(avail.toFixed(6));
                } else {
                  const avail = (user?.balance?.[coin.symbol] || 0) * p;
                  setAmount(avail.toFixed(6));
                }
              }} className="flex-1 py-1.5 rounded text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground">
                {pct}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>Total</span>
            <span className="font-mono text-foreground">${total.toFixed(2)} USDT</span>
          </div>

          {isAuthenticated && (
            <div className="text-xs text-muted-foreground mb-3">
              Available: <span className="text-foreground font-mono">{side === "buy" ? `${(user?.balance?.USDT || 0).toFixed(2)} USDT` : `${(user?.balance?.[coin.symbol] || 0).toFixed(6)} ${coin.symbol}`}</span>
            </div>
          )}

          <Button onClick={handleTrade} className={`w-full font-semibold ${side === "buy" ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-danger hover:bg-danger/90 text-danger-foreground"}`}>
            {!isAuthenticated ? "Login to Trade" : `${side === "buy" ? "Buy" : "Sell"} ${coin.symbol}`}
          </Button>
        </div>

        {/* Order Book */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Book</h3>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-muted-foreground mb-1">Price (USDT)</div>
            <div className="text-muted-foreground mb-1 text-right">Amount</div>
            {orderBook.asks.map((a, i) => (
              <React.Fragment key={`ask-${i}`}>
                <div className="text-danger font-mono">{formatPrice(a.price)}</div>
                <div className="text-right font-mono text-muted-foreground">{a.amount.toFixed(2)}</div>
              </React.Fragment>
            ))}
            <div className="col-span-2 text-center py-1 text-lg font-bold font-mono text-foreground">
              {formatPrice(coin.price)}
            </div>
            {orderBook.bids.map((b, i) => (
              <React.Fragment key={`bid-${i}`}>
                <div className="text-success font-mono">{formatPrice(b.price)}</div>
                <div className="text-right font-mono text-muted-foreground">{b.amount.toFixed(2)}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
