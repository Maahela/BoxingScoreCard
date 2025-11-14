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
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [scores, setScores] = useState<ScoreInputState[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Filter events assigned to this invigilator
  const assignedEvents = events.filter((e) =>
    auth.eventsAssigned?.includes(e.id)
  );

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setSelectedFaculty(null);
    setSelectedParticipant(null);
    setSubmitted(false);

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
    if (!selectedEvent || !selectedParticipant || !template || !auth.invigilatorId) {
      return;
    }

    const total = scores.reduce((sum, s) => sum + s.score, 0);

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
    });

    setSubmitted(true);

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
            <button onClick={handleLogout} className="btn btn-secondary text-sm">
              Logout
            </button>
          </div>
          <p className="text-gray-600">Welcome, {auth.name}</p>
        </header>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Event</h2>
          <div className="space-y-3">
            {assignedEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventSelect(event)}
                className="w-full p-4 bg-blue-50 border-2 border-blue-500 rounded-lg text-left hover:bg-blue-100 transition-colors"
              >
                <div className="font-semibold text-lg">{event.name}</div>
                <div className="text-sm text-gray-600">{event.shortName}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View: Participant Selection
  if (!selectedParticipant) {
    const eventParticipants = participants.filter((p) =>
      p.events.includes(selectedEvent.id)
    );

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
        </header>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Participant</h2>
          <div className="space-y-3">
            {eventParticipants.map((participant) => {
              const faculty = faculties.find((f) => f.id === participant.facultyId);
              return (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  faculty={faculty}
                  onClick={() => handleParticipantSelect(participant)}
                />
              );
            })}
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
          <div className="font-semibold text-lg">{selectedParticipant.name}</div>
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
