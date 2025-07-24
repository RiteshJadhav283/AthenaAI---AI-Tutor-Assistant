import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Flame, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  BarChart3,
  Target,
  Award
} from "lucide-react";

const studyLog = [
  { id: 1, subject: "Physics", chapter: "Thermodynamics", time: "45 min", date: "Today", type: "study" },
  { id: 2, subject: "Mathematics", chapter: "Calculus", time: "30 min", date: "Today", type: "study" },
  { id: 3, subject: "Chemistry", chapter: "Organic Chemistry", time: "60 min", date: "Yesterday", type: "study" },
  { id: 4, subject: "Physics", chapter: "Newton's Laws", time: "15 min", date: "Yesterday", type: "doubt" },
  { id: 5, subject: "Biology", chapter: "Cell Division", time: "40 min", date: "2 days ago", type: "study" },
  { id: 6, subject: "Mathematics", chapter: "Algebra", time: "25 min", date: "2 days ago", type: "test" },
];

const weeklyData = [
  { day: "Mon", hours: 2.5, doubts: 3 },
  { day: "Tue", hours: 3.2, doubts: 2 },
  { day: "Wed", hours: 1.8, doubts: 5 },
  { day: "Thu", hours: 4.1, doubts: 1 },
  { day: "Fri", hours: 2.9, doubts: 4 },
  { day: "Sat", hours: 3.5, doubts: 2 },
  { day: "Sun", hours: 2.8, doubts: 3 },
];

export default function Activity() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  
  const totalHours = 156.5;
  const currentStreak = 12;
  const totalDoubts = 89;
  
  // Generate activity heatmap data
  const activityData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000),
    count: Math.floor(Math.random() * 5),
  }));

  const getActivityColor = (count) => {
    if (count === 0) return "bg-muted";
    if (count <= 1) return "bg-primary/30";
    if (count <= 2) return "bg-primary/50";
    if (count <= 3) return "bg-primary/70";
    return "bg-primary";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "study": return BookOpen;
      case "doubt": return MessageSquare;
      case "test": return Target;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "study": return "text-primary";
      case "doubt": return "text-secondary";
      case "test": return "text-yellow-500";
      default: return "text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>
          <p className="text-muted-foreground mt-2">Track your learning progress and study patterns.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Study Time</h3>
                <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                <p className="text-2xl font-bold text-foreground">{currentStreak} days</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Doubts Resolved</h3>
                <p className="text-2xl font-bold text-foreground">{totalDoubts}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Achievements</h3>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Heatmap */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Study Activity
              </h3>
              <div className="flex gap-2">
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedPeriod === "year" && (
              <>
                {/* Month labels */}
                <div className="flex gap-1 text-xs text-muted-foreground mb-2 overflow-x-auto">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="min-w-[80px] text-center mr-2">
                      {new Date(2024, i).toLocaleDateString('en', { month: 'short' })}
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  {/* Day labels */}
                  <div className="flex flex-col text-xs text-muted-foreground mr-2 h-fit">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                      <div key={i} className="h-3 flex items-center mb-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap Grid with month gaps */}
                  <div className="flex gap-1 overflow-x-auto">
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                      const monthStart = monthIndex * 30;
                      const monthEnd = Math.min(monthStart + 30, activityData.length);
                      const monthData = activityData.slice(monthStart, monthEnd);
                      
                      return (
                        <div key={monthIndex} className="grid grid-rows-7 grid-flow-col gap-1 mr-2">
                          {monthData.map((day, index) => (
                            <div
                              key={monthStart + index}
                              className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer`}
                              title={`${day.date.toLocaleDateString()}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary"></div>
                  </div>
                  <span>More</span>
                </div>
              </>
            )}

            {selectedPeriod === "week" && (
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-muted-foreground">{day.day}</div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">{day.hours}h</span>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(day.hours / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-foreground">{day.doubts}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Stats */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Study Hours</span>
                <span className="text-foreground font-medium">21.8h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Daily</span>
                <span className="text-foreground font-medium">3.1h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Doubts Asked</span>
                <span className="text-foreground font-medium">20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tests Taken</span>
                <span className="text-foreground font-medium">5</span>
              </div>
              <div className="pt-2 border-t border-card-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+15% from last week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {studyLog.map((activity) => {
              const IconComponent = getTypeIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-4 glass-card rounded-lg p-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    activity.type === "study" ? "bg-primary/20" :
                    activity.type === "doubt" ? "bg-secondary/20" : "bg-yellow-500/20"
                  }`}>
                    <IconComponent className={`h-5 w-5 ${getTypeColor(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{activity.subject}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.type === "study" ? "bg-primary/10 text-primary" :
                        activity.type === "doubt" ? "bg-secondary/10 text-secondary" : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.chapter}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{activity.time}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
