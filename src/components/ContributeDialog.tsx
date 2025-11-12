import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  onSuccess: () => void;
}

const ContributeDialog = ({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  onSuccess,
}: ContributeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountInCents = Math.round(parseFloat(formData.amount) * 100);

      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-contribution-checkout", {
        body: {
          eventId,
          contributorName: formData.name,
          contributorEmail: formData.email,
          amount: amountInCents,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure payment...");
        onOpenChange(false);
        setFormData({ name: "", email: "", amount: "" });
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.message || "Failed to process contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contribute to {eventTitle}</DialogTitle>
          <DialogDescription>
            Enter your details below. You'll be redirected to secure Stripe payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="25.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="bg-accent/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p>After checkout, 90% goes to the organizer and 10% covers our service fee.</p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeDialog;