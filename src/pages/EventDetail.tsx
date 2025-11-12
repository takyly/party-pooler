import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Gift, Calendar, Users, ArrowLeft, Loader2 } from "lucide-react";
import ContributeDialog from "@/components/ContributeDialog";
import { format } from "date-fns";

interface Event {
  id: string;
  slug: string;
  organizer_name: string;
  title: string;
  description: string;
  event_date: string;
  goal_amount: number;
  current_amount: number;
  created_at: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  created_at: string;
  status: string;
}

const EventDetail = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContribute, setShowContribute] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [slug]);

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: contributionsData, error: contributionsError } = await supabase
        .from("contributions")
        .select("*")
        .eq("event_id", eventData.id)
        .eq("status", "succeeded")
        .order("created_at", { ascending: false });

      if (contributionsError) throw contributionsError;
      setContributions(contributionsData || []);
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast.error("Event not found");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = (event.current_amount / event.goal_amount) * 100;
  const contributorsCount = contributions.length;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-gradient-primary rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-white/90 mb-4">Organized by {event.organizer_name}</p>
            </div>
            <Gift className="h-12 w-12 text-white/80" />
          </div>

          <p className="text-lg text-white/90 mb-6">{event.description}</p>

          <div className="flex items-center gap-2 text-white/80 mb-6">
            <Calendar className="h-5 w-5" />
            <span>{format(new Date(event.event_date), "MMMM d, yyyy")}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-2xl font-bold">
                ${(event.current_amount / 100).toFixed(2)}
              </span>
              <span className="text-white/80">of ${(event.goal_amount / 100).toFixed(2)} goal</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
            <div className="flex items-center gap-2 mt-4 text-white/80">
              <Users className="h-5 w-5" />
              <span>{contributorsCount} {contributorsCount === 1 ? "contributor" : "contributors"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowContribute(true)}
              size="lg"
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              Contribute Now
            </Button>
            <Button
              onClick={copyLink}
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Link
            </Button>
          </div>
        </div>

        {contributions.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Contributors</CardTitle>
              <CardDescription>Thank you to everyone who has contributed!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="flex justify-between items-center p-4 bg-accent/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{contribution.contributor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(contribution.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      ${(contribution.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <ContributeDialog
          open={showContribute}
          onOpenChange={setShowContribute}
          eventId={event.id}
          eventTitle={event.title}
          onSuccess={fetchEventData}
        />
      </div>
    </div>
  );
};

export default EventDetail;