import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice } from "@/data/coins";
import { addTransaction, getTransactions, Transaction } from "@/data/transactions";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const INTERVALS = [
  { label: "15m", value: "15" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const LS_KEY_TAB = "trade_bottom_tab";
const LS_KEY_SIDE = "trade_side";
const LS_KEY_AMOUNT = "trade_amount";

const Trade = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isGuest, updateBalance } = useAuth();
  const { coins } = useLiveMarket();

  // Restore persisted state
  const [side, setSide] = useState<"buy" | "sell">(() => {
    const saved = localStorage.getItem(LS_KEY_SIDE);
    return saved === "sell" ? "sell" : "buy";
  });
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState(() => localStorage.getItem(LS_KEY_AMOUNT) || "");
  const [limitPrice, setLimitPrice] = useState("");
  const [chartInterval, setChartInterval] = useState("60");
  const [chartLoading, setChartLoading] = useState(false);
  const [bottomTab, setBottomTab] = useState<"orders" | "holdings" | "history">(() => {
    const saved = localStorage.getItem(LS_KEY_TAB);
    if (saved === "orders" || saved === "holdings" || saved === "history") return saved;
    return "orders";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedPrice, setHighlightedPrice] = useState<number | null>(null);
  const submitLockRef = useRef(false);

  // Persist side, amount, tab
  useEffect(() => { localStorage.setItem(LS_KEY_SIDE, side); }, [side]);
  useEffect(() => { localStorage.setItem(LS_KEY_AMOUNT, amount); }, [amount]);
  useEffect(() => { localStorage.setItem(LS_KEY_TAB, bottomTab); }, [bottomTab]);

  const coin = useMemo(() => coins.find((c) => c.symbol === (symbol || "BTC")) || coins[0], [symbol, coins]);
  const price = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : coin.price;
  const parsedAmount = parseFloat(amount);
  const total = amount && !isNaN(parsedAmount) ? parsedAmount * price : 0;

  // Validation
  const isInputValid = useMemo(() => {
    if (!isAuthenticated) return false;
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) return false;
    if (orderType === "limit" && (!limitPrice || isNaN(parseFloat(limitPrice)) || parseFloat(limitPrice) <= 0)) return false;
    if (side === "buy" && (user?.balance?.USDT || 0) < total) return false;
    if (side === "sell" && (user?.balance?.[coin.symbol] || 0) < parsedAmount) return false;
    return true;
  }, [isAuthenticated, amount, parsedAmount, orderType, limitPrice, side, user, coin, total]);

  // Input sanitization - only allow valid number chars
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setAmount(val);
  }, []);

  const handleLimitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setLimitPrice(val);
  }, []);

  // Chart interval switch with loading indicator
  const handleIntervalChange = useCallback((value: string) => {
    if (value === chartInterval) return;
    setChartLoading(true);
    setChartInterval(value);
  }, [chartInterval]);

  const handleTrade = useCallback(async () => {
    if (submitLockRef.current) return;
    if (!isAuthenticated) {
      if (isGuest) navigate("/login");
      return;
    }
    if (!amount || parsedAmount <= 0) { toast.error("Enter a valid amount"); return; }
    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) { toast.error("Enter a valid limit price"); return; }

    const currentBalance = { ...user!.balance };
    const amt = parsedAmount;

    if (side === "buy") {
      if ((currentBalance.USDT || 0) < total) { toast.error("Insufficient USDT balance"); return; }
      currentBalance.USDT = (currentBalance.USDT || 0) - total;
      currentBalance[coin.symbol] = (currentBalance[coin.symbol] || 0) + amt;
    } else {
      if ((currentBalance[coin.symbol] || 0) < amt) { toast.error(`Insufficient ${coin.symbol} balance`); return; }
      currentBalance[coin.symbol] = (currentBalance[coin.symbol] || 0) - amt;
      currentBalance.USDT = (currentBalance.USDT || 0) + total;
    }

    Object.keys(currentBalance).forEach(k => {
      if (currentBalance[k] <= 0 && k !== "USDT") delete currentBalance[k];
    });

    // Simulate brief processing
    submitLockRef.current = true;
    setIsSubmitting(true);

    await new Promise(r => setTimeout(r, 600));

    updateBalance(currentBalance);

    const txn: Transaction = {
      id: crypto.randomUUID(),
      type: side,
      coin: coin.symbol,
      amount: amt,
      price,
      total,
      date: new Date().toISOString(),
      status: "completed",
    };
    addTransaction(user!.id, txn);
    toast.success(`Order placed successfully — ${side === "buy" ? "Bought" : "Sold"} ${amount} ${coin.symbol} for $${total.toFixed(2)}`);
    setAmount("");
    localStorage.removeItem(LS_KEY_AMOUNT);
    if (orderType === "limit") setLimitPrice("");

    setIsSubmitting(false);
    submitLockRef.current = false;
  }, [isAuthenticated, isGuest, amount, parsedAmount, limitPrice, orderType, side, user, coin, total, price, navigate, updateBalance]);

  const handleOrderBookClick = useCallback((clickedPrice: number) => {
    setOrderType("limit");
    setLimitPrice(formatPrice(clickedPrice));
    setHighlightedPrice(clickedPrice);
    setTimeout(() => setHighlightedPrice(null), 800);
  }, []);

  // Stable order book (only recalc on coin symbol change, not price ticks)
  const orderBook = useMemo(() => {
    const basePrice = coin.price;
    const asks = Array.from({ length: 8 }, (_, i) => ({
      price: basePrice + basePrice * 0.0001 * (i + 1),
      amount: Math.random() * 100 + 10,
    }));
    const bids = Array.from({ length: 8 }, (_, i) => ({
      price: basePrice - basePrice * 0.0001 * (i + 1),
      amount: Math.random() * 100 + 10,
    }));
    return { asks: asks.reverse(), bids };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.symbol]);

  const holdings = useMemo(() => {
    if (!user) return [];
    return Object.entries(user.balance)
      .filter(([_, amt]) => amt > 0)
      .map(([sym, amt]) => {
        const c = coins.find(co => co.symbol === sym);
        return { symbol: sym, amount: amt, value: amt * (c?.price || (sym === "USDT" ? 1 : 0)) };
      });
  }, [user, coins]);

  const transactions = user ? getTransactions(user.id).filter(t => t.coin === coin.symbol).slice(0, 10) : [];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-12 px-4 max-w-4xl mx-auto gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <div className="flex items-center gap-2">
            <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-semibold text-sm text-foreground">{coin.symbol}/USDT</span>
          </div>
          <span className={`text-sm font-mono font-bold ${'priceDirection' in coin && (coin as any).priceDirection === "up" ? "text-success" : 'priceDirection' in coin && (coin as any).priceDirection === "down" ? "text-danger" : "text-foreground"}`}>
            ${formatPrice(coin.price)}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${coin.change24h >= 0 ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"}`}>
            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
        {/* Chart Timeframe Buttons */}
        <div className="flex gap-1.5">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => handleIntervalChange(iv.value)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                chartInterval === iv.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card rounded-xl overflow-hidden border border-border relative" style={{ height: 280 }}>
          {chartLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          <iframe
            key={chartInterval}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=BINANCE:${coin.symbol}USDT&interval=${chartInterval}&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0B0E11&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&showvolume=0&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
            className="w-full h-full border-0"
            title="TradingView Chart"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => setChartLoading(false)}
          />
        </div>

        {/* Trading Panel + Order Book */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Order Form */}
          <div className="bg-card rounded-xl p-4 border border-border md:flex-1">
            {/* Buy/Sell Toggle */}
            <div className="flex rounded-lg overflow-hidden mb-3 bg-secondary">
              <button onClick={() => setSide("buy")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${side === "buy" ? "bg-success text-success-foreground" : "text-muted-foreground"}`}>
                Buy
              </button>
              <button onClick={() => setSide("sell")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${side === "sell" ? "bg-danger text-danger-foreground" : "text-muted-foreground"}`}>
                Sell
              </button>
            </div>

            {/* Order Type Tabs */}
            <div className="flex gap-4 mb-3 border-b border-border">
              <button onClick={() => setOrderType("limit")} className={`pb-2 text-xs font-medium relative ${orderType === "limit" ? "text-foreground" : "text-muted-foreground"}`}>
                Limit
                {orderType === "limit" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
              <button onClick={() => setOrderType("market")} className={`pb-2 text-xs font-medium relative ${orderType === "market" ? "text-foreground" : "text-muted-foreground"}`}>
                Market
                {orderType === "market" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            </div>

            {orderType === "limit" && (
              <div className="mb-2">
                <label className="text-[10px] text-muted-foreground mb-1 block">Price (USDT)</label>
                <Input value={limitPrice} onChange={handleLimitPriceChange} placeholder={formatPrice(coin.price)} type="text" inputMode="decimal" className="bg-secondary border-border font-mono h-9 text-sm" />
              </div>
            )}

            <div className="mb-2">
              <label className="text-[10px] text-muted-foreground mb-1 block">Amount ({coin.symbol})</label>
              <Input value={amount} onChange={handleAmountChange} placeholder="0.00" type="text" inputMode="decimal" className="bg-secondary border-border font-mono h-9 text-sm" />
            </div>

            {/* Quick amounts */}
            <div className="flex gap-1.5 mb-3">
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
                }} className="flex-1 py-1.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors">
                  {pct}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mb-3">
              <span>Total</span>
              <span className="font-mono text-foreground">${total.toFixed(2)} USDT</span>
            </div>

            {isAuthenticated && (
              <div className="text-[10px] text-muted-foreground mb-3">
                Avbl: <span className="text-foreground font-mono">{side === "buy" ? `${(user?.balance?.USDT || 0).toFixed(2)} USDT` : `${(user?.balance?.[coin.symbol] || 0).toFixed(6)} ${coin.symbol}`}</span>
              </div>
            )}

            <Button
              onClick={handleTrade}
              disabled={isAuthenticated && (!isInputValid || isSubmitting)}
              className={`w-full font-semibold h-10 ${side === "buy" ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-danger hover:bg-danger/90 text-danger-foreground"}`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !isAuthenticated ? "Log In to Trade" : `${side === "buy" ? "Buy" : "Sell"} ${coin.symbol}`}
            </Button>
          </div>

          {/* Order Book */}
          <div className="bg-card rounded-xl p-3 border border-border md:w-[260px] md:flex-shrink-0">
            <h3 className="text-xs font-semibold text-foreground mb-2">Order Book</h3>
            <div className="grid grid-cols-2 gap-0.5 text-[10px]">
              <div className="text-muted-foreground mb-1">Price (USDT)</div>
              <div className="text-muted-foreground mb-1 text-right">Amount</div>
              {orderBook.asks.map((a, i) => (
                <React.Fragment key={`ask-${i}`}>
                  <div
                    className={`text-danger font-mono py-0.5 cursor-pointer hover:underline transition-colors ${highlightedPrice === a.price ? "bg-danger/20 rounded" : ""}`}
                    onClick={() => handleOrderBookClick(a.price)}
                  >{formatPrice(a.price)}</div>
                  <div className="text-right font-mono text-muted-foreground py-0.5">{a.amount.toFixed(2)}</div>
                </React.Fragment>
              ))}
              <div className="col-span-2 text-center py-1.5 text-base font-bold font-mono text-foreground">
                {formatPrice(coin.price)}
              </div>
              {orderBook.bids.map((b, i) => (
                <React.Fragment key={`bid-${i}`}>
                  <div
                    className={`text-success font-mono py-0.5 cursor-pointer hover:underline transition-colors ${highlightedPrice === b.price ? "bg-success/20 rounded" : ""}`}
                    onClick={() => handleOrderBookClick(b.price)}
                  >{formatPrice(b.price)}</div>
                  <div className="text-right font-mono text-muted-foreground py-0.5">{b.amount.toFixed(2)}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {(["orders", "holdings", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBottomTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                  bottomTab === t ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "orders" ? "Open Orders" : t === "holdings" ? "Holdings" : "History"}
                {bottomTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-3 min-h-[80px]">
            {bottomTab === "orders" && (
              <p className="text-xs text-muted-foreground text-center py-4">No open orders</p>
            )}

            {bottomTab === "holdings" && (
              <div>
                {holdings.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No holdings</p>
                ) : (
                  holdings.map((h) => (
                    <div key={h.symbol} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-xs font-semibold text-foreground">{h.symbol}</span>
                      <div className="text-right">
                        <p className="text-xs font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</p>
                        <p className="text-[10px] text-muted-foreground">${h.value.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {bottomTab === "history" && (
              <div>
                {transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No trade history for {coin.symbol}</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-mono ${tx.type === "buy" ? "text-success" : "text-danger"}`}>
                          {tx.type === "buy" ? "+" : "-"}{tx.amount.toFixed(4)} {tx.coin}
                        </p>
                        <p className="text-[10px] text-muted-foreground">${tx.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
