import { useState } from "react";
import { QuestionRubricForm } from "@/components/grading/QuestionRubricForm";
import { UploadGradeForm } from "@/components/grading/UploadGradeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowRight, RotateCcw, GraduationCap, ArrowLeft } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"question" | "upload">("question");
  const [rubricText, setRubricText] = useState("");

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
  };

  const goBack = () => {
    setCurrentStep("question");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
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

        {/* Progress Steps */}
        <div className="mb-8 p-6 rounded-lg border bg-card shadow-subtle">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === "question" 
                ? "bg-primary text-primary-foreground" 
                : "bg-success text-success-foreground"
            }`}>
              <span className="text-sm font-medium">1</span>
              <span className="text-sm">Question & Rubric</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === "upload" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              <span className="text-sm font-medium">2</span>
              <span className="text-sm">Upload & Grade</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === "question" ? (
          <QuestionRubricForm onRubricGenerated={handleRubricGenerated} />
        ) : (
          <UploadGradeForm 
            rubricText={rubricText} 
            onGradeComplete={handleGradeComplete} 
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
