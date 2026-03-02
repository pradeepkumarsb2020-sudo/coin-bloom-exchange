import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveMarket } from "@/contexts/MarketContext";
import { COINS, formatPrice } from "@/data/coins";
import { addTransaction, getTransactions } from "@/data/transactions";
import { Copy, ArrowUpRight, ArrowDownLeft, Send, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "@/components/TopBar";

type WalletTab = "assets" | "deposit" | "withdraw" | "transfer" | "internal" | "history";

const WalletPage = () => {
  const { user, transferBetweenAccounts } = useAuth();
  const { coins } = useLiveMarket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as WalletTab) || "assets";

  const [tab, setTab] = useState<WalletTab>(initialTab);
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferDirection, setTransferDirection] = useState<"toWallet" | "toExchange">("toWallet");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as WalletTab;
    if (t) setTab(t);
  }, [searchParams]);

  const coin = COINS.find((c) => c.symbol === selectedCoin) || COINS[2];
  const transactions = user ? getTransactions(user.id) : [];

  const holdings = Object.entries(user?.balance || {}).filter(([_, amt]) => amt > 0).map(([sym, amt]) => {
    const c = coins.find((co) => co.symbol === sym);
    const price = c?.price || (sym === "USDT" ? 1 : 0);
    return { symbol: sym, amount: amt, value: amt * price, price };
  });
  const totalValue = holdings.reduce((s, h) => s + h.value, 0);

  const doInternalTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter valid amount"); return; }
    const src = transferDirection === "toWallet" ? (user!.balance[selectedCoin] || 0) : (user!.walletBalance[selectedCoin] || 0);
    if (src < parseFloat(amount)) { toast.error("Insufficient balance"); return; }
    const success = transferBetweenAccounts(selectedCoin, parseFloat(amount), transferDirection);
    if (success) {
      addTransaction(user!.id, {
        id: crypto.randomUUID(),
        type: transferDirection === "toWallet" ? "send" : "receive",
        coin: selectedCoin,
        amount: parseFloat(amount),
        price: coin.price,
        total: parseFloat(amount) * coin.price,
        date: new Date().toISOString(),
        status: "completed",
        from: transferDirection === "toWallet" ? "Exchange" : "Wallet",
        to: transferDirection === "toWallet" ? "Wallet" : "Exchange",
      });
      toast.success(`Transferred ${amount} ${selectedCoin} ${transferDirection === "toWallet" ? "to Wallet" : "to Exchange"}`);
      setAmount("");
    } else {
      toast.error("Transfer failed");
    }
  };

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
      addTransaction(user!.id, { id: crypto.randomUUID(), type: "withdraw", coin: selectedCoin, amount: parseFloat(amount), price: coin.price, total: parseFloat(amount) * coin.price, date: new Date().toISOString(), status: "completed", to: withdrawAddr, network: selectedNetwork });
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

  const srcBalance = transferDirection === "toWallet" ? (user?.balance?.[selectedCoin] || 0) : (user?.walletBalance?.[selectedCoin] || 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header with Exchange/Wallet toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Exchange</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium">
              Exchange
            </span>
            <button onClick={() => navigate("/assets")} className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full hover:text-foreground transition-colors">
              Wallet
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="glass-card rounded-xl p-5 glow-primary">
          <p className="text-sm text-muted-foreground">Exchange Balance</p>
          <p className="text-3xl font-bold font-mono text-foreground">${totalValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Wallet: {user?.walletAddress?.slice(0, 10)}...{user?.walletAddress?.slice(-6)}</p>
          <button onClick={() => { navigator.clipboard.writeText(user?.walletAddress || ""); toast.success("Address copied!"); }} className="mt-1 text-xs text-primary flex items-center gap-1">
            <Copy className="h-3 w-3" /> Copy Address
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(["assets", "deposit", "withdraw", "transfer", "internal", "history"] as WalletTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {t === "internal" ? "Exchange↔Wallet" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Assets Tab */}
        {tab === "assets" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {holdings.length === 0 && <p className="p-4 text-center text-muted-foreground text-sm">No assets yet</p>}
            {holdings.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div><p className="text-sm font-semibold text-foreground">{h.symbol}</p><p className="text-xs text-muted-foreground">${formatPrice(h.price)}</p></div>
                <div className="text-right"><p className="text-sm font-mono text-foreground">{h.amount.toFixed(h.amount < 1 ? 6 : 2)}</p><p className="text-xs text-muted-foreground">${h.value.toFixed(2)}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Internal Transfer Tab (Exchange ↔ Wallet) */}
        {tab === "internal" && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            {/* Direction Toggle */}
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <div className="flex-1 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">From</p>
                <p className="text-sm font-semibold text-foreground">{transferDirection === "toWallet" ? "Exchange" : "Wallet"}</p>
              </div>
              <button onClick={() => setTransferDirection(d => d === "toWallet" ? "toExchange" : "toWallet")} className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">To</p>
                <p className="text-sm font-semibold text-foreground">{transferDirection === "toWallet" ? "Wallet" : "Exchange"}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Coin</label>
              <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm">
                {COINS.slice(0, 30).map((c) => <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Amount (Available: {srcBalance.toFixed(4)} {selectedCoin})
              </label>
              <div className="flex gap-2">
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" className="bg-secondary border-border font-mono flex-1" />
                <Button variant="outline" size="sm" onClick={() => setAmount(srcBalance.toString())} className="border-border text-xs">MAX</Button>
              </div>
            </div>

            <Button onClick={doInternalTransfer} className="w-full bg-primary text-primary-foreground font-semibold">
              <ArrowLeftRight className="h-4 w-4 mr-2" /> Transfer
            </Button>
          </div>
        )}

        {/* Deposit Tab */}
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
              <button onClick={() => { navigator.clipboard.writeText(coin.depositAddress); toast.success("Copied!"); }} className="mt-2 text-xs text-primary flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</button>
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

        {/* Withdraw Tab */}
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
            <Button onClick={doWithdraw} className="w-full bg-destructive text-destructive-foreground font-semibold">
              <ArrowUpRight className="h-4 w-4 mr-2" /> Withdraw
            </Button>
          </div>
        )}

        {/* Transfer Tab */}
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

        {/* History Tab */}
        {tab === "history" && (
          <div className="glass-card rounded-xl overflow-hidden">
            {transactions.length === 0 && <p className="p-4 text-center text-muted-foreground text-sm">No transactions yet</p>}
            {transactions.slice(0, 50).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${["buy", "deposit", "receive"].includes(tx.type) ? "bg-success/10" : "bg-danger/10"}`}>
                    {["buy", "deposit", "receive"].includes(tx.type)
                      ? <ArrowDownLeft className="h-4 w-4 text-success" />
                      : <ArrowUpRight className="h-4 w-4 text-danger" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                      {tx.from && <span> · From: {tx.from}</span>}
                      {tx.to && <span> · To: {tx.to}</span>}
                    </p>
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
