import React, { useState } from 'react';
import { useRealtimeFacultyTotals, useRealtimeEvents } from '@/hooks/useRealtimeData';
import { TotalsTable } from '@/components/TotalsTable';

export function DisplayScreen() {
  const { totals, faculties, scores } = useRealtimeFacultyTotals();
  const { events } = useRealtimeEvents();
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          Interfaculty Boxing Freshers 2024
        </h1>
        <p className="text-2xl text-gray-300">Live Scoreboard</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Faculty Rankings
            </h2>
            <div className="space-y-4">
              {[...totals]
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((total, index) => {
                  const faculty = faculties.find((f) => f.id === total.facultyId);
                  if (!faculty) return null;

                  return (
                    <div
                      key={total.facultyId}
                      className="flex items-center justify-between p-6 bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-gray-400 w-16">
                          #{index + 1}
                        </div>
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: faculty.colorHex }}
                        />
                        <div className="text-3xl font-bold">{faculty.name}</div>
                      </div>
                      <div className="text-5xl font-bold text-blue-400">
                        {total.totalScore.toFixed(2)}
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
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Event Breakdown
            </h2>
            <TotalsTable
              faculties={faculties}
              totals={totals}
              events={events}
              showEventBreakdown={true}
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
                  const faculty = faculties.find((f) => f.id === score.facultyId);
                  const event = events.find((e) => e.id === score.eventId);
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
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {score.total.toFixed(2)}
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
