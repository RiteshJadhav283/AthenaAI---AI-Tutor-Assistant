import { useState } from "react";
import { 
  FileText, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Play,
  Star,
  Target,
  Coins,
  Brain,
  ChevronRight
} from "lucide-react";

const mockTests = [
  { id: 1, name: "JEE Main Physics", duration: "3 hours", questions: 90, difficulty: "Hard", coins: 50 },
  { id: 2, name: "NEET Biology", duration: "3 hours", questions: 180, difficulty: "Medium", coins: 45 },
  { id: 3, name: "JEE Advanced Math", duration: "3 hours", questions: 54, difficulty: "Very Hard", coins: 75 },
  { id: 4, name: "NEET Chemistry", duration: "3 hours", questions: 180, difficulty: "Medium", coins: 45 },
];

const personalizedTests = [
  { id: 1, name: "Weak Areas: Mechanics", questions: 25, duration: "45 min", subjects: ["Physics"], accuracy: 65 },
  { id: 2, name: "Organic Chemistry Revision", questions: 30, duration: "1 hour", subjects: ["Chemistry"], accuracy: 72 },
  { id: 3, name: "Algebra Practice", questions: 20, duration: "40 min", subjects: ["Mathematics"], accuracy: 78 },
];

const recentResults = [
  { id: 1, test: "Physics - Newton's Laws", score: "85%", coins: 25, date: "2 days ago" },
  { id: 2, test: "Chemistry - Atomic Structure", score: "92%", coins: 30, date: "4 days ago" },
  { id: 3, test: "Math - Calculus", score: "78%", coins: 20, date: "1 week ago" },
];

export default function Tests() {
  const [activeTab, setActiveTab] = useState("personalized");
  const [timeRemaining, setTimeRemaining] = useState(null);

  const athenaCoins = 1250;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-orange-500";
      case "Very Hard": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tests</h1>
          <p className="text-muted-foreground mt-2">Challenge yourself with personalized and mock tests.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tests Completed</h3>
                <p className="text-2xl font-bold text-foreground">47</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
                <p className="text-2xl font-bold text-foreground">82%</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Coins className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Athena Coins</h3>
                <p className="text-2xl font-bold text-foreground">{athenaCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 interactive">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Best Score</h3>
                <p className="text-2xl font-bold text-foreground">96%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 glass-card rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("personalized")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "personalized"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Personalized Tests
          </button>
          <button
            onClick={() => setActiveTab("mock")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "mock"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mock Tests
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "personalized" && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Generated Tests
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Tests created based on your weak areas and learning progress.
                  </p>
                  
                  <div className="space-y-4">
                    {personalizedTests.map((test) => (
                      <div key={test.id} className="glass-card rounded-lg p-4 interactive">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">{test.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{test.questions} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{test.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>Target: {test.accuracy}%+</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {test.subjects.map((subject) => (
                                <span
                                  key={subject}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="btn-neon flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Start Test
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mock" && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Mock Tests
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Full-length mock tests for JEE, NEET, and other competitive exams.
                  </p>
                  
                  <div className="space-y-4">
                    {mockTests.map((test) => (
                      <div key={test.id} className="glass-card rounded-lg p-4 interactive">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{test.name}</h3>
                              <span className={`text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
                                {test.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{test.questions} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{test.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span>{test.coins} coins reward</span>
                              </div>
                            </div>
                          </div>
                          <button className="btn-purple flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Start Test
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Results */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Recent Results
              </h3>
              <div className="space-y-3">
                {recentResults.map((result) => (
                  <div key={result.id} className="glass-card rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{result.test}</h4>
                      <span className="text-lg font-bold text-primary">{result.score}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{result.date}</span>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span>+{result.coins}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Timer (when active) */}
            {timeRemaining && (
              <div className="glass-card rounded-xl p-6 border border-primary/30">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Time Remaining
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {timeRemaining}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Test</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full glass-card rounded-lg p-3 text-left interactive group">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Create Custom Test</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </button>
                <button className="w-full glass-card rounded-lg p-3 text-left interactive group">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">View All Results</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </button>
                <button className="w-full glass-card rounded-lg p-3 text-left interactive group">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Weak Areas Analysis</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
