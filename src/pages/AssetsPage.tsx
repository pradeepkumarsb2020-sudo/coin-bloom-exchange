import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveMarket } from "@/contexts/MarketContext";
import { formatPrice } from "@/data/coins";
import { getTransactions } from "@/data/transactions";
import { ArrowUp, ArrowDown, Clock, Copy, Menu, ArrowLeftRight } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Assets</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/wallet")} className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full hover:text-foreground transition-colors">
              Exchange
            </button>
            <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium">
              Wallet
            </span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-[10px] font-bold">W</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-6)}
          </span>
          <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ""); toast.success("Copied!"); }}>
            <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Total Balance */}
        <p className="text-4xl font-bold text-foreground font-mono">
          ${totalWalletValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-between px-4">
          {[
            { icon: ArrowUp, label: "Send", onClick: () => navigate("/wallet?tab=transfer") },
            { icon: ArrowDown, label: "Receive", onClick: () => navigate("/wallet?tab=deposit") },
            { icon: Clock, label: "History", onClick: () => setTab("history") },
            { icon: ArrowLeftRight, label: "Transfer", onClick: () => navigate("/wallet?tab=internal") },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <item.icon className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-border" />

        {/* Tabs */}
        <div className="flex gap-6">
          <button onClick={() => setTab("tokens")} className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${tab === "tokens" ? "text-foreground border-primary" : "text-muted-foreground border-transparent"}`}>
            Tokens
          </button>
          <button onClick={() => setTab("history")} className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${tab === "history" ? "text-foreground border-primary" : "text-muted-foreground border-transparent"}`}>
            History
          </button>
        </div>

        {tab === "tokens" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Assets</p>
              <p className="text-sm font-mono text-foreground">${totalWalletValue.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              {walletHoldings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No wallet assets</p>
                  <p className="text-xs text-muted-foreground mt-1">Transfer funds from Exchange to get started</p>
                  <button onClick={() => navigate("/wallet?tab=internal")} className="mt-3 text-sm text-primary font-medium">
                    Transfer Now →
                  </button>
                </div>
              )}
              {walletHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {h.image ? (
                      <img src={h.image} alt={h.symbol} className="h-10 w-10 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {h.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        ${formatPrice(h.price)}{" "}
                        <span className={h.change >= 0 ? "text-success" : "text-danger"}>
                          {h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</p>
                    <p className="text-xs text-muted-foreground">${h.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "history" && (
          <div className="space-y-1">
            {transactions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet</p>}
            {transactions.slice(0, 30).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${["buy", "deposit", "receive"].includes(tx.type) ? "bg-success/10" : "bg-danger/10"}`}>
                    {["buy", "deposit", "receive"].includes(tx.type)
                      ? <ArrowDown className="h-4 w-4 text-success" />
                      : <ArrowUp className="h-4 w-4 text-danger" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${["buy", "deposit", "receive"].includes(tx.type) ? "text-success" : "text-danger"}`}>
                    {["buy", "deposit", "receive"].includes(tx.type) ? "+" : "-"}{tx.amount.toFixed(4)} {tx.coin}
                  </p>
                  <p className="text-xs text-muted-foreground">${tx.total.toFixed(2)}</p>
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
