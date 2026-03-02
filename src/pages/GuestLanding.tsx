import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Eye, BarChart3, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const GuestLanding = () => {
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuest = () => {
    loginAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-lg w-full text-center animate-slide-up">
        <TrendingUp className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to CryptoX</h1>
        <p className="text-muted-foreground mb-8">
          Explore the crypto market, view real-time prices, and discover trading opportunities.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Eye, label: "View Markets", desc: "Real-time prices" },
            { icon: BarChart3, label: "Charts", desc: "Live candlesticks" },
            { icon: Wallet, label: "Trading", desc: "Requires account" },
            { icon: Shield, label: "Secure", desc: "Internal wallet" },
          ].map((item) => (
            <div key={item.label} className="glass-card rounded-lg p-4 text-left">
              <item.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button onClick={handleGuest} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base">
            Continue as Guest
          </Button>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/login")} variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary h-11">
              Sign In
            </Button>
            <Button onClick={() => navigate("/signup")} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10 h-11">
              Sign Up
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Guest users can view markets and charts. Sign up to trade, deposit, and manage your wallet.
        </p>
      </div>
    </div>
  );
};

export default GuestLanding;
