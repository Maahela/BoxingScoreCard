import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  useRealtimeEvents,
  useRealtimeFaculties,
  useRealtimeParticipants,
} from '@/hooks/useRealtimeData';
import { useActiveParticipants } from '@/hooks/useActiveParticipants';
import {
  getDocument,
  addScore,
  checkExistingScore,
} from '@/lib/firestoreHelpers';
import type { Event, Participant, Template, ScoreInputState } from '@/types';
import { CriteriaList } from '@/components/CriteriaList';
import { CombatScoreCard } from '@/components/CombatScoreCard';

export function InvigilatorDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { events } = useRealtimeEvents();
  const { faculties } = useRealtimeFaculties();
  const { participants } = useRealtimeParticipants();
  const { activeParticipants } = useActiveParticipants();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [combatParticipant2, setCombatParticipant2] =
    useState<Participant | null>(null);
  const [scores, setScores] = useState<ScoreInputState[]>([]);
  const [scores2, setScores2] = useState<ScoreInputState[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyScored, setAlreadyScored] = useState(false);

  // Automatically load active participant when event is selected
  useEffect(() => {
    if (!selectedEvent || !activeParticipants) return;

    let activeParticipantId: string | null = null;
    let activeParticipant2Id: string | null = null;

    // Determine which active participant to use based on event
    if (selectedEvent.name === 'Skipping') {
      activeParticipantId = activeParticipants.skipping;
    } else if (selectedEvent.name === 'Shadow Boxing') {
      activeParticipantId = activeParticipants.shadowBoxing;
    } else if (selectedEvent.name === 'Punching Bag') {
      activeParticipantId = activeParticipants.punchingBag;
    } else if (selectedEvent.name === 'Boxing Combat') {
      activeParticipantId = activeParticipants.combat.participant1;
      activeParticipant2Id = activeParticipants.combat.participant2;
    }

    // Load participant 1
    if (activeParticipantId) {
      const participant = participants.find(
        (p) => p.id === activeParticipantId
      );
      if (participant) {
        setSelectedParticipant(participant);
        setSelectedFaculty(participant.facultyId);
      }
    } else {
      setSelectedParticipant(null);
    }

    // Load participant 2 for combat
    if (activeParticipant2Id) {
      const participant = participants.find(
        (p) => p.id === activeParticipant2Id
      );
      if (participant) {
        setCombatParticipant2(participant);
      }
    } else {
      setCombatParticipant2(null);
    }
  }, [selectedEvent, activeParticipants, participants]);

  // Check if current participants have already been scored
  useEffect(() => {
    const checkScores = async () => {
      if (!selectedEvent || !selectedParticipant || !auth.invigilatorId) {
        setAlreadyScored(false);
        return;
      }

      const participantIds = [selectedParticipant.id];
      if (combatParticipant2) {
        participantIds.push(combatParticipant2.id);
      }

      const hasScore = await checkExistingScore(
        selectedEvent.id,
        participantIds,
        auth.invigilatorId
      );
      setAlreadyScored(hasScore);
    };

    checkScores();
  }, [
    selectedEvent,
    selectedParticipant,
    combatParticipant2,
    auth.invigilatorId,
  ]);

  // Filter events assigned to this invigilator
  const assignedEvents = events.filter((e) =>
    auth.eventsAssigned?.includes(e.id)
  );

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setSelectedFaculty(null);
    setSelectedParticipant(null);
    setCombatParticipant2(null);
    setSubmitted(false);

    // Load template
    const tmpl = await getDocument<Template>('templates', event.templateId);
    setTemplate(tmpl);

    // Initialize scores
    if (tmpl) {
      const initialScores = tmpl.criteria.map((c) => ({
        criteriaId: c.id,
        score: 0,
        maxPoints: c.maxPoints,
      }));
      setScores(initialScores);
      setScores2(initialScores); // For second combat participant
    }
  };

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores((prev) =>
      prev.map((s) => (s.criteriaId === criteriaId ? { ...s, score } : s))
    );
  };

  const handleScore2Change = (criteriaId: string, score: number) => {
    setScores2((prev) =>
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
      // Submit score for participant 1
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

      // If combat event and second participant exists, submit their score too
      if (selectedEvent.name === 'Boxing Combat' && combatParticipant2) {
        const total2 = scores2.reduce((sum, s) => sum + s.score, 0);
        await addScore({
          eventId: selectedEvent.id,
          templateId: template.id,
          participantId: combatParticipant2.id,
          facultyId: combatParticipant2.facultyId,
          invigilatorId: auth.invigilatorId,
          roundNumber: 1,
          criteriaScores: scores2.map((s) => ({
            criteriaId: s.criteriaId,
            score: s.score,
          })),
          total: total2,
          timestamp: Date.now(),
        });
      }

      setSubmitted(true);

      // Return to event selection after notification
      setTimeout(() => {
        setSelectedEvent(null);
        setSelectedParticipant(null);
        setCombatParticipant2(null);
        setSubmitted(false);
        const initialScores = template.criteria.map((c) => ({
          criteriaId: c.id,
          score: 0,
          maxPoints: c.maxPoints,
        }));
        setScores(initialScores);
        setScores2(initialScores);
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

  // View: Waiting for admin to select active participant OR already scored
  if (!selectedParticipant || alreadyScored) {
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
            Phase {selectedEvent.phase}
          </div>
        </header>

        <div className="card">
          <div className="text-center py-12">
            {alreadyScored ? (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2">Already Scored</h2>
                <p className="text-gray-600 mb-6">
                  You have already submitted scores for{' '}
                  {selectedParticipant ? (
                    <span className="font-semibold">
                      {selectedParticipant.alias || selectedParticipant.name}
                      {combatParticipant2 && (
                        <>
                          {' '}
                          and{' '}
                          {combatParticipant2.alias || combatParticipant2.name}
                        </>
                      )}
                    </span>
                  ) : (
                    'these participants'
                  )}
                  . Waiting for admin to select the next participant
                  {selectedEvent.name === 'Boxing Combat' ? 's' : ''}.
                </p>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
                  <div className="text-sm font-medium text-green-900">
                    Your screen will update automatically when new participants
                    are selected.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-2">
                  Waiting for Admin Selection
                </h2>
                <p className="text-gray-600 mb-6">
                  The admin will select the active participant
                  {selectedEvent.name === 'Boxing Combat' ? 's' : ''} for this
                  event. Your screen will update automatically.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <div className="text-sm font-medium text-blue-900">
                    {selectedEvent.name === 'Boxing Combat'
                      ? 'Waiting for both combat participants...'
                      : 'Waiting for participant selection...'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Scoring
  const faculty = faculties.find((f) => f.id === selectedFaculty);
  const isCombat = selectedEvent.name === 'Boxing Combat';
  const combatFaculty2 = combatParticipant2
    ? faculties.find((f) => f.id === combatParticipant2.facultyId)
    : null;

  return (
    <div
      className={`min-h-screen p-4 pb-32 ${
        isCombat ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      {/* Combat Header */}
      {isCombat && (
        <header className="mb-6">
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedParticipant(null);
              setCombatParticipant2(null);
            }}
            className="text-white bg-black/30 px-4 py-2 rounded-lg border border-white/20 hover:bg-black/50 transition-all mb-2"
          >
            ← Back to Events
          </button>
          <h1 className="text-3xl md:text-4xl font-bold boxing-title text-white drop-shadow-lg">
            {selectedEvent.name}
          </h1>
        </header>
      )}

      {/* Non-Combat Header */}
      {!isCombat && (
        <header className="mb-6">
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedParticipant(null);
              setCombatParticipant2(null);
            }}
            className="text-blue-600 mb-2"
          >
            ← Back to Events
          </button>
          <h1 className="text-xl font-bold">{selectedEvent.name}</h1>
        </header>
      )}

      {/* Display active participants */}
      <div className={`mt-4 space-y-2 ${isCombat ? 'max-w-5xl mx-auto' : ''}`}>
        <div
          className={`p-3 ${
            isCombat ? 'bg-black/30 border-white/20' : 'bg-white'
          } border-2 border-blue-500 rounded-lg ${
            isCombat ? 'backdrop-blur-sm' : ''
          }`}
        >
          <div
            className={`text-xs mb-1 ${
              isCombat ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {isCombat ? 'Participant 1' : 'Active Participant'}
          </div>
          <div
            className={`font-semibold text-lg ${isCombat ? 'text-white' : ''}`}
          >
            {selectedParticipant.alias || selectedParticipant.name}
          </div>
          {faculty && (
            <div
              className={`text-sm font-medium ${
                isCombat ? 'text-gray-200' : ''
              }`}
              style={{ color: isCombat ? '#EDEDED' : faculty.colorHex }}
            >
              {faculty.name}
            </div>
          )}
        </div>

        {isCombat && combatParticipant2 && (
          <div className="p-3 bg-black/30 border-2 border-green-500 rounded-lg backdrop-blur-sm border-white/20">
            <div className="text-xs text-gray-300 mb-1">Participant 2</div>
            <div className="font-semibold text-lg text-white">
              {combatParticipant2.alias || combatParticipant2.name}
            </div>
            {combatFaculty2 && (
              <div
                className="text-sm font-medium text-gray-200"
                style={{ color: '#EDEDED' }}
              >
                {combatFaculty2.name}
              </div>
            )}
          </div>
        )}
      </div>

      {template && (
        <div className={isCombat ? 'max-w-5xl mx-auto' : ''}>
          {isCombat && combatParticipant2 ? (
            <CombatScoreCard
              criteria={template.criteria}
              participant1={selectedParticipant}
              participant2={combatParticipant2}
              faculty1={faculty}
              faculty2={combatFaculty2}
              scores1={scores}
              scores2={scores2}
              onScore1Change={handleScoreChange}
              onScore2Change={handleScore2Change}
              disabled={submitted}
            />
          ) : (
            <div className="card mb-4">
              <h3 className="text-lg font-bold mb-3 text-blue-600">
                Criteria Scores
              </h3>
              <CriteriaList
                criteria={template.criteria}
                scores={scores}
                onScoreChange={handleScoreChange}
                disabled={submitted}
              />
            </div>
          )}
        </div>
      )}

      {/* Fixed Submit Button */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg z-20 ${
          isCombat ? 'bg-black/70 backdrop-blur-lg border-white/20' : 'bg-white'
        }`}
      >
        {submitted ? (
          <div
            className={`btn w-full text-lg pointer-events-none ${
              isCombat ? 'bg-green-600 text-white' : 'btn-success'
            }`}
          >
            ✓ Submitted Successfully!
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className={`btn w-full text-lg font-bold ${
              isCombat
                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 py-4 text-xl'
                : 'btn-primary'
            }`}
          >
            Submit {isCombat && combatParticipant2 ? 'Both ' : ''}Scores
          </button>
        )}
      </div>
    </div>
  );
}
