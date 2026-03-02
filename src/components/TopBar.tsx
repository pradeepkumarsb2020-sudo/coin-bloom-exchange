import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, QrCode, Headphones } from "lucide-react";

const TopBar = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/profile")} className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {isGuest ? "G" : user?.username?.charAt(0).toUpperCase()}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {isGuest ? (
            <button onClick={() => navigate("/login")} className="text-xs font-semibold text-primary">
              Log In
            </button>
          ) : (
            <>
              <QrCode className="h-5 w-5 text-muted-foreground" />
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Headphones className="h-5 w-5 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
