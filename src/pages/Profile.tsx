import { useAuth } from "@/contexts/AuthContext";
import { COINS } from "@/data/coins";
import { getTransactions } from "@/data/transactions";
import { useNavigate } from "react-router-dom";
import { LogOut, Copy, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import { useMemo } from "react";

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const transactions = user ? getTransactions(user.id) : [];
  const exchangeHoldings = useMemo(() => {
    return Object.entries(user?.balance || {}).filter(([_, a]) => a > 0).map(([sym, amt]) => {
      const c = COINS.find((co) => co.symbol === sym);
      return { symbol: sym, amount: amt, value: amt * (c?.price || 1) };
    });
  }, [user]);
  const walletHoldings = useMemo(() => {
    return Object.entries(user?.walletBalance || {}).filter(([_, a]) => a > 0).map(([sym, amt]) => {
      const c = COINS.find((co) => co.symbol === sym);
      return { symbol: sym, amount: amt, value: amt * (c?.price || 1) };
    });
  }, [user]);
  const totalValue = exchangeHoldings.reduce((s, h) => s + h.value, 0) + walletHoldings.reduce((s, h) => s + h.value, 0);

  const handleLogout = () => {
    logout();
    navigate("/guest");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {isAdmin && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>}
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-foreground truncate flex-1">{user?.walletAddress}</p>
            <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ""); toast.success("Copied!"); }}>
              <Copy className="h-4 w-4 text-primary" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Wallet ID: {user?.walletId}</p>
        </div>

        {/* Portfolio Summary */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Portfolio</p>
            <p className="text-sm font-bold font-mono text-primary">${totalValue.toFixed(2)}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Exchange</p>
          {exchangeHoldings.map((h) => (
            <div key={h.symbol} className="flex items-center justify-between py-2 border-t border-border first:border-0">
              <span className="text-sm text-foreground">{h.symbol}</span>
              <div className="text-right">
                <span className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</span>
                <span className="text-xs text-muted-foreground ml-2">${h.value.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {walletHoldings.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-3 mb-2">Wallet</p>
              {walletHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between py-2 border-t border-border">
                  <span className="text-sm text-foreground">{h.symbol}</span>
                  <div className="text-right">
                    <span className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</span>
                    <span className="text-xs text-muted-foreground ml-2">${h.value.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Menu Items */}
        <div className="glass-card rounded-xl overflow-hidden">
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 border-b border-border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Admin Panel</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 text-danger">
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Transactions</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            {transactions.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No transactions</p>}
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-mono ${["buy", "deposit", "receive"].includes(tx.type) ? "text-success" : "text-danger"}`}>
                  {["buy", "deposit", "receive"].includes(tx.type) ? "+" : "-"}{tx.amount.toFixed(4)} {tx.coin}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
