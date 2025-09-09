import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackViewer } from "./FeedbackEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

import {
  Upload,
  FileText,
  Brain,
  Edit3,
  Lock,
  CheckCircle,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UploadGradeFormProps {
  rubricText: string;
  onGradeComplete: () => void;
  questionId: string;
  questionText: string;
}

export function UploadGradeForm({
  rubricText,
  onGradeComplete,
  questionId,
  questionText,
}: UploadGradeFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState("");
  const [gradingInstructions, setGradingInstructions] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isResultsLocked, setIsResultsLocked] = useState(true);
  const [hasResults, setHasResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Parse feedback into array
  const parsedFeedback = useMemo(() => {
    try {
      return JSON.parse(feedback);
    } catch {
      return [];
    }
  }, [feedback]);

  const handleFeedbackChange = (updated: any[]) => {
    setFeedback(JSON.stringify(updated, null, 2));
  };

  const startCamera = async () => {
    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        streamRef.current = stream;
      } catch {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        streamRef.current = stream;
      }

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        setHasCameraPermission(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check your permissions.",
        variant: "destructive",
      });
      setIsCameraOpen(false);
      setHasCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOpen]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    if (!blob) return;
    const file = new File([blob], `captured-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setSelectedFile(file);
    setIsCameraOpen(false);
    toast({
      title: "Photo Captured",
      description: "The captured photo has been attached.",
    });
  };

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

    if (!userId) {
      toast({
        title: "Student ID Required",
        description: "Please enter a student ID.",
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

      formData.append("rubric", rubricText);
      formData.append("file", selectedFile);
      formData.append("questionId", questionId);
      formData.append("questionText", questionText);
      formData.append("userId", userId);
      formData.append("userEmail", user?.email || "");
      const response = await fetch(`${API_BASE_URL}/api/grade`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to grade assignment");
      }

      const { data } = await response.json();

      setGradeId(data.gradeId);
      setScore(data.total_score?.toString() ?? "N/A");
      setFeedback(
        JSON.stringify(data.criteria_wise_result) ?? "No feedback received."
      );
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

  const submitFinalGrade = async () => {
    if (!hasResults) {
      toast({
        title: "No Results to Submit",
        description: "Please grade the assignment first.",
        variant: "destructive",
      });
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/api/update/feedback-data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: gradeId,
          updatedScore: score,
          userEmail: user?.email || "",
          updatedFeedback: feedback,
        }),
      });
    } catch (error) {
      console.error(error);
    }
    setGradeId("");
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
    setGradeId("");
  };

  return (
    <div className="space-y-6">
      {/* Upload & Grade Card */}
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
                accept=".pdf,.doc,.docx,.txt,.py,.js,.java,.cpp,.c,.png,.jpg,.jpeg"
                disabled={isSubmitted}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Student ID <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter student ID"
                className="max-w-xs"
                disabled={isSubmitted}
              />
            </div>

            {/* Camera Capture */}
            <div className="flex items-center gap-3">
              <Dialog
                open={isCameraOpen}
                onOpenChange={(open) => {
                  setIsCameraOpen(open);
                  if (!open) stopCamera();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitted}
                    className="flex items-center gap-2"
                    onClick={async () => {
                      if (!hasCameraPermission) {
                        try {
                          await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: "environment" },
                          });
                          setHasCameraPermission(true);
                        } catch (err) {
                          toast({
                            title: "Camera Permission Required",
                            description:
                              "Please allow camera access to use this feature.",
                            variant: "destructive",
                          });
                          return;
                        }
                      }
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Capture Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Capture Answer Photo</DialogTitle>
                    <DialogDescription>
                      Position the answer sheet in the frame and ensure good
                      lighting for a clear image.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="aspect-video w-full bg-black rounded overflow-hidden relative">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        playsInline
                        autoPlay
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsCameraOpen(false);
                          stopCamera();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={capturePhoto}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Capture
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

      {/* Grading Results */}
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
                <Button onClick={toggleResultsLock} variant="outline" size="sm">
                  {isResultsLocked ? "Edit Results" : "Lock Results"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Score */}
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

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Feedback
              </label>
              <FeedbackViewer
                feedback={parsedFeedback}
                onChange={handleFeedbackChange}
                isLocked={isResultsLocked}
              />
            </div>

            {/* Submit / Success */}
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
                  <span className="font-medium">
                    Grade Successfully Submitted
                  </span>
                </div>
                <Button onClick={resetForNewSubmission} variant="outline">
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
