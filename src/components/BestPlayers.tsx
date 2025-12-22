import { Event, Faculty, Participant, Score } from '@/types';

interface BestPlayerInfo {
  participant: Participant;
  faculty: Faculty;
  score: number;
  event?: Event;
}

interface BestPlayersProps {
  faculties: Faculty[];
  events: Event[];
  scores: Score[];
  participants: Participant[];
}

export function BestPlayers({
  faculties,
  events,
  scores,
  participants,
}: BestPlayersProps) {
  // Calculate best player for each event
  const getBestPlayersByEvent = (): Map<string, BestPlayerInfo> => {
    const bestByEvent = new Map<string, BestPlayerInfo>();

    events.forEach((event) => {
      let bestScore = -1;
      let bestPlayer: BestPlayerInfo | null = null;

      // For Combat: use averaged scores
      if (event.name === 'Boxing Combat') {
        const combatScores = scores.filter((s) => s.eventId === event.id);

        // Group by participant and judge
        const scoresByParticipant = new Map<string, Score[]>();
        combatScores.forEach((score) => {
          if (!scoresByParticipant.has(score.participantId)) {
            scoresByParticipant.set(score.participantId, []);
          }
          scoresByParticipant.get(score.participantId)!.push(score);
        });

        // Average scores from two judges per participant
        scoresByParticipant.forEach((participantScores, participantId) => {
          const scoresByJudge = new Map<string, Score[]>();
          participantScores.forEach((s) => {
            if (!scoresByJudge.has(s.invigilatorId)) {
              scoresByJudge.set(s.invigilatorId, []);
            }
            scoresByJudge.get(s.invigilatorId)!.push(s);
          });

          const latestScores = Array.from(scoresByJudge.values())
            .map((arr) => arr.sort((a, b) => b.timestamp - a.timestamp)[0])
            .filter(Boolean);

          if (latestScores.length >= 2) {
            const [score1, score2] = latestScores.slice(0, 2);
            const averageTotal = (score1.total + score2.total) / 2;

            if (averageTotal > bestScore) {
              const participant = participants.find(
                (p) => p.id === participantId
              );
              const faculty = faculties.find((f) => f.id === score1.facultyId);
              if (participant && faculty) {
                bestScore = averageTotal;
                bestPlayer = {
                  participant,
                  faculty,
                  score: averageTotal,
                  event,
                };
              }
            }
          } else if (latestScores.length === 1) {
            const score = latestScores[0];
            if (score.total > bestScore) {
              const participant = participants.find(
                (p) => p.id === participantId
              );
              const faculty = faculties.find((f) => f.id === score.facultyId);
              if (participant && faculty) {
                bestScore = score.total;
                bestPlayer = {
                  participant,
                  faculty,
                  score: score.total,
                  event,
                };
              }
            }
          }
        });
      }
      // For Skipping: average R1 and R2
      else if (event.name === 'Skipping') {
        const skippingScores = scores.filter((s) => s.eventId === event.id);
        const scoresByParticipant = new Map<string, Score[]>();

        skippingScores.forEach((score) => {
          if (!scoresByParticipant.has(score.participantId)) {
            scoresByParticipant.set(score.participantId, []);
          }
          scoresByParticipant.get(score.participantId)!.push(score);
        });

        scoresByParticipant.forEach((participantScores, participantId) => {
          const r1 = participantScores.find((s) => s.roundNumber === 1);
          const r2 = participantScores.find((s) => s.roundNumber === 2);

          if (r1 && r2) {
            const average = (r1.total + r2.total) / 2;
            if (average > bestScore) {
              const participant = participants.find(
                (p) => p.id === participantId
              );
              const faculty = faculties.find((f) => f.id === r1.facultyId);
              if (participant && faculty) {
                bestScore = average;
                bestPlayer = { participant, faculty, score: average, event };
              }
            }
          } else if (r1 && r1.total > bestScore) {
            const participant = participants.find(
              (p) => p.id === participantId
            );
            const faculty = faculties.find((f) => f.id === r1.facultyId);
            if (participant && faculty) {
              bestScore = r1.total;
              bestPlayer = { participant, faculty, score: r1.total, event };
            }
          }
        });
      }
      // For other events: simple highest score
      else {
        scores
          .filter((s) => s.eventId === event.id)
          .forEach((score) => {
            if (score.total > bestScore) {
              const participant = participants.find(
                (p) => p.id === score.participantId
              );
              const faculty = faculties.find((f) => f.id === score.facultyId);
              if (participant && faculty) {
                bestScore = score.total;
                bestPlayer = {
                  participant,
                  faculty,
                  score: score.total,
                  event,
                };
              }
            }
          });
      }

      if (bestPlayer) {
        bestByEvent.set(event.id, bestPlayer);
      }
    });

    return bestByEvent;
  };

  // Calculate overall best player (highest combined score across all events)
  const getOverallBestPlayer = (): BestPlayerInfo | null => {
    const participantTotals = new Map<
      string,
      {
        total: number;
        count: number;
        participant: Participant;
        faculty: Faculty;
      }
    >();

    // Process Combat scores with averaging
    const combatEvent = events.find((e) => e.name === 'Boxing Combat');
    if (combatEvent) {
      const combatScores = scores.filter((s) => s.eventId === combatEvent.id);
      const scoresByParticipant = new Map<string, Score[]>();

      combatScores.forEach((score) => {
        if (!scoresByParticipant.has(score.participantId)) {
          scoresByParticipant.set(score.participantId, []);
        }
        scoresByParticipant.get(score.participantId)!.push(score);
      });

      scoresByParticipant.forEach((participantScores, participantId) => {
        const scoresByJudge = new Map<string, Score[]>();
        participantScores.forEach((s) => {
          if (!scoresByJudge.has(s.invigilatorId)) {
            scoresByJudge.set(s.invigilatorId, []);
          }
          scoresByJudge.get(s.invigilatorId)!.push(s);
        });

        const latestScores = Array.from(scoresByJudge.values())
          .map((arr) => arr.sort((a, b) => b.timestamp - a.timestamp)[0])
          .filter(Boolean);

        if (latestScores.length >= 2) {
          const [score1, score2] = latestScores.slice(0, 2);
          const averageTotal = (score1.total + score2.total) / 2;
          const participant = participants.find((p) => p.id === participantId);
          const faculty = faculties.find((f) => f.id === score1.facultyId);

          if (participant && faculty) {
            if (!participantTotals.has(participantId)) {
              participantTotals.set(participantId, {
                total: 0,
                count: 0,
                participant,
                faculty,
              });
            }
            const entry = participantTotals.get(participantId)!;
            entry.total += averageTotal;
            entry.count += 1;
          }
        } else if (latestScores.length === 1) {
          const score = latestScores[0];
          const participant = participants.find((p) => p.id === participantId);
          const faculty = faculties.find((f) => f.id === score.facultyId);

          if (participant && faculty) {
            if (!participantTotals.has(participantId)) {
              participantTotals.set(participantId, {
                total: 0,
                count: 0,
                participant,
                faculty,
              });
            }
            const entry = participantTotals.get(participantId)!;
            entry.total += score.total;
            entry.count += 1;
          }
        }
      });
    }

    // Process Skipping scores with R1/R2 averaging
    const skippingEvent = events.find((e) => e.name === 'Skipping');
    if (skippingEvent) {
      const skippingScores = scores.filter(
        (s) => s.eventId === skippingEvent.id
      );
      const scoresByParticipant = new Map<string, Score[]>();

      skippingScores.forEach((score) => {
        if (!scoresByParticipant.has(score.participantId)) {
          scoresByParticipant.set(score.participantId, []);
        }
        scoresByParticipant.get(score.participantId)!.push(score);
      });

      scoresByParticipant.forEach((participantScores, participantId) => {
        const r1 = participantScores.find((s) => s.roundNumber === 1);
        const r2 = participantScores.find((s) => s.roundNumber === 2);

        let skippingScore = 0;
        if (r1 && r2) {
          skippingScore = (r1.total + r2.total) / 2;
        } else if (r1) {
          skippingScore = r1.total;
        }

        if (skippingScore > 0) {
          const participant = participants.find((p) => p.id === participantId);
          const faculty = faculties.find((f) => f.id === r1!.facultyId);

          if (participant && faculty) {
            if (!participantTotals.has(participantId)) {
              participantTotals.set(participantId, {
                total: 0,
                count: 0,
                participant,
                faculty,
              });
            }
            const entry = participantTotals.get(participantId)!;
            entry.total += skippingScore;
            entry.count += 1;
          }
        }
      });
    }

    // Process other events
    scores
      .filter((s) => {
        const event = events.find((e) => e.id === s.eventId);
        return (
          event && event.name !== 'Boxing Combat' && event.name !== 'Skipping'
        );
      })
      .forEach((score) => {
        const participant = participants.find(
          (p) => p.id === score.participantId
        );
        const faculty = faculties.find((f) => f.id === score.facultyId);

        if (participant && faculty) {
          if (!participantTotals.has(score.participantId)) {
            participantTotals.set(score.participantId, {
              total: 0,
              count: 0,
              participant,
              faculty,
            });
          }
          const entry = participantTotals.get(score.participantId)!;
          entry.total += score.total;
          entry.count += 1;
        }
      });

    // Find the participant with the highest total
    let bestOverall: BestPlayerInfo | null = null;
    let highestTotal = -1;

    participantTotals.forEach((entry) => {
      if (entry.total > highestTotal) {
        highestTotal = entry.total;
        bestOverall = {
          participant: entry.participant,
          faculty: entry.faculty,
          score: entry.total,
        };
      }
    });

    return bestOverall;
  };

  const bestByEvent = getBestPlayersByEvent();
  const overallBest = getOverallBestPlayer();

  if (bestByEvent.size === 0 && !overallBest) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Best Player Overall */}
      {overallBest && (
        <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-6xl">🏆</span>
            <h2 className="text-4xl font-bold text-white text-center">
              Best Player Overall
            </h2>
            <span className="text-6xl">🏆</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: overallBest.faculty.colorHex }}
                />
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {overallBest.participant.alias ||
                      overallBest.participant.name}
                  </div>
                  <div className="text-xl text-white/90">
                    {overallBest.faculty.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-lg mb-1">Total Score</div>
                <div className="text-6xl font-bold text-white">
                  {overallBest.score.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Players by Event */}
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          🌟 Best Players by Event
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events
            .sort((a, b) => a.order - b.order)
            .map((event) => {
              const best = bestByEvent.get(event.id);
              if (!best) return null;

              return (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="text-xl font-bold text-blue-400 mb-4 text-center">
                    {event.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full border-3 border-white shadow"
                        style={{ backgroundColor: best.faculty.colorHex }}
                      />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {best.participant.alias || best.participant.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          {best.faculty.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs mb-1">Score</div>
                      <div className="text-3xl font-bold text-green-400">
                        {best.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
