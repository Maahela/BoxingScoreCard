import type {
  CriteriaItem,
  ScoreInputState,
  Participant,
  Faculty,
} from '@/types';

interface CombatScoreCardProps {
  criteria: CriteriaItem[];
  participant1: Participant;
  participant2: Participant;
  faculty1: Faculty | undefined;
  faculty2: Faculty | undefined;
  scores1: ScoreInputState[];
  scores2: ScoreInputState[];
  onScore1Change: (criteriaId: string, score: number) => void;
  onScore2Change: (criteriaId: string, score: number) => void;
  disabled?: boolean;
}

export function CombatScoreCard({
  criteria,
  participant1,
  participant2,
  faculty1,
  faculty2,
  scores1,
  scores2,
  onScore1Change,
  onScore2Change,
  disabled,
}: CombatScoreCardProps) {
  const total1 = scores1.reduce((sum, s) => sum + s.score, 0);
  const total2 = scores2.reduce((sum, s) => sum + s.score, 0);

  const handleIncrement = (
    criteriaId: string,
    currentScore: number,
    maxPoints: number,
    isParticipant1: boolean
  ) => {
    if (currentScore < maxPoints) {
      const newScore = currentScore + 1;
      if (isParticipant1) {
        onScore1Change(criteriaId, newScore);
      } else {
        onScore2Change(criteriaId, newScore);
      }
    }
  };

  const handleDecrement = (
    criteriaId: string,
    currentScore: number,
    isParticipant1: boolean
  ) => {
    if (currentScore > 0) {
      const newScore = currentScore - 1;
      if (isParticipant1) {
        onScore1Change(criteriaId, newScore);
      } else {
        onScore2Change(criteriaId, newScore);
      }
    }
  };

  return (
    <div className="card">
      {/* Fighter Headers */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="text-center p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Fighter A</div>
          <div className="text-xl font-bold text-blue-900">
            {participant1.alias || participant1.name}
          </div>
          {faculty1 && (
            <div
              className="text-sm font-semibold mt-1"
              style={{ color: faculty1.colorHex }}
            >
              {faculty1.name}
            </div>
          )}
        </div>
        <div className="text-center p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Fighter B</div>
          <div className="text-xl font-bold text-green-900">
            {participant2.alias || participant2.name}
          </div>
          {faculty2 && (
            <div
              className="text-sm font-semibold mt-1"
              style={{ color: faculty2.colorHex }}
            >
              {faculty2.name}
            </div>
          )}
        </div>
      </div>

      {/* Criteria Rows */}
      <div className="space-y-3">
        {criteria.map((criterion) => {
          const score1 =
            scores1.find((s) => s.criteriaId === criterion.id)?.score || 0;
          const score2 =
            scores2.find((s) => s.criteriaId === criterion.id)?.score || 0;

          return (
            <div
              key={criterion.id}
              className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center py-3 px-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Fighter A Controls */}
              <div className="flex justify-end items-center gap-3">
                <div className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                  {score1}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecrement(criterion.id, score1, true)}
                    disabled={disabled || score1 === 0}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors text-xl"
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      handleIncrement(
                        criterion.id,
                        score1,
                        criterion.maxPoints,
                        true
                      )
                    }
                    disabled={disabled || score1 >= criterion.maxPoints}
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Criterion Label */}
              <div className="text-center min-w-[200px]">
                <div className="font-semibold text-gray-800">
                  {criterion.label}
                </div>
                <div className="text-sm text-gray-500">
                  ({criterion.maxPoints})
                </div>
              </div>

              {/* Fighter B Controls */}
              <div className="flex justify-start items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecrement(criterion.id, score2, false)}
                    disabled={disabled || score2 === 0}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors text-xl"
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      handleIncrement(
                        criterion.id,
                        score2,
                        criterion.maxPoints,
                        false
                      )
                    }
                    disabled={disabled || score2 >= criterion.maxPoints}
                    className="w-10 h-10 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
                <div className="text-2xl font-bold text-green-600 min-w-[3rem] text-center">
                  {score2}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Scores Footer */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-lg text-center">
          <div className="text-sm text-gray-600 mb-1">Current Score</div>
          <div className="text-4xl font-bold text-blue-700">{total1}</div>
        </div>
        <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg text-center">
          <div className="text-sm text-gray-600 mb-1">Current Score</div>
          <div className="text-4xl font-bold text-green-700">{total2}</div>
        </div>
      </div>
    </div>
  );
}
