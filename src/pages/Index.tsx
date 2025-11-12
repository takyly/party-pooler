import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Users, Heart, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptLTEyIDBoLTJWMThoMnYxMnpNNDggNDJoLTJ2LTEyaDJ2MTJ6TTEyIDQyaC0ydi0xMmgydjEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Celebrate Together, Gift Together</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Pool Money for the Perfect Gift
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Create an event, share the link with friends, and collect contributions for amazing gifts. No more awkward cash exchanges at parties!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-medium">
                <Gift className="mr-2 h-5 w-5" />
                Create Your Event
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Make Group Gifting Effortless
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Perfect for birthdays, weddings, baby showers, or any celebration where friends want to chip in together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border hover:shadow-medium transition-shadow">
              <div className="bg-gradient-primary rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Create an Event</h3>
              <p className="text-muted-foreground">
                Set up your event in seconds with a name, date, and goal amount. We'll generate a unique shareable link.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border hover:shadow-medium transition-shadow">
              <div className="bg-gradient-secondary rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Share with Friends</h3>
              <p className="text-muted-foreground">
                Send the link to everyone invited. They can contribute any amount securely through Stripe.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border hover:shadow-medium transition-shadow">
              <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Collect & Celebrate</h3>
              <p className="text-muted-foreground">
                Watch contributions roll in. After a small 10% service fee, 90% goes directly to you for the gift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Make Your Next Celebration Special?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join others who are making group gifting simple and stress-free
          </p>
          <Link to="/create">
            <Button size="lg" className="shadow-medium">
              <Gift className="mr-2 h-5 w-5" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 GiftTogether. Powered by Stripe for secure payments.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;