import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && isGuest) {
      setShowDialog(true);
    } else if (!isAuthenticated && !isGuest) {
      navigate("/login");
    }
  }, [isAuthenticated, isGuest, navigate]);

  if (isAuthenticated) return <>{children}</>;

  return (
    <Dialog open={showDialog} onOpenChange={(open) => { if (!open) navigate(-1); setShowDialog(open); }}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-foreground">Login Required</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Please login or signup to access this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => navigate("/login")} className="flex-1 bg-primary text-primary-foreground">Sign In</Button>
          <Button onClick={() => navigate("/signup")} variant="outline" className="flex-1 border-border text-foreground">Sign Up</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
