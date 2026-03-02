import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "guest" | "user" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  walletId: string;
  balance: Record<string, number>; // Exchange balance
  walletBalance: Record<string, number>; // Web3 Wallet balance
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  requireAuth: (action: string) => boolean;
  transferBetweenAccounts: (coin: string, amount: number, direction: "toWallet" | "toExchange") => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const generateWalletAddress = () => {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
};

const generateId = () => crypto.randomUUID();

// Demo users storage
const DEMO_USERS: User[] = [
  {
    id: "admin-001",
    username: "admin",
    email: "admin@cryptox.com",
    role: "admin",
    walletAddress: "0xADMIN0000000000000000000000000000000001",
    walletId: "wallet-admin-001",
    balance: { USDT: 1000000, BTC: 10, ETH: 100 },
    walletBalance: { USDT: 50000, BTC: 5, ETH: 50 },
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cryptox_user");
    return saved ? JSON.parse(saved) : null;
  });

  const isGuest = user?.role === "guest";
  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user && user.role !== "guest";

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Check admin
    if (email === "admin@cryptox.com" && password === "admin123") {
      const adminUser = DEMO_USERS[0];
      setUser(adminUser);
      localStorage.setItem("cryptox_user", JSON.stringify(adminUser));
      return true;
    }
    // Check stored users
    const users: User[] = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const found = users.find((u) => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem("cryptox_user", JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (username: string, email: string, _password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    if (users.find((u) => u.email === email)) return false;
    const newUser: User = {
      id: generateId(),
      username,
      email,
      role: "user",
      walletAddress: generateWalletAddress(),
      walletId: `wallet-${generateId().slice(0, 8)}`,
      balance: { USDT: 10000, BTC: 0, ETH: 0 },
      walletBalance: { USDT: 0 },
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("cryptox_all_users", JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem("cryptox_user", JSON.stringify(newUser));
    return true;
  }, []);

  const loginAsGuest = useCallback(() => {
    const guest: User = {
      id: "guest",
      username: "Guest",
      email: "",
      role: "guest",
      walletAddress: "",
      walletId: "",
      balance: {},
      walletBalance: {},
      createdAt: new Date().toISOString(),
    };
    setUser(guest);
    localStorage.setItem("cryptox_user", JSON.stringify(guest));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("cryptox_user");
  }, []);

  const requireAuth = useCallback(
    (_action: string): boolean => {
      return isAuthenticated;
    },
    [isAuthenticated]
  );

  const refreshUser = useCallback(() => {
    const saved = localStorage.getItem("cryptox_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const transferBetweenAccounts = useCallback((coin: string, amount: number, direction: "toWallet" | "toExchange"): boolean => {
    if (!user || amount <= 0) return false;
    
    const srcBalance = direction === "toWallet" ? { ...user.balance } : { ...user.walletBalance };
    const dstBalance = direction === "toWallet" ? { ...user.walletBalance } : { ...user.balance };
    
    if ((srcBalance[coin] || 0) < amount) return false;

    srcBalance[coin] = (srcBalance[coin] || 0) - amount;
    dstBalance[coin] = (dstBalance[coin] || 0) + amount;

    const newBalance = direction === "toWallet" ? srcBalance : dstBalance;
    const newWalletBalance = direction === "toWallet" ? dstBalance : srcBalance;

    const updatedUser: User = {
      ...user,
      balance: newBalance,
      walletBalance: newWalletBalance,
    };

    // Persist to localStorage
    localStorage.setItem("cryptox_user", JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], balance: newBalance, walletBalance: newWalletBalance };
      localStorage.setItem("cryptox_all_users", JSON.stringify(users));
    }

    // Set new object reference to trigger React re-render
    setUser(updatedUser);
    return true;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isGuest, isAdmin, isAuthenticated, login, signup, loginAsGuest, logout, requireAuth, transferBetweenAccounts, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
