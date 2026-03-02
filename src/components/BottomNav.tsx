import { NavLink, useLocation } from "react-router-dom";
import { Home, BarChart3, ArrowLeftRight, Wallet, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const hideOn = ["/login", "/signup", "/guest"];
  if (hideOn.includes(location.pathname)) return null;

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/market", icon: BarChart3, label: "Markets" },
    { to: "/trade", icon: ArrowLeftRight, label: "Trade" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : [{ to: "/profile", icon: User, label: "Profile" }]),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
