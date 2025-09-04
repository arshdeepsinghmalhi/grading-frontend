import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackViewerProps {
  feedback: any[];
  onChange: (updated: any[]) => void;
  isLocked: boolean;
}

export function FeedbackViewer({ feedback, onChange, isLocked }: FeedbackViewerProps) {
  const updateField = (index: number, field: string, value: string) => {
    const updated = [...feedback];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {feedback.map((criterion, idx) => (
        <Card key={idx} className="p-4 space-y-4">
          {/* Criterion title */}
          <h3 className="font-semibold text-lg">
            {criterion.criteria_name || `Criterion ${idx + 1}`}
          </h3>

          {/* Score input */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Score</label>
            <Input
              type="number"
              value={criterion.score ?? ""}
              onChange={(e) => updateField(idx, "score", e.target.value)}
              disabled={isLocked}
              className="w-32"
              placeholder="Score"
            />
          </div>

          {/* Feedback textarea */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Feedback</label>
            <Textarea
              value={criterion.feedback ?? ""}
              onChange={(e) => updateField(idx, "feedback", e.target.value)}
              disabled={isLocked}
              className="min-h-[100px]"
              placeholder="Enter feedback"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
