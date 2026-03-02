import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) { toast.error("Please fill all fields"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const ok = await signup(username, email, password);
    setLoading(false);
    if (ok) {
      toast.success("Account created! You received 10,000 USDT demo balance.");
      navigate("/");
    } else {
      toast.error("Email already exists");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">CryptoX</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Start trading in minutes</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPass ? "text" : "password"} className="bg-secondary border-border pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Confirm Password</label>
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" type="password" className="bg-secondary border-border" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
