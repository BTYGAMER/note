import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureLockedCard } from "@/components/FeatureLockedCard";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  note_reference: string;
}

const Quiz = () => {
  const { fileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectRefs, setIncorrectRefs] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier, getFeatureLimits } = useSubscription();
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    checkQuizLimit();
  }, [fileId]);

  const checkQuizLimit = async () => {
    const limits = getFeatureLimits();
    
    // Get quiz count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    setQuizCount(count || 0);

    // Only check limit if it's not Infinity (unlimited)
    if (limits.maxQuizzes !== Infinity && count !== null && count >= limits.maxQuizzes) {
      toast({
        title: "Quiz Limit Reached",
        description: `You've reached your ${tier} plan limit of ${limits.maxQuizzes} quizzes this month. Upgrade for more!`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    generateQuiz();
  };

  const generateQuiz = async () => {
    if (!fileId) return;

    try {
      const { data: note } = await supabase
        .from("notes")
        .select("content")
        .eq("file_id", fileId)
        .single();

      if (!note) throw new Error("Note not found");

      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { content: note.content, fileId }
      });

      if (error) throw error;

      setQuestions(data.questions || []);
    } catch (error: any) {
      toast({
        title: "Error generating quiz",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/note/${fileId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    let correctCount = 0;
    const refs: string[] = [];

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      } else {
        refs.push(q.note_reference);
      }
    });

    setScore(correctCount);
    setIncorrectRefs(refs);
    setSubmitted(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id")
      .eq("file_id", fileId)
      .single();

    if (quiz) {
      await supabase.from("quiz_results").insert({
        quiz_id: quiz.id,
        user_id: user.id,
        answers,
        score: correctCount,
        incorrect_references: refs,
      });
    }

    toast({
      title: `Quiz Complete!`,
      description: `You scored ${correctCount}/${questions.length}`,
    });
  };

  const progressPercent = (Object.keys(answers).length / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      
      <header className="border-b glass-effect shadow-soft relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/note/${fileId}`)} className="hover:bg-primary/10 hover-lift">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Quiz Time!</h1>
              <p className="text-sm text-muted-foreground">
                Test your knowledge of the material
              </p>
            </div>
            {!submitted && (
              <div className="text-sm font-medium">
                <span className="text-primary">{Object.keys(answers).length}</span>
                <span className="text-muted-foreground">/{questions.length} answered</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl relative">
        {!submitted && (
          <div className="mb-6">
            <Progress value={progressPercent} className="h-3" />
          </div>
        )}

        {submitted && (
          <Card className="mb-6 shadow-glow border-2 hover-lift relative overflow-hidden group animate-slide-up">
            <div className={`absolute inset-0 ${score === questions.length ? 'bg-gradient-hero' : 'bg-gradient-accent'} opacity-5`} />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                {score === questions.length ? (
                  <>
                    <CheckCircle2 className="w-7 h-7 text-success animate-glow-pulse" />
                    <span className="bg-gradient-hero bg-clip-text text-transparent">Perfect Score!</span>
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-accent bg-clip-text text-transparent">Quiz Results</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground mb-4">
                {score === questions.length
                  ? "Excellent work! You've mastered this material."
                  : "Review the highlighted sections in your notes to improve."}
              </p>
              {incorrectRefs.length > 0 && (
                <div className="bg-warning/10 border-2 border-warning/20 rounded-xl p-4 mb-4">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-xl">📚</span> Areas to review:
                  </p>
                  <ul className="text-sm space-y-1">
                    {incorrectRefs.map((ref, i) => (
                      <li key={i} className="text-warning font-medium">
                        • {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                className="w-full bg-gradient-hero hover:opacity-90 shadow-soft text-black"
                onClick={() => navigate(`/note/${fileId}`)}
              >
                Return to Notes
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card
              key={question.id}
              className={`shadow-soft hover-lift border-2 transition-all relative overflow-hidden group animate-slide-up ${
                submitted
                  ? answers[question.id] === question.correct_answer
                    ? "border-success/50"
                    : "border-destructive/50"
                  : "hover:border-primary/30"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                submitted
                  ? answers[question.id] === question.correct_answer
                    ? "bg-success"
                    : "bg-destructive"
                  : "bg-gradient-accent"
              }`} />
              <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-primary font-bold">Q{index + 1}.</span>
                  <span className="flex-1 text-foreground">{question.question}</span>
                  {submitted &&
                    (answers[question.id] === question.correct_answer ? (
                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                    ))}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) =>
                    !submitted && setAnswers({ ...answers, [question.id]: value })
                  }
                  disabled={submitted}
                  className="space-y-2"
                >
                  {question.options.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                        submitted
                          ? option === question.correct_answer
                            ? "bg-success/10 border-success/30"
                            : answers[question.id] === option
                            ? "bg-destructive/10 border-destructive/30"
                            : "border-transparent"
                          : "hover:bg-primary/5 hover:border-primary/30 cursor-pointer"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                      <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer text-foreground">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {!submitted && (
          <Button
            className="w-full mt-8 h-12 text-base bg-gradient-hero hover:opacity-90 shadow-soft text-black"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            Submit Quiz
          </Button>
        )}
      </main>
    </div>
  );
};

export default Quiz;
