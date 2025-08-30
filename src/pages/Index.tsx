import { useState } from "react";
import { QuestionRubricForm } from "@/components/grading/QuestionRubricForm";
import { UploadGradeForm } from "@/components/grading/UploadGradeForm";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, RotateCcw, GraduationCap, ArrowLeft } from "lucide-react";
import { UserProfile } from "@/components/auth/UserProfile";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"question" | "upload">("question");
  const [rubricText, setRubricText] = useState("");

  // 🔼 Lifted state for the QuestionRubricForm
  const [questionText, setQuestionText] = useState("");
  const [program, setProgram] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [rubric, setRubric] = useState<any | null>(null);
  const [questionId, setQuestionId] = useState<any | null>(null);

  const handleRubricGenerated = (rubric: string) => {
    setRubricText(rubric);
    setCurrentStep("upload");
  };

  const handleGradeComplete = () => {
    // Grade is complete, user can choose to start over or grade another
  };

  const startOver = () => {
    setCurrentStep("question");
    setRubricText("");
    setQuestionText("");
    setProgram("");
    setSubject("");
    setYear("");
    setRubric(null);
    setQuestionId(null);
  };

  const goBack = () => {
    setCurrentStep("question");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1" />
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent text-white">
                <Brain className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Grading Assistant
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your grading process with AI-powered rubric generation and intelligent assessment feedback
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <UserProfile />
          </div>
        </div>

        {/* Main Content */}
        {currentStep === "question" ? (
          <QuestionRubricForm
            onRubricGenerated={handleRubricGenerated}
            questionText={questionText}
            setQuestionText={setQuestionText}
            program={program}
            setProgram={setProgram}
            subject={subject}
            setSubject={setSubject}
            year={year}
            setYear={setYear}
            rubric={rubric}
            setRubric={setRubric}
            questionId={questionId}
            setQuestionId={setQuestionId}
          />
        ) : (
          <UploadGradeForm
            rubricText={rubricText}
            onGradeComplete={handleGradeComplete}
            questionId = {questionId}
            questionText={questionText}
          />
        )}

        {/* Navigation & Footer */}
        {currentStep === "upload" && (
          <div className="mt-8 flex justify-between items-center">
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
            <Button onClick={startOver} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>Powered by AI to enhance academic assessment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
