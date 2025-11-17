import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  useRealtimeEvents,
  useRealtimeFaculties,
  useRealtimeParticipants,
  useRealtimeTemplates,
} from '@/hooks/useRealtimeData';
import { getDocument, addScore } from '@/lib/firestoreHelpers';
import type { Event, Participant, Template, ScoreInputState } from '@/types';
import { CriteriaList } from '@/components/CriteriaList';
import { ParticipantCard } from '@/components/ParticipantCard';

export function InvigilatorDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { events } = useRealtimeEvents();
  const { faculties } = useRealtimeFaculties();
  const { participants } = useRealtimeParticipants();
  const { templates } = useRealtimeTemplates();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [scores, setScores] = useState<ScoreInputState[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scoredParticipants, setScoredParticipants] = useState<Set<string>>(
    new Set()
  );

  // Filter events assigned to this invigilator
  const assignedEvents = events.filter((e) =>
    auth.eventsAssigned?.includes(e.id)
  );

  // Debug logging
  console.log('Auth object:', auth);
  console.log('All events:', events);
  console.log('Assigned events:', assignedEvents);

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setSelectedFaculty(null);
    setSelectedParticipant(null);
    setSubmitted(false);
    setScoredParticipants(new Set());

    // Load template
    const tmpl = await getDocument<Template>('templates', event.templateId);
    setTemplate(tmpl);

    // Initialize scores
    if (tmpl) {
      setScores(
        tmpl.criteria.map((c) => ({
          criteriaId: c.id,
          score: 0,
          maxPoints: c.maxPoints,
        }))
      );
    }
  };

  const handleParticipantSelect = (participant: Participant) => {
    setSelectedParticipant(participant);
    setSelectedFaculty(participant.facultyId);
    setSubmitted(false);
  };

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores((prev) =>
      prev.map((s) => (s.criteriaId === criteriaId ? { ...s, score } : s))
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedEvent ||
      !selectedParticipant ||
      !template ||
      !auth.invigilatorId
    ) {
      return;
    }

    const total = scores.reduce((sum, s) => sum + s.score, 0);

    try {
      await addScore({
        eventId: selectedEvent.id,
        templateId: template.id,
        participantId: selectedParticipant.id,
        facultyId: selectedParticipant.facultyId,
        invigilatorId: auth.invigilatorId,
        roundNumber: 1,
        criteriaScores: scores.map((s) => ({
          criteriaId: s.criteriaId,
          score: s.score,
        })),
        total,
        timestamp: Date.now(),
      });

      setSubmitted(true);

      // Track scored participant
      setScoredParticipants((prev) =>
        new Set(prev).add(selectedParticipant.id)
      );

      // Reset scores for next participant
      setTimeout(() => {
        setSelectedParticipant(null);
        setScores(
          template.criteria.map((c) => ({
            criteriaId: c.id,
            score: 0,
            maxPoints: c.maxPoints,
          }))
        );
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // View: Event Selection
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Invigilator Dashboard</h1>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">Welcome, {auth.name}</p>
        </header>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Event</h2>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <div className="font-semibold mb-1">Tournament Structure:</div>
            <div>
              • Phase 1: Shadow Boxing, Punching Bag, Skipping (simultaneous)
            </div>
            <div>• Phase 2: Boxing Combat (sequential)</div>
          </div>
          <div className="space-y-3">
            {assignedEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventSelect(event)}
                className="w-full p-4 bg-blue-50 border-2 border-blue-500 rounded-lg text-left hover:bg-blue-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{event.name}</div>
                    <div className="text-sm text-gray-600">
                      {event.shortName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-blue-600">
                      Phase {event.phase}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.participantsRequired} participant
                      {event.participantsRequired > 1 ? 's' : ''} per faculty
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View: Participant Selection (skip for 1-participant events)
  if (!selectedParticipant) {
    const eventParticipants = participants.filter((p) =>
      p.events.includes(selectedEvent.id)
    );

    // Debug logging
    console.log('Selected Event:', selectedEvent);
    console.log('All Participants:', participants);
    console.log('Filtered Event Participants:', eventParticipants);
    console.log(
      'Participants with events field:',
      participants.map((p) => ({ name: p.name, events: p.events }))
    );

    // For 1-participant events (like Skipping), auto-select and go to scoring
    if (selectedEvent.participantsRequired === 1) {
      // Group by faculty and show one participant per faculty
      const participantsByFaculty = new Map<string, Participant>();
      eventParticipants.forEach((p) => {
        // Take the first participant per faculty (admin should assign only one)
        if (!participantsByFaculty.has(p.facultyId)) {
          participantsByFaculty.set(p.facultyId, p);
        }
      });

      return (
        <div className="min-h-screen bg-gray-100 p-4">
          <header className="mb-6">
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-blue-600 mb-2"
            >
              ← Back to Events
            </button>
            <h1 className="text-2xl font-bold">{selectedEvent.name}</h1>
            <div className="mt-2 text-sm text-gray-600">
              Phase {selectedEvent.phase} • 1 participant per faculty
              (pre-assigned)
            </div>
          </header>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Faculty to Score</h2>
              <div className="text-sm text-gray-600">
                Scored: {scoredParticipants.size} / {participantsByFaculty.size}
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="font-semibold text-blue-800 mb-1">
                ℹ️ Single Participant Event:
              </div>
              <div className="text-blue-700">
                One participant per faculty has been pre-assigned by the admin
                for this event.
              </div>
            </div>

            <div className="space-y-3">
              {Array.from(participantsByFaculty.entries()).map(
                ([facultyId, participant]) => {
                  const faculty = faculties.find((f) => f.id === facultyId);
                  const isScored = scoredParticipants.has(participant.id);

                  return (
                    <div key={facultyId} className="relative">
                      {isScored && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                          ✓ Scored
                        </div>
                      )}
                      <button
                        onClick={() => handleParticipantSelect(participant)}
                        className="w-full"
                      >
                        <ParticipantCard
                          participant={participant}
                          faculty={faculty}
                          onClick={() => {}}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      );
    }

    // For 2-participant events, show full selection with grouping
    const participantsByFaculty = new Map<string, Participant[]>();
    eventParticipants.forEach((p) => {
      if (!participantsByFaculty.has(p.facultyId)) {
        participantsByFaculty.set(p.facultyId, []);
      }
      participantsByFaculty.get(p.facultyId)!.push(p);
    });

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-6">
          <button
            onClick={() => setSelectedEvent(null)}
            className="text-blue-600 mb-2"
          >
            ← Back to Events
          </button>
          <h1 className="text-2xl font-bold">{selectedEvent.name}</h1>
          <div className="mt-2 text-sm text-gray-600">
            Phase {selectedEvent.phase} • {selectedEvent.participantsRequired}{' '}
            participant{selectedEvent.participantsRequired > 1 ? 's' : ''} per
            faculty
          </div>
        </header>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Select Participant to Score
            </h2>
            <div className="text-sm text-gray-600">
              Scored: {scoredParticipants.size} / {eventParticipants.length}
            </div>
          </div>

          {selectedEvent.participantsRequired === 2 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <div className="font-semibold text-amber-800 mb-1">
                ⚠️ Scoring Requirement:
              </div>
              <div className="text-amber-700">
                This event requires 2 participants per faculty. Final score =
                average of both participants.
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Array.from(participantsByFaculty.entries()).map(
              ([facultyId, facultyParticipants]) => {
                const faculty = faculties.find((f) => f.id === facultyId);
                const scoredCount = facultyParticipants.filter((p) =>
                  scoredParticipants.has(p.id)
                ).length;
                const isComplete =
                  scoredCount >= selectedEvent.participantsRequired;

                return (
                  <div key={facultyId} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <div
                        className="font-semibold"
                        style={{ color: faculty?.colorHex }}
                      >
                        {faculty?.name}
                      </div>
                      <div className="text-sm">
                        {isComplete ? (
                          <span className="text-green-600 font-semibold">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            {scoredCount}/{selectedEvent.participantsRequired}{' '}
                            scored
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {facultyParticipants.map((participant) => {
                        const isScored = scoredParticipants.has(participant.id);
                        return (
                          <div key={participant.id} className="relative">
                            {isScored && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                                ✓ Scored
                              </div>
                            )}
                            <ParticipantCard
                              participant={participant}
                              faculty={faculty}
                              onClick={() =>
                                handleParticipantSelect(participant)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Scoring
  const faculty = faculties.find((f) => f.id === selectedFaculty);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-24">
      <header className="mb-6">
        <button
          onClick={() => setSelectedParticipant(null)}
          className="text-blue-600 mb-2"
        >
          ← Back to Participants
        </button>
        <h1 className="text-xl font-bold">{selectedEvent.name}</h1>
        <div className="mt-2">
          <div className="font-semibold text-lg">
            {selectedParticipant.name}
          </div>
          {faculty && (
            <div className="text-sm" style={{ color: faculty.colorHex }}>
              {faculty.name}
            </div>
          )}
        </div>
      </header>

      {template && (
        <div className="card">
          <CriteriaList
            criteria={template.criteria}
            scores={scores}
            onScoreChange={handleScoreChange}
            disabled={submitted}
          />
        </div>
      )}

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        {submitted ? (
          <div className="btn btn-success w-full text-lg pointer-events-none">
            ✓ Submitted Successfully!
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-full text-lg"
          >
            Submit Scores
          </button>
        )}
      </div>
    </div>
  );
}
