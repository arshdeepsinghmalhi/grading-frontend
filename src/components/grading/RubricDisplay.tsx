interface RubricDisplayProps {
  rubric: any;
}

export function RubricDisplay({ rubric }: RubricDisplayProps) {
  if (!rubric || typeof rubric !== "object") {
    return <p className="text-muted-foreground">No rubric available.</p>;
  }

  const { criteria, notes } = rubric;

  return (
    <div className="space-y-6">
      {/* Criteria Section */}
      {Array.isArray(criteria) && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Criteria</h2>
          <div className="space-y-6">
            {criteria.map((c: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-base">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                {c.weight && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: {c.weight}%
                  </p>
                )}

                {/* Levels Table */}
                {c.levels && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Levels</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="border px-2 py-1 text-left w-12">Score</th>
                            <th className="border px-2 py-1 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(c.levels).map(([score, desc]) => (
                            <tr key={score}>
                              <td className="border px-2 py-1 font-medium">{score}</td>
                              <td className="border px-2 py-1">{desc as string}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {notes && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
