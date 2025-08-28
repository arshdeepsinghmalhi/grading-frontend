import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RubricDisplay } from "./RubricDisplay";
import { apiFetch } from "@/lib/api";

interface QuestionRubricFormProps {
  onRubricGenerated: (rubricText: string) => void;
}

export function QuestionRubricForm({ onRubricGenerated }: QuestionRubricFormProps) {
  const [questionText, setQuestionText] = useState("");
  const [program, setProgram] = useState("");
  const [subject, setSubject] = useState("");
  const [rubric, setRubric] = useState<any | null>(null);
  const [isRubricLocked, setIsRubricLocked] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const programs = [
    "MBA",
    "BBA","BCA","MCA"
  ];

  const subjects = [
    "Data Structures",
    "Algorithms",
    "Software Engineering",
    "Database Systems",
    "Machine Learning",
    "Web Development",
    "Operating Systems",
    "Computer Networks",
    "Calculus",
    "Linear Algebra"
  ];

  const generateRubric = async () => {
    if (!questionText.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question before generating a rubric.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await apiFetch<{ success: boolean; rubric?: unknown }>(
        "/api/generate/rubric",
        {
          method: "POST",
          jsonBody: {
            question: questionText,
            ...(program ? { program } : {}),
            ...(subject ? { subject } : {}),
          },
        }
      );

      if (data.success && data.rubric) {
        setRubric(data.rubric);
        setIsRubricLocked(true);

        toast({
          title: "Rubric Generated Successfully",
          description: "Your AI-generated rubric is ready for review.",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate rubric. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRubricLock = () => {
    setIsRubricLocked(!isRubricLocked);
  };

  const acceptRubric = () => {
    if (!rubric) {
      toast({
        title: "No Rubric to Accept",
        description: "Please generate a rubric first.",
        variant: "destructive",
      });
      return;
    }

    setIsRubricLocked(true);
    onRubricGenerated(JSON.stringify(rubric, null, 2)); // send structured rubric as JSON string

    toast({
      title: "Rubric Accepted",
      description: "Rubric has been saved and you can now proceed to grading.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Question + Options */}
      <Card className="shadow-subtle">
        <CardHeader className="bg-gradient-to-r from-background to-secondary/20">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Question & Rubric Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Question Text <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Enter your assignment question or prompt here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Program (Optional)
              </label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Subject (Optional)
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateRubric}
            disabled={isGenerating}
            variant="elegant"
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Rubric...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Rubric
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Rubric */}
      {rubric && (
        <Card className="shadow-subtle">
          <CardHeader className="bg-gradient-to-r from-background to-success/10">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {isRubricLocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Edit3 className="h-5 w-5 text-primary" />
                )}
                Generated Rubric
              </span>
              <Button
                onClick={toggleRubricLock}
                variant="outline"
                size="sm"
              >
                {isRubricLocked ? "Edit Rubric" : "Lock Rubric"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
  {isRubricLocked ? (
    // Read-only mode
    rubric && <RubricDisplay rubric={rubric} />
  ) : (
    // Editable mode
    <Textarea
      value={JSON.stringify(rubric, null, 2)}
      onChange={(e) => {
        try {
          setRubric(JSON.parse(e.target.value));
        } catch {
          // Ignore invalid JSON while typing
        }
      }}
      className="min-h-[300px] resize-none font-mono text-sm"
    />
  )}

  <div className="mt-4 flex justify-end">
    <Button 
      onClick={acceptRubric}
      variant="success"
      disabled={!isRubricLocked}
    >
      Accept Rubric
    </Button>
  </div>
</CardContent>

        </Card>
      )}
    </div>
  );
}
