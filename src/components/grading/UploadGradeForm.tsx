import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Brain, Edit3, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

interface UploadGradeFormProps {
  rubricText: string;
  onGradeComplete: () => void;
}

export function UploadGradeForm({ rubricText, onGradeComplete }: UploadGradeFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gradingInstructions, setGradingInstructions] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isResultsLocked, setIsResultsLocked] = useState(true);
  const [hasResults, setHasResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

const gradeAssignment = async () => {
  if (!selectedFile) {
    toast({
      title: "File Required",
      description: "Please upload a student submission file.",
      variant: "destructive",
    });
    return;
  }

  if (!rubricText) {
    toast({
      title: "Rubric Required",
      description: "Please generate and accept a rubric before grading.",
      variant: "destructive",
    });
    return;
  }

  setIsGrading(true);

  try {
    const formData = new FormData();

    // Send the rubric we generated earlier
    formData.append("rubric", rubricText); // rubricText is already a JSON string

    // Attach the uploaded file
    formData.append("file", selectedFile);

    const response = await fetch(`${API_BASE_URL}/api/grade`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to grade assignment");
    }

    const {data} = await response.json();
    console.log('data>>>>>>>>>',data)
    // Adjust based on actual backend response shape
    setScore(data.total_score?.toString() ?? "N/A");
    setFeedback(data.feedback ?? "No feedback received.");
    setHasResults(true);
    setIsResultsLocked(true);

    toast({
      title: "Grading Complete",
      description: "AI has finished grading the submission.",
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Grading Failed",
      description: "Failed to grade assignment. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsGrading(false);
  }
};



  const toggleResultsLock = () => {
    setIsResultsLocked(!isResultsLocked);
  };

  const submitFinalGrade = () => {
    if (!hasResults) {
      toast({
        title: "No Results to Submit",
        description: "Please grade the assignment first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    setIsResultsLocked(true);
    
    toast({
      title: "Grade Submitted Successfully",
      description: "The final grade has been recorded.",
    });
    
    onGradeComplete();
  };

  const resetForNewSubmission = () => {
    setSelectedFile(null);
    setGradingInstructions("");
    setScore("");
    setFeedback("");
    setHasResults(false);
    setIsSubmitted(false);
    setIsResultsLocked(true);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-subtle">
        <CardHeader className="bg-gradient-to-r from-background to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload & Grade Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Student Submission <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                accept=".pdf,.doc,.docx,.txt,.py,.js,.java,.cpp,.c"
                disabled={isSubmitted}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
          </div>



          <Button 
            onClick={gradeAssignment}
            disabled={isGrading || isSubmitted}
            variant="elegant"
            size="lg"
            className="w-full"
          >
            {isGrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                AI is Grading Assignment...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Grade Assignment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasResults && (
        <Card className="shadow-subtle">
          <CardHeader className="bg-gradient-to-r from-background to-warning/10">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {isResultsLocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Edit3 className="h-5 w-5 text-primary" />
                )}
                Grading Results
              </span>
              {!isSubmitted && (
                <Button
                  onClick={toggleResultsLock}
                  variant="outline"
                  size="sm"
                >
                  {isResultsLocked ? "Edit Results" : "Lock Results"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Score
              </label>
              <Input
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={isResultsLocked}
                placeholder="Enter score out of 100"
                className="font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Feedback
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isResultsLocked}
                className="min-h-[200px] resize-none font-mono text-sm"
              />
            </div>

            {!isSubmitted && (
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={submitFinalGrade}
                  variant="success"
                  size="lg"
                  disabled={!isResultsLocked}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Final Grade
                </Button>
              </div>
            )}

            {isSubmitted && (
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Grade Successfully Submitted</span>
                </div>
                <Button 
                  onClick={resetForNewSubmission}
                  variant="outline"
                >
                  Grade Another Submission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}