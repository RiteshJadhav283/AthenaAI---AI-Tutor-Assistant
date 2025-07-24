import { useAuth } from "@/context/AuthContext";
import { BadgeGrid } from "@/components/badges/BadgeGrid";
import { useBadges } from "@/hooks/useBadges";
import { Loader2 } from "lucide-react";

export default function Achievements() {
  const { user } = useAuth();
  const { earnedBadges, loading } = useBadges(user?.id);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 ml-64">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">
            Track your learning progress and earn badges for your accomplishments.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Badges Earned</p>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
              </div>
            </div>
            {/* Add more stats cards here */}
          </div>

          {/* Badges Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Your Badges</h2>
            <BadgeGrid earnedBadges={earnedBadges} />
          </div>
        </div>
      </div>
    </div>
  );
} 