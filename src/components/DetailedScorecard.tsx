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
  // Group scores by event and faculty
  const scoresByEventFaculty = new Map<string, Map<string, Score[]>>();

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

  // Calculate faculty totals
  const facultyTotals = new Map<string, number>();
  faculties.forEach((faculty) => {
    let total = 0;
    events.forEach((event) => {
      const eventScores =
        scoresByEventFaculty.get(event.id)?.get(faculty.id) || [];
      if (eventScores.length > 0) {
        const sum = eventScores.reduce((acc, s) => acc + s.total, 0);
        // Average for 2-participant events, direct score for 1-participant events
        const eventScore =
          event.participantsRequired === 2 ? sum / eventScores.length : sum;
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
    ...events.map((event) =>
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
    <div className="overflow-x-auto space-y-6">
      {/* Individual Event Tables */}
      {events.map((event, eventIndex) => {
        const isLastEvent = eventIndex === events.length - 1;

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
                  const emptySlots =
                    maxParticipantsPerFaculty - facultyScores.length;

                  return (
                    <Fragment key={faculty.id}>
                      {facultyScores.length > 0 ? (
                        <>
                          {facultyScores.map((score, idx) => {
                            const participant = participants.find(
                              (p) => p.id === score.participantId
                            );
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
                          const emptySlots =
                            maxParticipantsPerFaculty - facultyScores.length;

                          return (
                            <Fragment key={faculty.id}>
                              {facultyScores.map((score, idx) => {
                                const criteriaScore = score.criteriaScores.find(
                                  (c) => c.criteriaId === criteria.criteriaId
                                );
                                return (
                                  <td
                                    key={score.id || idx}
                                    className="border border-gray-600 px-3 py-2 text-center font-semibold"
                                    style={{ backgroundColor: '#1f2937' }}
                                  >
                                    {criteriaScore?.score || 0}
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
                  const emptySlots =
                    maxParticipantsPerFaculty - facultyScores.length;

                  return (
                    <Fragment key={faculty.id}>
                      {facultyScores.map((score, idx) => (
                        <td
                          key={score.id || idx}
                          className="border border-gray-600 px-3 py-2 text-center text-white"
                          style={{
                            backgroundColor: '#374151',
                          }}
                        >
                          {score.total}
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

              {/* Spacing row */}
              <tr className="bg-gray-900">
                <td colSpan={totalColumns} className="h-4"></td>
              </tr>

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
