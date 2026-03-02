import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Bell } from "lucide-react";

const TopBar = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">CryptoX</span>
        </div>
        <div className="flex items-center gap-3">
          {isGuest ? (
            <button onClick={() => navigate("/login")} className="text-xs font-medium text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary/10">
              Login
            </button>
          ) : (
            <>
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              <button onClick={() => navigate("/profile")} className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
