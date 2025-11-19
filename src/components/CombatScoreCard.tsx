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
    // Validate inputs
    if (typeof currentScore !== 'number' || typeof maxPoints !== 'number') {
      console.error('Invalid score or maxPoints value');
      return;
    }

    if (currentScore < 0 || currentScore > maxPoints) {
      console.error('Score out of valid range');
      return;
    }

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
    // Validate inputs
    if (typeof currentScore !== 'number' || currentScore < 0) {
      console.error('Invalid score value');
      return;
    }

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
    <div className="boxing-panel p-6 md:p-8">
      {/* Fighter Headers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <div className="text-sm text-gray-300 mb-2 tracking-wider uppercase font-semibold">
            Fighter A
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white boxing-title">
            {participant1.alias || participant1.name}
          </div>
          {faculty1 && (
            <div
              className="text-sm font-semibold mt-2 tracking-wide"
              style={{ color: faculty1.colorHex || '#EDEDED' }}
            >
              {faculty1.name}
            </div>
          )}
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-xl backdrop-blur-sm">
          <div className="text-sm text-gray-300 mb-2 tracking-wider uppercase font-semibold">
            Fighter B
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white boxing-title">
            {participant2.alias || participant2.name}
          </div>
          {faculty2 && (
            <div
              className="text-sm font-semibold mt-2 tracking-wide"
              style={{ color: faculty2.colorHex || '#EDEDED' }}
            >
              {faculty2.name}
            </div>
          )}
        </div>
      </div>

      {/* Criteria Rows */}
      <div className="space-y-4">
        {criteria.map((criterion) => {
          const score1 =
            scores1.find((s) => s.criteriaId === criterion.id)?.score || 0;
          const score2 =
            scores2.find((s) => s.criteriaId === criterion.id)?.score || 0;

          return (
            <div
              key={criterion.id}
              className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center py-4 px-4 bg-black/20 rounded-lg border border-white/10 backdrop-blur-sm"
            >
              {/* Fighter A Controls */}
              <div className="flex justify-end items-center gap-3">
                <div className="text-2xl md:text-3xl font-bold text-red-400 min-w-[3rem] text-center">
                  {score1}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecrement(criterion.id, score1, true)}
                    disabled={disabled || score1 === 0}
                    className="score-control w-12 h-12 font-bold rounded-lg text-xl disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="score-control w-12 h-12 font-bold rounded-lg text-xl disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Criterion Label */}
              <div className="text-center min-w-[180px] md:min-w-[220px]">
                <div className="criteria-label text-base md:text-lg">
                  {criterion.label}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Max: {criterion.maxPoints}
                </div>
              </div>

              {/* Fighter B Controls */}
              <div className="flex justify-start items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecrement(criterion.id, score2, false)}
                    disabled={disabled || score2 === 0}
                    className="score-control w-12 h-12 font-bold rounded-lg text-xl disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="score-control w-12 h-12 font-bold rounded-lg text-xl disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-blue-400 min-w-[3rem] text-center">
                  {score2}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Scores Footer */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/40 rounded-xl text-center backdrop-blur-sm">
          <div className="text-sm text-gray-300 mb-2 tracking-wider uppercase">
            Current Score
          </div>
          <div className="text-5xl font-bold text-white boxing-title">
            {total1}
          </div>
        </div>
        <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/40 rounded-xl text-center backdrop-blur-sm">
          <div className="text-sm text-gray-300 mb-2 tracking-wider uppercase">
            Current Score
          </div>
          <div className="text-5xl font-bold text-white boxing-title">
            {total2}
          </div>
        </div>
      </div>
    </div>
  );
}
