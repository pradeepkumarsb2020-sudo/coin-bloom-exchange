export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw" | "send" | "receive";
  coin: string;
  amount: number;
  price: number;
  total: number;
  date: string;
  status: "completed" | "pending" | "failed";
  from?: string;
  to?: string;
  network?: string;
}

export const getTransactions = (userId: string): Transaction[] => {
  return JSON.parse(localStorage.getItem(`cryptox_txns_${userId}`) || "[]");
};

export const addTransaction = (userId: string, txn: Transaction) => {
  const txns = getTransactions(userId);
  txns.unshift(txn);
  localStorage.setItem(`cryptox_txns_${userId}`, JSON.stringify(txns));
};
