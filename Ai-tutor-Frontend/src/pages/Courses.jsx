import { useState } from "react";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star,
  ChevronRight,
  Brain,
  FileText
} from "lucide-react";

const grades = [
  { id: "11", name: "Class 11", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "12", name: "Class 12", subjects: ["Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "jee", name: "JEE Preparation", subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: "neet", name: "NEET Preparation", subjects: ["Physics", "Chemistry", "Biology"] },
];

const sampleChapters = [
  { id: 1, name: "Introduction to Motion", duration: "45 min", completed: true, progress: 100 },
  { id: 2, name: "Newton's Laws", duration: "60 min", completed: true, progress: 100 },
  { id: 3, name: "Work and Energy", duration: "55 min", completed: false, progress: 65, current: true },
  { id: 4, name: "Momentum", duration: "50 min", completed: false, progress: 0 },
  { id: 5, name: "Rotational Motion", duration: "70 min", completed: false, progress: 0 },
];

export default function Courses() {
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [showChapters, setShowChapters] = useState(false);

  const resumeData = {
    subject: "Physics",
    chapter: "Work and Energy",
    progress: 65,
    timeSpent: "35 min"
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-2">Continue your learning journey with AI-powered courses.</p>
        </div>

        {/* Resume Learning Card */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Continue Learning</h3>
                <p className="text-muted-foreground">{resumeData.subject} - {resumeData.chapter}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${resumeData.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{resumeData.progress}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{resumeData.timeSpent}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-neon">Continue</button>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Select Grade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade)}
                className={`glass-card rounded-xl p-4 text-left interactive ${
                  selectedGrade.id === grade.id 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-card-border"
                }`}
              >
                <h3 className="font-semibold text-foreground">{grade.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {grade.subjects.length} subjects
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Subjects List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Subjects in {selectedGrade.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedGrade.subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setShowChapters(true);
                }}
                className={`glass-card rounded-xl p-6 text-left interactive group ${
                  selectedSubject === subject && showChapters
                    ? "border-primary/50 bg-primary/5"
                    : "border-card-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{subject}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>15 chapters</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.8 rating</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chapters List */}
        {showChapters && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedSubject} Chapters
                </h2>
                <p className="text-muted-foreground">
                  {selectedGrade.name} curriculum
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-purple flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Teaching
                </button>
                <button className="btn-neon flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Test
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sampleChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`glass-card rounded-lg p-4 interactive ${
                    chapter.current ? "border-primary/50 bg-primary/5" : "border-card-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        chapter.completed 
                          ? "bg-green-500/20" 
                          : chapter.current 
                            ? "bg-primary/20" 
                            : "bg-muted"
                      }`}>
                        {chapter.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Play className={`h-5 w-5 ${chapter.current ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{chapter.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{chapter.duration}</span>
                          </div>
                          {chapter.progress > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${chapter.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">{chapter.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      chapter.completed
                        ? "bg-green-500/20 text-green-500"
                        : chapter.current
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}>
                      {chapter.completed ? "Completed" : chapter.current ? "Continue" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
