import type { CriteriaItem, ScoreInputState } from '@/types';
import { ScoreInput } from './ScoreInput';

interface CriteriaListProps {
  criteria: CriteriaItem[];
  scores: ScoreInputState[];
  onScoreChange: (criteriaId: string, score: number) => void;
  disabled?: boolean;
}

export function CriteriaList({
  criteria,
  scores,
  onScoreChange,
  disabled,
}: CriteriaListProps) {
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <div>
      {criteria.map((criterion) => {
        const scoreState = scores.find((s) => s.criteriaId === criterion.id);
        return (
          <ScoreInput
            key={criterion.id}
            criteria={criterion}
            value={scoreState?.score || 0}
            onChange={(value) => onScoreChange(criterion.id, value)}
            disabled={disabled}
          />
        );
      })}
      
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-800">Total Score:</span>
          <span className="text-3xl font-bold text-blue-600">
            {totalScore} / {maxTotalScore}
          </span>
        </div>
      </div>
    </div>
  );
}
