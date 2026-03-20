import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";

const FAQ_DATA = [
  { q: "How do I deposit funds?", a: "Go to Exchange → Deposit tab, select a coin and network, then enter the amount. Your balance will update instantly in this demo." },
  { q: "How do I withdraw funds?", a: "Go to Exchange → Withdraw tab, enter a destination address and amount. A security confirmation will be required." },
  { q: "Why can't I log in?", a: "Make sure you're using the exact email and password you registered with. Passwords are case-sensitive." },
  { q: "How do I transfer to another user?", a: "Go to Exchange → Transfer tab, enter the recipient's username or wallet address and the amount to send." },
  { q: "What is the Exchange vs Wallet?", a: "The Exchange holds funds for trading. The Wallet holds your personal assets. You can transfer between them using the Exchange↔Wallet option." },
  { q: "How do I view my wallet address?", a: "Go to Profile to see your wallet address and QR code. You can copy the address or let someone scan your QR." },
  { q: "Is my data safe?", a: "This is a demo application. Data is stored locally in your browser. Do not use real credentials or funds." },
  { q: "How do I place a trade?", a: "Navigate to Trade, select a coin pair, choose Market or Limit order, enter the amount, and click Buy or Sell." },
];

const Support = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      toast.error("Please fill all fields");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setContactEmail("");
      setContactMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <span className="font-semibold text-foreground">Help & Support</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const chatBtn = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLButtonElement;
              if (chatBtn) chatBtn.click();
              else toast.info("Look for the chat bubble in the bottom-right corner!");
            }}
            className="glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">Chat with AI</p>
            <p className="text-xs text-muted-foreground">Get instant help</p>
          </button>
          <a href="#contact" className="glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors">
            <Mail className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">Email Support</p>
            <p className="text-xs text-muted-foreground">We reply in 24hrs</p>
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-sm text-foreground pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact">
          <h2 className="text-sm font-semibold text-foreground mb-3">Contact Us</h2>
          <div className="glass-card rounded-xl p-4">
            <form onSubmit={handleContact} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Your Email</label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@email.com"
                  type="email"
                  className="bg-secondary border-border h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  maxLength={1000}
                  className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold h-10" disabled={sending}>
                {sending ? "Sending..." : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
