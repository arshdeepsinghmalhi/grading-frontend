import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { RubricEditor } from "./RubricEditor";
import { useState } from "react";

interface QuestionRubricFormProps {
  onRubricGenerated: (rubricText: string) => void;
  questionText: string;
  setQuestionText: (val: string) => void;
  program: string;
  setProgram: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  rubric: any | null;
  setRubric: (val: any) => void;
  questionId: any | null;
  setQuestionId: (val: any) => void;
}

export function QuestionRubricForm({
  onRubricGenerated,
  questionText,
  setQuestionText,
  program,
  setProgram,
  subject,
  setSubject,
  year,
  setYear,
  rubric,
  setRubric,
  questionId,
  setQuestionId,
}: QuestionRubricFormProps) {
  const [isRubricLocked, setIsRubricLocked] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const programs = ["MBA", "BBA", "BCA", "MCA"];

  const subjects = [
    "Organisational Behaviour",
    'Business Statistics',
    "Placement_Digital Skills",
    "Financial Analytics",
    "Financial Products",
    "Software Project Management",
    "Business Law"

  ];

  const years = ["1st year", "2nd year", "3rd year", "4th year"];

  const generateRubric = async () => {
    if (!questionText.trim() || !subject || !program || !year) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields (Question, Subject, Program, and Year) before generating a rubric.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await apiFetch<{ success: boolean; rubric?: unknown; questionId?: number }>(
        "/api/generate/rubric",
        {
          method: "POST",
          jsonBody: {
            question: questionText,
            ...(program ? { program } : {}),
            ...(subject ? { subject } : {}),
            ...(year ? { year } : {}),
          },
        }
      );

      if (data.success && data.rubric) {
        setRubric(data.rubric);
        setQuestionId(data.questionId);
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

  const acceptRubric = async () => {
    if (!rubric) {
      toast({
        title: "No Rubric to Accept",
        description: "Please generate a rubric first.",
        variant: "destructive",
      });
      return;
    }

    setIsRubricLocked(true);

    await apiFetch("/api/update/question-data", {
      method: "PUT",
      jsonBody: {
        questionId,
        updatedRubric: rubric,
      },
    });

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
                Program <span className="text-destructive">*</span>
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
                Subject <span className="text-destructive">*</span>
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Year <span className="text-destructive">*</span>
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
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
              <span className="flex items-center gap-2">Generated Rubric</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {Array.isArray(rubric?.criteria) &&
              rubric.criteria.reduce((s: number, c: any) => s + (Number(c?.weight) || 0), 0) > 100 && (
                <div className="mb-3 text-sm text-destructive">
                  Total weight exceeds 100%. Please adjust.
                </div>
              )}
            <RubricEditor rubric={rubric} onChange={setRubric} />

            <div className="mt-4 flex justify-end">
              <Button
                onClick={acceptRubric}
                variant="success"
                disabled={
                  !Array.isArray(rubric?.criteria) ||
                  rubric.criteria.length === 0 ||
                  rubric.criteria.reduce((s: number, c: any) => s + (Number(c?.weight) || 0), 0) > 100
                }
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
