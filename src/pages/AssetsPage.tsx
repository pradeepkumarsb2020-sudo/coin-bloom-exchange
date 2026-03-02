import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice } from "@/data/coins";
import { getTransactions } from "@/data/transactions";
import { ArrowUp, ArrowDown, Clock, Copy, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";

const AssetsPage = () => {
  const { user } = useAuth();
  const { coins } = useLiveMarket();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"tokens" | "history">("tokens");

  const walletHoldings = useMemo(() => {
    return Object.entries(user?.walletBalance || {})
      .filter(([_, amt]) => amt > 0)
      .map(([sym, amt]) => {
        const c = coins.find((co) => co.symbol === sym);
        const price = c?.price || (sym === "USDT" ? 1 : 0);
        const change = c?.change24h || 0;
        return { symbol: sym, name: c?.name || sym, amount: amt, value: amt * price, price, change, image: c?.image };
      })
      .sort((a, b) => b.value - a.value);
  }, [user, coins]);

  const totalWalletValue = walletHoldings.reduce((s, h) => s + h.value, 0);
  const transactions = user ? getTransactions(user.id) : [];

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Assets</h1>
          <div className="flex bg-secondary rounded-lg overflow-hidden">
            <button onClick={() => navigate("/wallet")} className="text-xs text-muted-foreground px-4 py-1.5 font-medium hover:text-foreground transition-colors">
              Exchange
            </button>
            <span className="text-xs bg-primary text-primary-foreground px-4 py-1.5 font-semibold">
              Wallet
            </span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-[9px] font-bold">W3</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-6)}
          </span>
          <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ""); toast.success("Copied!"); }}>
            <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Total Balance */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">Total Wallet Value</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            ${totalWalletValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground">≈ ₹{(totalWalletValue * 83.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between px-2">
          {[
            { icon: ArrowUp, label: "Send", onClick: () => navigate("/wallet?tab=transfer") },
            { icon: ArrowDown, label: "Receive", onClick: () => navigate("/wallet?tab=deposit") },
            { icon: Clock, label: "History", onClick: () => setTab("history") },
            { icon: ArrowLeftRight, label: "Transfer", onClick: () => navigate("/wallet?tab=internal") },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} className="flex flex-col items-center gap-1.5">
              <div className="h-11 w-11 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                <item.icon className="h-4.5 w-4.5 text-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border">
          <button onClick={() => setTab("tokens")} className={`text-sm font-medium pb-2 relative transition-colors ${tab === "tokens" ? "text-foreground" : "text-muted-foreground"}`}>
            Tokens
            {tab === "tokens" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button onClick={() => setTab("history")} className={`text-sm font-medium pb-2 relative transition-colors ${tab === "history" ? "text-foreground" : "text-muted-foreground"}`}>
            History
            {tab === "history" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>

        {tab === "tokens" && (
          <div className="space-y-0">
            {walletHoldings.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No wallet assets</p>
                <p className="text-[10px] text-muted-foreground mt-1">Transfer funds from Exchange to get started</p>
                <button onClick={() => navigate("/wallet?tab=internal")} className="mt-3 text-xs text-primary font-semibold bg-primary/10 rounded-lg px-4 py-2">
                  Transfer Now →
                </button>
              </div>
            )}
            {walletHoldings.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {h.image ? (
                    <img src={h.image} alt={h.symbol} className="h-9 w-9 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {h.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">
                      ${formatPrice(h.price)}{" "}
                      <span className={h.change >= 0 ? "text-success" : "text-danger"}>
                        {h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</p>
                  <p className="text-[10px] text-muted-foreground">${h.value.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-0">
            {transactions.length === 0 && <p className="py-10 text-center text-xs text-muted-foreground">No transactions yet</p>}
            {transactions.slice(0, 30).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${["buy", "deposit", "receive"].includes(tx.type) ? "bg-success/10" : "bg-danger/10"}`}>
                    {["buy", "deposit", "receive"].includes(tx.type)
                      ? <ArrowDown className="h-4 w-4 text-success" />
                      : <ArrowUp className="h-4 w-4 text-danger" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono ${["buy", "deposit", "receive"].includes(tx.type) ? "text-success" : "text-danger"}`}>
                    {["buy", "deposit", "receive"].includes(tx.type) ? "+" : "-"}{tx.amount.toFixed(4)} {tx.coin}
                  </p>
                  <p className="text-[10px] text-muted-foreground">${tx.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsPage;
