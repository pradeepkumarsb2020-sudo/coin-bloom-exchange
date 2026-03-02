import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { COINS, formatPrice } from "@/data/coins";
import { addTransaction, getTransactions, Transaction } from "@/data/transactions";
import { Copy, ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";

type WalletTab = "assets" | "deposit" | "withdraw" | "transfer" | "history";

const WalletPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<WalletTab>("assets");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const coin = COINS.find((c) => c.symbol === selectedCoin) || COINS[2];
  const transactions = user ? getTransactions(user.id) : [];

  const holdings = Object.entries(user?.balance || {}).filter(([_, amt]) => amt > 0).map(([sym, amt]) => {
    const c = COINS.find((co) => co.symbol === sym);
    return { symbol: sym, amount: amt, value: amt * (c?.price || 1), price: c?.price || 1 };
  });

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);

  const doWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter valid amount"); return; }
    if (!withdrawAddr) { toast.error("Enter withdraw address"); return; }
    if ((user!.balance[selectedCoin] || 0) < parseFloat(amount)) { toast.error("Insufficient balance"); return; }
    setPendingAction(() => () => {
      user!.balance[selectedCoin] -= parseFloat(amount);
      const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
      const idx = users.findIndex((u: any) => u.id === user!.id);
      if (idx >= 0) { users[idx].balance = user!.balance; localStorage.setItem("cryptox_all_users", JSON.stringify(users)); }
      localStorage.setItem("cryptox_user", JSON.stringify(user));
      addTransaction(user!.id, {
        id: crypto.randomUUID(), type: "withdraw", coin: selectedCoin, amount: parseFloat(amount),
        price: coin.price, total: parseFloat(amount) * coin.price, date: new Date().toISOString(),
        status: "completed", to: withdrawAddr, network: selectedNetwork,
      });
      toast.success(`Withdrew ${amount} ${selectedCoin}`);
      setAmount(""); setWithdrawAddr("");
    });
    setShowConfirm(true);
  };

  const doTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter valid amount"); return; }
    if (!transferTo) { toast.error("Enter recipient"); return; }
    if ((user!.balance[selectedCoin] || 0) < parseFloat(amount)) { toast.error("Insufficient balance"); return; }
    const allUsers = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const receiver = allUsers.find((u: any) => u.username === transferTo || u.walletAddress === transferTo);
    if (!receiver) { toast.error("User not found"); return; }
    if (receiver.id === user!.id) { toast.error("Cannot transfer to yourself"); return; }

    setPendingAction(() => () => {
      user!.balance[selectedCoin] -= parseFloat(amount);
      receiver.balance[selectedCoin] = (receiver.balance[selectedCoin] || 0) + parseFloat(amount);
      const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
      const sIdx = users.findIndex((u: any) => u.id === user!.id);
      const rIdx = users.findIndex((u: any) => u.id === receiver.id);
      if (sIdx >= 0) users[sIdx].balance = user!.balance;
      if (rIdx >= 0) users[rIdx].balance = receiver.balance;
      localStorage.setItem("cryptox_all_users", JSON.stringify(users));
      localStorage.setItem("cryptox_user", JSON.stringify(user));
      addTransaction(user!.id, { id: crypto.randomUUID(), type: "send", coin: selectedCoin, amount: parseFloat(amount), price: coin.price, total: parseFloat(amount) * coin.price, date: new Date().toISOString(), status: "completed", to: receiver.username });
      addTransaction(receiver.id, { id: crypto.randomUUID(), type: "receive", coin: selectedCoin, amount: parseFloat(amount), price: coin.price, total: parseFloat(amount) * coin.price, date: new Date().toISOString(), status: "completed", from: user!.username });
      toast.success(`Sent ${amount} ${selectedCoin} to ${receiver.username}`);
      setAmount(""); setTransferTo("");
    });
    setShowConfirm(true);
  };

  const doDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter valid amount"); return; }
    user!.balance[selectedCoin] = (user!.balance[selectedCoin] || 0) + parseFloat(amount);
    const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === user!.id);
    if (idx >= 0) { users[idx].balance = user!.balance; localStorage.setItem("cryptox_all_users", JSON.stringify(users)); }
    localStorage.setItem("cryptox_user", JSON.stringify(user));
    addTransaction(user!.id, { id: crypto.randomUUID(), type: "deposit", coin: selectedCoin, amount: parseFloat(amount), price: coin.price, total: parseFloat(amount) * coin.price, date: new Date().toISOString(), status: "completed", network: selectedNetwork });
    toast.success(`Deposited ${amount} ${selectedCoin}`);
    setAmount("");
  };

  const confirmAction = () => {
    if (!confirmPassword) { toast.error("Enter password"); return; }
    pendingAction?.();
    setShowConfirm(false);
    setConfirmPassword("");
    setPendingAction(null);
  };

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success("Address copied!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Balance */}
        <div className="glass-card rounded-xl p-5 glow-primary">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-3xl font-bold font-mono text-foreground">${totalValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Wallet: {user?.walletAddress?.slice(0, 10)}...{user?.walletAddress?.slice(-6)}</p>
          <button onClick={() => copyAddr(user?.walletAddress || "")} className="mt-1 text-xs text-primary flex items-center gap-1">
            <Copy className="h-3 w-3" /> Copy Address
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(["assets", "deposit", "withdraw", "transfer", "history"] as WalletTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "assets" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {holdings.length === 0 && <p className="p-4 text-center text-muted-foreground text-sm">No assets yet</p>}
            {holdings.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                  <p className="text-xs text-muted-foreground">${formatPrice(h.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</p>
                  <p className="text-xs text-muted-foreground">${h.value.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "deposit" && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Coin</label>
              <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {COINS.slice(0, 30).map((c) => <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Network</label>
              <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {coin.networks.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Deposit Address ({selectedNetwork})</p>
              <p className="text-xs font-mono text-foreground break-all">{coin.depositAddress}</p>
              <button onClick={() => copyAddr(coin.depositAddress)} className="mt-2 text-xs text-primary flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="bg-secondary border-border font-mono" />
            </div>
            <Button onClick={doDeposit} className="w-full bg-primary text-primary-foreground font-semibold">
              <ArrowDownLeft className="h-4 w-4 mr-2" /> Deposit
            </Button>
          </div>
        )}

        {tab === "withdraw" && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Coin</label>
              <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {COINS.slice(0, 30).map((c) => <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Network</label>
              <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {coin.networks.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Withdraw Address</label>
              <Input value={withdrawAddr} onChange={(e) => setWithdrawAddr(e.target.value)} placeholder="0x..." className="bg-secondary border-border font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (Available: {(user?.balance?.[selectedCoin] || 0).toFixed(4)})</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="bg-secondary border-border font-mono" />
            </div>
            <Button onClick={doWithdraw} className="w-full bg-danger text-danger-foreground font-semibold">
              <ArrowUpRight className="h-4 w-4 mr-2" /> Withdraw
            </Button>
          </div>
        )}

        {tab === "transfer" && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Coin</label>
              <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {COINS.slice(0, 30).map((c) => <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Recipient (Username or Wallet Address)</label>
              <Input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="username or 0x..." className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (Available: {(user?.balance?.[selectedCoin] || 0).toFixed(4)})</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="bg-secondary border-border font-mono" />
            </div>
            <Button onClick={doTransfer} className="w-full bg-primary text-primary-foreground font-semibold">
              <Send className="h-4 w-4 mr-2" /> Send
            </Button>
          </div>
        )}

        {tab === "history" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {transactions.length === 0 && <p className="p-4 text-center text-muted-foreground text-sm">No transactions yet</p>}
            {transactions.slice(0, 50).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    ["buy", "deposit", "receive"].includes(tx.type) ? "bg-success/10" : "bg-danger/10"
                  }`}>
                    {["buy", "deposit", "receive"].includes(tx.type)
                      ? <ArrowDownLeft className="h-4 w-4 text-success" />
                      : <ArrowUpRight className="h-4 w-4 text-danger" />}
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

      {/* Confirm Password Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Security Verification</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Enter your password to confirm this action.</p>
          <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Password" className="bg-secondary border-border" />
          <div className="flex gap-3">
            <Button onClick={confirmAction} className="flex-1 bg-primary text-primary-foreground">Confirm</Button>
            <Button onClick={() => setShowConfirm(false)} variant="outline" className="flex-1 border-border text-foreground">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletPage;
