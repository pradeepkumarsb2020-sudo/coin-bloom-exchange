import { useState, useMemo } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import { COINS } from "@/data/coins";
import { getTransactions } from "@/data/transactions";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, BarChart3, Activity, Search, Ban, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type AdminTab = "overview" | "users" | "transactions" | "coins";

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");

  const allUsers: User[] = useMemo(() => JSON.parse(localStorage.getItem("cryptox_all_users") || "[]"), []);

  const allTransactions = useMemo(() => {
    return allUsers.flatMap((u) => getTransactions(u.id).map((tx) => ({ ...tx, user: u.username }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    if (!search) return allUsers;
    const s = search.toLowerCase();
    return allUsers.filter((u) => u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }, [allUsers, search]);

  const stats = useMemo(() => ({
    totalUsers: allUsers.length,
    totalTransactions: allTransactions.length,
    totalVolume: allTransactions.reduce((s, t) => s + t.total, 0),
    activeToday: allTransactions.filter((t) => new Date(t.date).toDateString() === new Date().toDateString()).length,
  }), [allUsers, allTransactions]);

  const suspendUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx >= 0) {
      users[idx].suspended = !users[idx].suspended;
      localStorage.setItem("cryptox_all_users", JSON.stringify(users));
      toast.success(users[idx].suspended ? "User suspended" : "User unsuspended");
    }
  };

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <span className="font-semibold text-foreground">Admin Panel</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {(["overview", "users", "transactions", "coins"] as AdminTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
              { label: "Transactions", value: stats.totalTransactions, icon: Activity, color: "text-success" },
              { label: "Total Volume", value: `$${(stats.totalVolume / 1000).toFixed(1)}K`, icon: BarChart3, color: "text-primary" },
              { label: "Active Today", value: stats.activeToday, icon: Activity, color: "text-success" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-10 bg-secondary border-border" />
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              {filteredUsers.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No users found</p>}
              {filteredUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Balance: ${Object.entries(u.balance).reduce((s, [sym, amt]) => {
                      const c = COINS.find((co) => co.symbol === sym);
                      return s + amt * (c?.price || 1);
                    }, 0).toFixed(2)}</p>
                  </div>
                  <button onClick={() => suspendUser(u.id)} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground">
                    {(u as any).suspended ? <CheckCircle className="h-4 w-4 text-success" /> : <Ban className="h-4 w-4 text-danger" />}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "transactions" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {allTransactions.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No transactions</p>}
            {allTransactions.slice(0, 50).map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{tx.type} · {(tx as any).user}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${["buy", "deposit", "receive"].includes(tx.type) ? "text-success" : "text-danger"}`}>
                    {tx.amount.toFixed(4)} {tx.coin}
                  </p>
                  <p className="text-xs text-muted-foreground">${tx.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "coins" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {COINS.slice(0, 50).map((coin) => (
              <div key={coin.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">${coin.price.toLocaleString()}</p>
                  <p className={`text-xs ${coin.change24h >= 0 ? "text-success" : "text-danger"}`}>{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
