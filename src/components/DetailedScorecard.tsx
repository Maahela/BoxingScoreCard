import { Fragment } from 'react';
import type { Faculty, Event, Score, Participant } from '@/types';

interface DetailedScorecardProps {
  faculties: Faculty[];
  events: Event[];
  scores: Score[];
  participants: Participant[];
}

export function DetailedScorecard({
  faculties,
  events,
  scores,
  participants,
}: DetailedScorecardProps) {
  // Remove duplicate events (same name) - this handles duplicate database entries
  const seenNames = new Set<string>();
  const uniqueEvents = events.filter((event) => {
    if (seenNames.has(event.name)) {
      console.warn(
        'Duplicate event detected and removed in DetailedScorecard:',
        event.name
      );
      return false;
    }
    seenNames.add(event.name);
    return true;
  });

  // Group scores by event and faculty
  const scoresByEventFaculty = new Map<string, Map<string, Score[]>>();

  // Debug: Check for duplicate score IDs
  const scoreIds = scores.map((s) => s.id).filter((id) => id);
  const uniqueScoreIds = new Set(scoreIds);
  if (uniqueScoreIds.size !== scoreIds.length) {
    console.warn('Duplicate score IDs detected in DetailedScorecard:', scores);
  }

  scores.forEach((score) => {
    if (!scoresByEventFaculty.has(score.eventId)) {
      scoresByEventFaculty.set(score.eventId, new Map());
    }
    const eventScores = scoresByEventFaculty.get(score.eventId)!;
    if (!eventScores.has(score.facultyId)) {
      eventScores.set(score.facultyId, []);
    }
    eventScores.get(score.facultyId)!.push(score);
  });

  // Process Combat events to average scores from two judges
  // For Boxing Combat, we need to group scores by participantId and average across judges
  uniqueEvents.forEach((event) => {
    if (event.name === 'Boxing Combat') {
      const eventScoresMap = scoresByEventFaculty.get(event.id);
      if (!eventScoresMap) return;

      console.log('[DetailedScorecard] Processing Combat event for averaging');

      // Process each faculty's combat scores
      faculties.forEach((faculty) => {
        const facultyScores = eventScoresMap.get(faculty.id);
        if (!facultyScores || facultyScores.length === 0) return;

        console.log(`[DetailedScorecard] Faculty ${faculty.name} has ${facultyScores.length} combat scores`);

        // Group scores by participantId
        const scoresByParticipant = new Map<string, Score[]>();
        facultyScores.forEach((score) => {
          if (!scoresByParticipant.has(score.participantId)) {
            scoresByParticipant.set(score.participantId, []);
          }
          scoresByParticipant.get(score.participantId)!.push(score);
        });

        console.log(`[DetailedScorecard] Grouped into ${scoresByParticipant.size} participants`);

        // Create averaged scores handling ANY number of judge entries (multiple bouts)
        const averagedScores: Score[] = [];
        scoresByParticipant.forEach((participantScores) => {
          console.log(
            `[DetailedScorecard] Participant has ${participantScores.length} total combat score entries`
          );

          // Group by judge (invigilatorId) and take latest score per judge
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
            console.log(
              `[DetailedScorecard] Averaging latest judge scores totals=${score1.total},${score2.total}`
            );
            const averagedCriteriaScores = score1.criteriaScores.map(
              (criteria, idx) => ({
                criteriaId: criteria.criteriaId,
                score: (criteria.score + score2.criteriaScores[idx].score) / 2,
              })
            );
            const averagedTotal = (score1.total + score2.total) / 2;
            averagedScores.push({
              ...score1,
              criteriaScores: averagedCriteriaScores,
              total: averagedTotal,
              invigilatorId: 'averaged',
            });
          } else if (latestScores.length === 1) {
            console.log(
              `[DetailedScorecard] Only one judge latest score total=${latestScores[0].total}`
            );
            averagedScores.push(latestScores[0]);
          } else {
            console.log('[DetailedScorecard] No valid judge scores found');
          }
        });

        console.log(`[DetailedScorecard] Final averaged scores count: ${averagedScores.length}`);
        // Replace faculty scores with averaged scores
        eventScoresMap.set(faculty.id, averagedScores);
      });
    }
  });

  // Calculate faculty totals
  const facultyTotals = new Map<string, number>();
  faculties.forEach((faculty) => {
    let total = 0;
    uniqueEvents.forEach((event) => {
      const eventScores =
        scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
      if (eventScores.length > 0) {
        // Skipping special handling: average of round 1 & 2 if both present
        let eventScore: number;
        if (event.name === 'Skipping') {
          const r1 = eventScores.find((s) => s.roundNumber === 1);
          const r2 = eventScores.find((s) => s.roundNumber === 2);
          if (r1 && r2) {
            eventScore = (r1.total + r2.total) / 2;
          } else if (r1) {
            eventScore = r1.total;
          } else if (r2) {
            eventScore = r2.total;
          } else {
            eventScore = 0;
          }
        } else {
          const sum = eventScores.reduce((acc, s) => acc + s.total, 0);
          eventScore =
            event.participantsRequired === 2 ? sum / eventScores.length : sum;
        }
        total += eventScore;
      }
    });
    facultyTotals.set(faculty.id, total);
  });

  // Sort faculties by total
  const sortedFaculties = [...faculties].sort(
    (a, b) => (facultyTotals.get(b.id) || 0) - (facultyTotals.get(a.id) || 0)
  );

  // Find the maximum number of participants per faculty across all events
  const maxParticipantsPerFaculty = Math.max(
    ...uniqueEvents.map((event) =>
      Math.max(
        ...sortedFaculties.map((faculty) => {
          const facultyScores =
            scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
          return facultyScores.length;
        })
      )
    )
  );

  // Calculate total columns based on max participants
  const totalColumns = 1 + sortedFaculties.length * maxParticipantsPerFaculty;

  return (
    <div className="overflow-x-auto">
      {/* Individual Event Tables */}
      {uniqueEvents.map((event, eventIndex) => {
        const isLastEvent = eventIndex === uniqueEvents.length - 1;

        return (
          <table key={event.id} className="w-full border-collapse text-sm">
            {/* Event Header */}
            <thead>
              <tr className="bg-green-600">
                <th
                  className="border border-gray-600 px-4 py-2 text-left text-white font-bold"
                  colSpan={totalColumns}
                >
                  {event.name.toUpperCase()}
                </th>
              </tr>
              <tr className="bg-gray-700">
                <th
                  className="border border-gray-600 px-4 py-2 text-left text-white"
                  style={{
                    width: '250px',
                    minWidth: '250px',
                    maxWidth: '250px',
                  }}
                >
                  Criteria / Max Points
                </th>
                {sortedFaculties.map((faculty) => {
                  const facultyScores =
                    scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
                  const sortedScores =
                    event.name === 'Skipping'
                      ? [...facultyScores].sort(
                          (a, b) => a.roundNumber - b.roundNumber
                        )
                      : facultyScores;
                  const emptySlots =
                    maxParticipantsPerFaculty - sortedScores.length;

                  return (
                    <Fragment key={faculty.id}>
                      {sortedScores.length > 0 ? (
                        <>
                          {sortedScores.map((score, idx) => {
                            const participant = participants.find(
                              (p) => p.id === score.participantId
                            );
                            const roundLabel =
                              event.name === 'Skipping'
                                ? ` R${score.roundNumber}`
                                : '';
                            return (
                              <th
                                key={score.id || idx}
                                className="border border-gray-600 px-3 py-2 text-center text-white font-semibold"
                                style={{
                                  backgroundColor: faculty.colorHex,
                                  minWidth: '100px',
                                }}
                              >
                                <div className="font-semibold">
                                  {faculty.name}
                                  {roundLabel}
                                </div>
                                <div className="font-normal mt-1">
                                  {participant?.alias ||
                                    participant?.name ||
                                    'Participant ' + (idx + 1)}
                                </div>
                              </th>
                            );
                          })}
                          {/* Add empty slots to align columns */}
                          {Array.from({ length: emptySlots }).map((_, idx) => (
                            <th
                              key={`empty-${idx}`}
                              className="border border-gray-600 px-3 py-2 text-center text-white"
                              style={{
                                backgroundColor: faculty.colorHex,
                                minWidth: '100px',
                                opacity: 0.3,
                              }}
                            >
                              <div className="font-semibold">
                                {faculty.name}
                              </div>
                              <div className="font-normal mt-1">-</div>
                            </th>
                          ))}
                        </>
                      ) : (
                        <>
                          {Array.from({
                            length: maxParticipantsPerFaculty,
                          }).map((_, idx) => (
                            <th
                              key={`empty-${idx}`}
                              className="border border-gray-600 px-3 py-2 text-center text-white"
                              style={{
                                backgroundColor: faculty.colorHex,
                                minWidth: '100px',
                                opacity: 0.3,
                              }}
                            >
                              <div className="font-semibold">
                                {faculty.name}
                              </div>
                              <div className="font-normal mt-1">-</div>
                            </th>
                          ))}
                        </>
                      )}
                    </Fragment>
                  );
                })}
              </tr>
            </thead>

            {/* Get criteria from first score or show placeholder */}
            <tbody>
              {(() => {
                // Find any score for this event to get criteria structure
                const sampleScore = scores.find((s) => s.eventId === event.id);
                if (!sampleScore) {
                  return (
                    <tr>
                      <td
                        colSpan={totalColumns}
                        className="border border-gray-600 px-4 py-2 text-center text-gray-400"
                      >
                        No scores submitted yet
                      </td>
                    </tr>
                  );
                }

                return sampleScore.criteriaScores.map(
                  (criteria, criteriaIdx) => {
                    return (
                      <tr
                        key={criteriaIdx}
                        className="bg-gray-800 hover:bg-gray-750"
                      >
                        <td
                          className="border border-gray-600 px-4 py-2 text-white"
                          style={{
                            width: '250px',
                            minWidth: '250px',
                            maxWidth: '250px',
                          }}
                        >
                          <div className="flex justify-between">
                            <span>
                              {criteria.criteriaId
                                .split('_')
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(' ')}
                            </span>
                            <span className="text-gray-400 ml-4">
                              {/* Get max from template - for now showing placeholder */}
                              {event.name === 'Shadow Boxing' && criteriaIdx < 7
                                ? [10, 10, 10, 10, 25, 20, 15][criteriaIdx]
                                : event.name === 'Punching Bag' &&
                                  criteriaIdx < 5
                                ? [20, 20, 30, 20, 10][criteriaIdx]
                                : event.name === 'Skipping' && criteriaIdx < 6
                                ? [20, 10, 20, 10, 30, 10][criteriaIdx]
                                : 10}
                            </span>
                          </div>
                        </td>
                        {sortedFaculties.map((faculty) => {
                          const facultyScores =
                            scoresByEventFaculty
                              .get(event.id)
                              ?.get(faculty.id) || [];
                          const sortedScores =
                            event.name === 'Skipping'
                              ? [...facultyScores].sort(
                                  (a, b) => a.roundNumber - b.roundNumber
                                )
                              : facultyScores;
                          const emptySlots =
                            maxParticipantsPerFaculty - sortedScores.length;

                          return (
                            <Fragment key={faculty.id}>
                              {sortedScores.map((score, idx) => {
                                const criteriaScore = score.criteriaScores.find(
                                  (c) => c.criteriaId === criteria.criteriaId
                                );
                                return (
                                  <td
                                    key={score.id || idx}
                                    className="border border-gray-600 px-3 py-2 text-center font-semibold"
                                    style={{ backgroundColor: '#1f2937' }}
                                  >
                                    {typeof criteriaScore?.score === 'number' ? criteriaScore.score.toFixed(2) : '0.00'}
                                  </td>
                                );
                              })}
                              {/* Add empty slots to maintain alignment */}
                              {Array.from({ length: emptySlots }).map(
                                (_, idx) => (
                                  <td
                                    key={`empty-${idx}`}
                                    className="border border-gray-600 px-3 py-2 text-center text-gray-500"
                                    style={{
                                      backgroundColor: '#1f2937',
                                      opacity: 0.3,
                                    }}
                                  >
                                    -
                                  </td>
                                )
                              )}
                            </Fragment>
                          );
                        })}
                      </tr>
                    );
                  }
                );
              })()}

              {/* Totals Row */}
              <tr className="bg-gray-900 font-bold">
                <td
                  className="border border-gray-600 px-4 py-2 text-white"
                  style={{
                    width: '250px',
                    minWidth: '250px',
                    maxWidth: '250px',
                  }}
                >
                  TOTAL
                </td>
                {sortedFaculties.map((faculty) => {
                  const facultyScores =
                    scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
                  const sortedScores =
                    event.name === 'Skipping'
                      ? [...facultyScores].sort(
                          (a, b) => a.roundNumber - b.roundNumber
                        )
                      : facultyScores;
                  const emptySlots =
                    maxParticipantsPerFaculty - sortedScores.length;

                  return (
                    <Fragment key={faculty.id}>
                      {sortedScores.map((score, idx) => (
                        <td
                          key={score.id || idx}
                          className="border border-gray-600 px-3 py-2 text-center text-white"
                          style={{
                            backgroundColor: '#374151',
                          }}
                        >
                          {score.total.toFixed(2)}
                        </td>
                      ))}
                      {/* Add empty slots to maintain alignment */}
                      {Array.from({ length: emptySlots }).map((_, idx) => (
                        <td
                          key={`empty-${idx}`}
                          className="border border-gray-600 px-3 py-2 text-center text-gray-500"
                          style={{ backgroundColor: '#374151', opacity: 0.3 }}
                        >
                          -
                        </td>
                      ))}
                    </Fragment>
                  );
                })}
              </tr>

              {/* Skipping Average Row */}
              {event.name === 'Skipping' && (
                <tr className="bg-yellow-500 font-bold">
                  <td
                    className="border border-gray-600 px-4 py-2 text-black"
                    style={{
                      width: '250px',
                      minWidth: '250px',
                      maxWidth: '250px',
                    }}
                  >
                    AVERAGE (R1+R2)/2
                  </td>
                  {sortedFaculties.map((faculty) => {
                    const facultyScores =
                      scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
                    const r1 = facultyScores.find((s) => s.roundNumber === 1);
                    const r2 = facultyScores.find((s) => s.roundNumber === 2);
                    let avgDisplay = '—';
                    if (r1 && r2) {
                      avgDisplay = ((r1.total + r2.total) / 2).toFixed(2);
                    }
                    return (
                      <td
                        key={faculty.id}
                        colSpan={maxParticipantsPerFaculty}
                        className="border border-gray-600 px-3 py-2 text-center text-black"
                        style={{ backgroundColor: '#fbbf24' }}
                      >
                        {avgDisplay}
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Average Row (for 2-participant events) */}
              {event.participantsRequired === 2 && (
                <tr className="bg-yellow-500 font-bold">
                  <td
                    className="border border-gray-600 px-4 py-2 text-black"
                    style={{
                      width: '250px',
                      minWidth: '250px',
                      maxWidth: '250px',
                    }}
                  >
                    AVERAGE
                  </td>
                  {sortedFaculties.map((faculty) => {
                    const facultyScores =
                      scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];

                    // Calculate average
                    const totals = facultyScores.map((s) => s.total);
                    const sum = totals.reduce((a, b) => a + b, 0);
                    const avg = totals.length >= 2 ? sum / totals.length : sum;

                    // Span across all slots for this faculty (maxParticipantsPerFaculty)
                    return (
                      <td
                        key={faculty.id}
                        colSpan={maxParticipantsPerFaculty}
                        className="border border-gray-600 px-3 py-2 text-center text-black"
                        style={{
                          backgroundColor: '#fbbf24',
                        }}
                      >
                        {facultyScores.length > 0 ? avg.toFixed(1) : '0.0'}
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Grand Total Row - only show in last event table */}
              {isLastEvent && (
                <tr className="bg-blue-600">
                  <th
                    className="border border-gray-600 px-4 py-3 text-left text-white font-bold text-lg"
                    style={{
                      width: '250px',
                      minWidth: '250px',
                      maxWidth: '250px',
                    }}
                  >
                    FINAL TOTAL
                  </th>
                  {sortedFaculties.map((faculty) => {
                    const total = facultyTotals.get(faculty.id) || 0;

                    return (
                      <th
                        key={faculty.id}
                        colSpan={maxParticipantsPerFaculty}
                        className="border border-gray-600 px-3 py-3 text-center text-white font-bold text-xl"
                        style={{ backgroundColor: faculty.colorHex }}
                      >
                        {total.toFixed(1)}
                      </th>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}
