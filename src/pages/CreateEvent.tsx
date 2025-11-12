import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizerName: "",
    organizerEmail: "",
    title: "",
    description: "",
    eventDate: "",
    goalAmount: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = generateSlug(formData.title);
      const goalInCents = Math.round(parseFloat(formData.goalAmount) * 100);

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            slug,
            organizer_name: formData.organizerName,
            organizer_email: formData.organizerEmail,
            title: formData.title,
            description: formData.description,
            event_date: formData.eventDate,
            goal_amount: goalInCents,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Event created successfully!");
      navigate(`/event/${slug}`);
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-3xl">Create Your Event</CardTitle>
            <CardDescription>
              Set up your gift pool in just a few steps. We'll create a unique shareable link for your event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Your Name *</Label>
                <Input
                  id="organizerName"
                  placeholder="John Doe"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Your Email *</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.organizerEmail}
                  onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  We'll send you updates and the payout details to this email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Event Name *</Label>
                <Input
                  id="title"
                  placeholder="Sarah's 30th Birthday Gift"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Let's pool money to get Sarah that camera she's been wanting!"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalAmount">Goal Amount ($) *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  After a 10% service fee, you'll receive 90% of contributions
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;