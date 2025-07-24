import { useEffect, useState } from "react";
import { Calendar, Trophy, BookOpen, CheckCircle, Flame, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActivityService } from "@/lib/activityService";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streakInfo, setStreakInfo] = useState({ current_streak: 0, longest_streak: 0 });
  const [activityData, setActivityData] = useState([]);

  const badges = [
    { name: "First Chapter", icon: BookOpen, color: "text-primary" },
    { name: "Week Warrior", icon: Flame, color: "text-orange-500" },
    { name: "Test Master", icon: Trophy, color: "text-yellow-500" },
    { name: "Doubt Solver", icon: CheckCircle, color: "text-green-500" },
  ];

  const completedChapters = [
    { subject: "Physics", chapter: "Mechanics", progress: 100 },
    { subject: "Chemistry", chapter: "Atomic Structure", progress: 100 },
    { subject: "Mathematics", chapter: "Algebra", progress: 85 },
    { subject: "Biology", chapter: "Cell Biology", progress: 92 },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading data for user:', user.id);
        
        // Get streak info
        const streak = await ActivityService.getStreakInfo(user.id);
        console.log('Streak info:', streak);
        
        if (streak) {
          setStreakInfo(streak);
        }

        // Get activity data for heatmap
        const { startDate, endDate } = ActivityService.getActivityDateRange();
        console.log('Fetching activity data for date range:', { startDate, endDate });
        
        const data = await ActivityService.getActivityData(user.id, startDate, endDate);
        console.log('Activity data:', data);
        
        setActivityData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getActivityColor = (count) => {
    if (count === 0) return "bg-muted";
    if (count <= 1) return "bg-primary/30";
    if (count <= 2) return "bg-primary/50";
    if (count <= 3) return "bg-primary/70";
    return "bg-primary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pl-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pl-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pl-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <h3 className="text-lg font-semibold">Please Sign In</h3>
          <p className="text-muted-foreground">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Here's your learning progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Streak Counter */}
          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Study Streak</h3>
                <p className="text-2xl font-bold text-primary">{streakInfo.current_streak} days</p>
              </div>
            </div>
          </div>

          {/* Total Study Time */}
          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Total Hours</h3>
                <p className="text-2xl font-bold text-secondary">47.5h</p>
              </div>
            </div>
          </div>

          {/* Athena Coins */}
          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Athena Coins</h3>
                <p className="text-2xl font-bold text-yellow-500">1,250</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Badges Grid */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Earned Badges
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div key={index} className="glass-card rounded-lg p-4 text-center interactive">
                  <badge.icon className={`h-8 w-8 mx-auto mb-2 ${badge.color}`} />
                  <p className="text-sm font-medium text-foreground">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Learning */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Continue Learning
            </h3>
            <div className="space-y-4">
              <div className="glass-card rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Physics</h4>
                    <p className="text-sm text-muted-foreground">Thermodynamics - Chapter 3</p>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">In Progress</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground">65% completed</p>
              </div>
              <button className="btn-neon w-full">Continue Chapter</button>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity Heatmap
          </h3>
          
          {/* Month Labels */}
          <div className="flex mb-2 ml-12">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <div key={month} className="text-xs text-muted-foreground flex-1 text-left">
                {month}
              </div>
            ))}
          </div>
          
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col justify-around text-xs text-muted-foreground mr-2 h-24">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            
            {/* Heatmap Grid */}
            <div className="flex gap-1 overflow-x-auto">
              {Array.from({ length: 12 }, (_, monthIndex) => {
                const monthStart = monthIndex * 30; // Approximate month grouping
                const monthEnd = Math.min(monthStart + 30, activityData.length);
                const monthData = activityData.slice(monthStart, monthEnd);
                
                return (
                  <div key={monthIndex} className="grid grid-rows-7 grid-flow-col gap-1 mr-2">
                    {monthData.map((day, index) => (
                      <div
                        key={monthStart + index}
                        className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer`}
                        title={`${new Date(day.date).toLocaleDateString()}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/50"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
              <div className="w-3 h-3 rounded-sm bg-primary"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Completed Chapters */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Completed Chapters
          </h3>
          <div className="space-y-3">
            {completedChapters.map((chapter, index) => (
              <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">{chapter.subject}</h4>
                  <p className="text-sm text-muted-foreground">{chapter.chapter}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${chapter.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-foreground">{chapter.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
