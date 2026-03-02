import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">CryptoX</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPass ? "text" : "password"} className="bg-secondary border-border pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={handleGuest} className="text-primary hover:text-primary/80 text-sm font-medium">
              Continue as Guest →
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">Sign Up</Link>
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Demo Admin Login:</p>
            <p>Email: admin@cryptox.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
