import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRealtimeFacultyTotals,
  useRealtimeParticipants,
} from '@/hooks/useRealtimeData';
import { DetailedScorecard } from '@/components/DetailedScorecard';
import { useAuth } from '@/contexts/AuthContext';

export function DisplayScreen() {
  const { totals, faculties, scores, events } = useRealtimeFacultyTotals();
  const { participants } = useRealtimeParticipants();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  const handleBackToLogin = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <header className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1"></div>
          <div className="flex-1 text-center">
            <h1 className="text-6xl font-bold mb-4">
              Interfaculty Freshers' Boxing Tournament 2025
            </h1>
            <p className="text-2xl text-gray-300">Live Scoreboard</p>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleBackToLogin}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-gray-800 p-1">
          <button
            onClick={() => setView('summary')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              view === 'summary'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Summary Totals
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              view === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Detailed Breakdown
          </button>
        </div>
      </div>

      {/* Summary View */}
      {view === 'summary' && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Faculty Rankings
            </h2>
            <div className="space-y-4">
              {[...totals]
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((total, index) => {
                  const faculty = faculties.find(
                    (f) => f.id === total.facultyId
                  );
                  if (!faculty) return null;

                  return (
                    <div
                      key={total.facultyId}
                      className="bg-gray-700 rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-4xl font-bold text-gray-400 w-16">
                            #{index + 1}
                          </div>
                          <div
                            className="w-8 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: faculty.colorHex }}
                          />
                          <div className="text-3xl font-bold">
                            {faculty.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Phase 1</div>
                            <div className="text-2xl font-semibold text-blue-300">
                              {total.phase1Total.toFixed(1)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Phase 2</div>
                            <div className="text-2xl font-semibold text-green-300">
                              {total.phase2Total.toFixed(1)}
                            </div>
                          </div>
                          <div className="text-right border-l border-gray-600 pl-8">
                            <div className="text-sm text-gray-400">Total</div>
                            <div className="text-5xl font-bold text-yellow-400">
                              {total.totalScore.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {view === 'detailed' && (
        <div className="max-w-full mx-auto px-4">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Detailed Event Scorecard
            </h2>
            <DetailedScorecard
              faculties={faculties}
              events={events}
              scores={scores}
              participants={participants}
            />
          </div>

          {/* Recent Scores */}
          <div className="mt-8 bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Recent Scores</h3>
            <div className="space-y-2">
              {scores
                .slice()
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10)
                .map((score) => {
                  const faculty = faculties.find(
                    (f) => f.id === score.facultyId
                  );
                  const event = events.find((e) => e.id === score.eventId);
                  const participant = participants.find(
                    (p) => p.id === score.participantId
                  );
                  return (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {faculty && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: faculty.colorHex }}
                          />
                        )}
                        <span className="font-semibold">
                          {faculty?.name} - {event?.shortName}
                        </span>
                        {participant && (
                          <span className="text-sm text-gray-400">
                            ({participant.alias || participant.name})
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {score.total.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 rounded-full text-sm font-medium">
        ● Live
      </div>
    </div>
  );
}
