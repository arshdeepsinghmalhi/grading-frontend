import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RubricEditorProps {
  rubric: any;
  onChange: (updated: any) => void;
}

export function RubricEditor({ rubric, onChange }: RubricEditorProps) {
  const criteria = Array.isArray(rubric?.criteria) ? rubric.criteria : [];
  const [openEditors, setOpenEditors] = useState<Set<number>>(new Set());

  const toggleOpen = (idx: number) => {
    const next = new Set(openEditors);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setOpenEditors(next);
  };

  const safeLevels = (levels: any) => {
    if (!levels || typeof levels !== "object") return {} as Record<string, string>;
    return levels as Record<string, string>;
  };

  const updateCriterion = (idx: number, updates: Partial<any>) => {
    const next = { ...rubric, criteria: [...criteria] };
    next.criteria[idx] = { ...next.criteria[idx], ...updates };
    onChange(next);
  };

  const addCriterion = () => {
    const next = { ...rubric, criteria: [...criteria] };
    next.criteria.push({
      name: "New Criterion",
      description: "",
      weight: 0,
      levels: { "0": "", "1": "", "2": "", "3": "" },
    });
    onChange(next);
  };

  const removeCriterion = (idx: number) => {
    const next = { ...rubric, criteria: criteria.filter((_: any, i: number) => i !== idx) };
    onChange(next);
  };

  const updateLevel = (idx: number, scoreKey: string, description: string) => {
    const current = criteria[idx] || {};
    const levels = { ...safeLevels(current.levels), [scoreKey]: description };
    updateCriterion(idx, { levels });
  };

  const addLevel = (idx: number) => {
    const scoreKey = prompt("Enter score for new level (e.g., 4)")?.trim();
    if (!scoreKey) return;
    const current = criteria[idx] || {};
    const levels = { ...safeLevels(current.levels) } as Record<string, string>;
    if (levels[scoreKey] !== undefined) return;
    levels[scoreKey] = "";
    updateCriterion(idx, { levels });
  };

  const removeLevel = (idx: number, scoreKey: string) => {
    const current = criteria[idx] || {};
    const levels = { ...safeLevels(current.levels) } as Record<string, string>;
    delete levels[scoreKey];
    updateCriterion(idx, { levels });
  };

  const totalWeight = useMemo(() => {
    return criteria.reduce((sum: number, c: any) => sum + (Number(c?.weight) || 0), 0);
  }, [criteria]);

  const remainingWeight = Math.max(0, 100 - totalWeight);
  const isOverLimit = totalWeight > 100;

  const handleWeightChange = (idx: number, newValue: string) => {
    const parsed = Math.max(0, Number(newValue));
    const otherTotal = criteria.reduce((sum: number, c: any, i: number) => {
      if (i === idx) return sum;
      return sum + (Number(c?.weight) || 0);
    }, 0);
    const allowedMax = Math.max(0, 100 - otherTotal);
    const clamped = Math.min(parsed, allowedMax);
    updateCriterion(idx, { weight: clamped });
  };

  return (
    <div className="space-y-4">
      {criteria.length === 0 && (
        <p className="text-sm text-muted-foreground">No criteria yet. Add one to get started.</p>
      )}

      {isOverLimit && (
        <div className="text-sm text-destructive">Total weight exceeds 100%. Please adjust.</div>
      )}

      {criteria.map((c: any, idx: number) => {
        const isOpen = openEditors.has(idx);
        const levels = safeLevels(c?.levels);
        const otherTotal = criteria.reduce((sum: number, c2: any, i: number) => {
          if (i === idx) return sum;
          return sum + (Number(c2?.weight) || 0);
        }, 0);
        const allowedMax = Math.max(0, 100 - otherTotal);
        const remainingForThis = Math.max(0, allowedMax - (Number(c?.weight) || 0));
        return (
          <div key={idx} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c?.name || `Criterion ${idx + 1}`}</div>
                <div className="text-xs text-muted-foreground">Weight: {c?.weight ?? 0}%</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleOpen(idx)}>
                  {isOpen ? "Close" : "Edit"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeCriterion(idx)}>
                  Remove
                </Button>
              </div>
            </div>

            {!isOpen && c?.description && (
              <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
            )}

            {isOpen && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={c?.name || ""}
                      onChange={(e) => updateCriterion(idx, { name: e.target.value })}
                      placeholder="e.g., Clarity of Explanation"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Weight (%)</label>
                    <Input
                      type="number"
                      value={c?.weight ?? 0}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      min={0}
                      max={100}
                    />
                    <div className="text-[11px] text-muted-foreground">Remaining available: {allowedMax}%</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={c?.description || ""}
                    onChange={(e) => updateCriterion(idx, { description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Levels</div>
                    <Button size="sm" variant="outline" onClick={() => addLevel(idx)}>
                      Add Level
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {Object.keys(levels)
                      .sort((a, b) => Number(a) - Number(b))
                      .map((score) => (
                        <div key={score} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Score {score}</div>
                            <Button size="sm" variant="destructive" onClick={() => removeLevel(idx, score)}>
                              Remove
                            </Button>
                          </div>
                          <Textarea
                            value={levels[score] || ""}
                            onChange={(e) => updateLevel(idx, score, e.target.value)}
                            placeholder="Describe performance at this score"
                            className="min-h-[70px]"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Total weight: {totalWeight}%</div>
        <Button onClick={addCriterion} variant="elegant" disabled={totalWeight >= 100}>Add Criterion</Button>
      </div>
    </div>
  );
} 