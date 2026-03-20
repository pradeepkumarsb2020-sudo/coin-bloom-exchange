import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "guest" | "user" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  walletId: string;
  balance: Record<string, number>;
  walletBalance: Record<string, number>;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
  suspended?: boolean;
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
  updateBalance: (newBalance: Record<string, number>) => void;
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

const ADMIN_EMAIL = "admin@cryptox.com";
const ADMIN_PASSWORD = "admin123";

const getStoredUsers = (): StoredUser[] => JSON.parse(localStorage.getItem("cryptox_all_users") || "[]");
const saveStoredUsers = (users: StoredUser[]) => localStorage.setItem("cryptox_all_users", JSON.stringify(users));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cryptox_user");
    return saved ? JSON.parse(saved) : null;
  });

  const isGuest = user?.role === "guest";
  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user && user.role !== "guest";

  const persistUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem("cryptox_user", JSON.stringify(u));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin-001",
        username: "admin",
        email: ADMIN_EMAIL,
        role: "admin",
        walletAddress: "0xADMIN0000000000000000000000000000000001",
        walletId: "wallet-admin-001",
        balance: { USDT: 1000000, BTC: 10, ETH: 100 },
        walletBalance: { USDT: 50000, BTC: 5, ETH: 50 },
        createdAt: "2024-01-01T00:00:00Z",
      };
      persistUser(adminUser);
      return true;
    }

    // Validate stored users with password
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return false;
    if (found.suspended) return false;

    const { password: _, suspended: __, ...safeUser } = found;
    persistUser(safeUser);
    return true;
  }, [persistUser]);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    const users = getStoredUsers();
    if (users.find((u) => u.email === email)) return false;

    const newUser: StoredUser = {
      id: generateId(),
      username,
      email,
      role: "user",
      walletAddress: generateWalletAddress(),
      walletId: `wallet-${generateId().slice(0, 8)}`,
      balance: { USDT: 10000, BTC: 0, ETH: 0 },
      walletBalance: { USDT: 0 },
      createdAt: new Date().toISOString(),
      password,
    };
    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...safeUser } = newUser;
    persistUser(safeUser);
    return true;
  }, [persistUser]);

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
    persistUser(guest);
  }, [persistUser]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("cryptox_user");
  }, []);

  const requireAuth = useCallback((_action: string): boolean => isAuthenticated, [isAuthenticated]);

  const refreshUser = useCallback(() => {
    const saved = localStorage.getItem("cryptox_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const updateBalance = useCallback((newBalance: Record<string, number>) => {
    if (!user) return;
    const updatedUser: User = { ...user, balance: { ...newBalance } };
    persistUser(updatedUser);
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], balance: { ...newBalance } };
      saveStoredUsers(users);
    }
  }, [user, persistUser]);

  const transferBetweenAccounts = useCallback((coin: string, amount: number, direction: "toWallet" | "toExchange"): boolean => {
    if (!user || amount <= 0) return false;

    const srcBalance = direction === "toWallet" ? { ...user.balance } : { ...user.walletBalance };
    const dstBalance = direction === "toWallet" ? { ...user.walletBalance } : { ...user.balance };

    if ((srcBalance[coin] || 0) < amount) return false;

    srcBalance[coin] = (srcBalance[coin] || 0) - amount;
    dstBalance[coin] = (dstBalance[coin] || 0) + amount;

    const newBalance = direction === "toWallet" ? srcBalance : dstBalance;
    const newWalletBalance = direction === "toWallet" ? dstBalance : srcBalance;

    const updatedUser: User = { ...user, balance: newBalance, walletBalance: newWalletBalance };
    persistUser(updatedUser);

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], balance: newBalance, walletBalance: newWalletBalance };
      saveStoredUsers(users);
    }
    return true;
  }, [user, persistUser]);

  return (
    <AuthContext.Provider
      value={{ user, isGuest, isAdmin, isAuthenticated, login, signup, loginAsGuest, logout, requireAuth, transferBetweenAccounts, updateBalance, refreshUser }}
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
