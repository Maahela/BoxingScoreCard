import { useState, useEffect } from 'react';
import type { Participant, Event } from '@/types';
import { setActiveParticipants } from '@/lib/firestoreHelpers';
import { useActiveParticipants } from '@/hooks/useActiveParticipants';

interface ActiveParticipantsPanelProps {
  participants: Participant[];
  events: Event[];
}

export function ActiveParticipantsPanel({
  participants,
  events,
}: ActiveParticipantsPanelProps) {
  const { activeParticipants } = useActiveParticipants();

  const [skipping, setSkipping] = useState<string>('');
  const [shadowBoxing, setShadowBoxing] = useState<string>('');
  const [punchingBag, setPunchingBag] = useState<string>('');
  const [combatParticipant1, setCombatParticipant1] = useState<string>('');
  const [combatParticipant2, setCombatParticipant2] = useState<string>('');
  const [activeSkippingRound, setActiveSkippingRound] = useState<1 | 2>(1);
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  // Find event IDs
  const skippingEvent = events.find((e) => e.name === 'Skipping');
  const shadowBoxingEvent = events.find((e) => e.name === 'Shadow Boxing');
  const punchingBagEvent = events.find((e) => e.name === 'Punching Bag');
  const combatEvent = events.find((e) => e.name === 'Boxing Combat');

  // Filter participants by event
  const skippingParticipants = participants.filter((p) =>
    p.events.includes(skippingEvent?.id || '')
  );
  const shadowBoxingParticipants = participants.filter((p) =>
    p.events.includes(shadowBoxingEvent?.id || '')
  );
  const punchingBagParticipants = participants.filter((p) =>
    p.events.includes(punchingBagEvent?.id || '')
  );
  const combatParticipants = participants.filter((p) =>
    p.events.includes(combatEvent?.id || '')
  );

  // Load active participants from backend
  useEffect(() => {
    if (activeParticipants) {
      setSkipping(activeParticipants.skipping || '');
      setShadowBoxing(activeParticipants.shadowBoxing || '');
      setPunchingBag(activeParticipants.punchingBag || '');
      setCombatParticipant1(activeParticipants.combat.participant1 || '');
      setCombatParticipant2(activeParticipants.combat.participant2 || '');
      setActiveSkippingRound(activeParticipants.activeSkippingRound || 1);
      setActivePhase(activeParticipants.activePhase || 1);
    }
  }, [activeParticipants]);

  const handleSave = async () => {
    // Validate combat participants - both must be selected or both must be empty
    const hasCombatP1 = combatParticipant1 && combatParticipant1.trim() !== '';
    const hasCombatP2 = combatParticipant2 && combatParticipant2.trim() !== '';

    if (hasCombatP1 !== hasCombatP2) {
      alert(
        'Combat Error: You must select BOTH participants for Boxing Combat, or leave both empty. ' +
          'Combat requires two participants to score simultaneously.'
      );
      return;
    }

    // Warn if Phase 2 (Combat) is activated with participants selected
    if (activePhase === 2 && (hasCombatP1 || hasCombatP2)) {
      const confirmed = window.confirm(
        'You are activating Phase 2 (Boxing Combat). This will make Combat events accessible to invigilators. Continue?'
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      await setActiveParticipants({
        skipping: skipping || null,
        shadowBoxing: shadowBoxing || null,
        punchingBag: punchingBag || null,
        combat: {
          participant1: combatParticipant1 || null,
          participant2: combatParticipant2 || null,
        },
        activeSkippingRound: activeSkippingRound,
        activePhase: activePhase,
      });
      alert('Active participants updated successfully!');
    } catch (error) {
      console.error('Error updating active participants:', error);
      alert('Failed to update active participants');
    } finally {
      setSaving(false);
    }
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return 'None';
    return `${participant.alias || participant.name} (${
      participant.facultyId
    })`;
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Active Participant Selection</h2>
      <p className="text-gray-600 mb-6">
        Select which participants are currently performing. Invigilators will
        automatically see these selections.
      </p>

      {/* Phase Selector */}
      <div className="mb-6 p-6 bg-purple-50 border-2 border-purple-500 rounded-lg">
        <label className="block text-sm font-bold text-gray-900 mb-3">
          🎯 Active Tournament Phase
        </label>
        <div className="inline-flex rounded-lg bg-white border-2 border-gray-300 p-1">
          <button
            type="button"
            onClick={() => setActivePhase(1)}
            className={`px-8 py-4 rounded-md font-bold transition-colors ${
              activePhase === 1
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Phase 1<br />
            <span className="text-xs font-normal">Shadow/Bag/Skip</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePhase(2)}
            className={`px-8 py-4 rounded-md font-bold transition-colors ${
              activePhase === 2
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Phase 2<br />
            <span className="text-xs font-normal">Combat</span>
          </button>
        </div>
        <div className="mt-3 text-sm font-medium">
          {activePhase === 1 ? (
            <div className="text-blue-800">
              ✓ Phase 1 Active: Invigilators can access Shadow Boxing, Punching
              Bag, and Skipping
            </div>
          ) : (
            <div className="text-red-800">
              ✓ Phase 2 Active: Invigilators can ONLY access Boxing Combat
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Phase 1 Section */}
        <div
          className={`bg-blue-50 border-2 rounded-lg p-6 ${
            activePhase === 1 ? 'border-blue-500' : 'border-gray-300 opacity-60'
          }`}
        >
          <h3 className="text-xl font-bold mb-4 text-blue-900">
            Phase 1 Events
          </h3>

          {/* Skipping */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skipping (1 participant per faculty)
            </label>
            <select
              value={skipping}
              onChange={(e) => setSkipping(e.target.value)}
              className="input"
            >
              <option value="">-- Select Participant --</option>
              {skippingParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias || p.name} - {p.facultyId}
                </option>
              ))}
            </select>
            {skipping && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Currently active: {getParticipantName(skipping)}
              </div>
            )}
          </div>

          {/* Active Skipping Round Selector */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Active Skipping Round (Invigilators will ONLY see this round)
            </label>
            <div className="inline-flex rounded-lg bg-white border-2 border-gray-300 p-1">
              <button
                type="button"
                onClick={() => setActiveSkippingRound(1)}
                className={`px-6 py-3 rounded-md font-bold transition-colors ${
                  activeSkippingRound === 1
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Round 1
              </button>
              <button
                type="button"
                onClick={() => setActiveSkippingRound(2)}
                className={`px-6 py-3 rounded-md font-bold transition-colors ${
                  activeSkippingRound === 2
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Round 2
              </button>
            </div>
            <div className="mt-3 text-sm text-yellow-800 font-medium">
              ⚠️ Current active round:{' '}
              <span className="font-bold">Round {activeSkippingRound}</span>
              <br />
              Invigilators will only see scoring for this round.
            </div>
          </div>

          {/* Shadow Boxing */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shadow Boxing (Select 1 of 2 participants)
            </label>
            <select
              value={shadowBoxing}
              onChange={(e) => setShadowBoxing(e.target.value)}
              className="input"
            >
              <option value="">-- Select Participant --</option>
              {shadowBoxingParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias || p.name} - {p.facultyId}
                </option>
              ))}
            </select>
            {shadowBoxing && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Currently active: {getParticipantName(shadowBoxing)}
              </div>
            )}
          </div>

          {/* Punching Bag */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punching Bag (Select 1 of 2 participants)
            </label>
            <select
              value={punchingBag}
              onChange={(e) => setPunchingBag(e.target.value)}
              className="input"
            >
              <option value="">-- Select Participant --</option>
              {punchingBagParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias || p.name} - {p.facultyId}
                </option>
              ))}
            </select>
            {punchingBag && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Currently active: {getParticipantName(punchingBag)}
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 Section */}
        <div
          className={`bg-green-50 border-2 rounded-lg p-6 ${
            activePhase === 2 ? 'border-red-500' : 'border-gray-300 opacity-60'
          }`}
        >
          <h3 className="text-xl font-bold mb-4 text-green-900">
            Phase 2 Event
          </h3>

          {/* Boxing Combat */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boxing Combat - Participant 1
            </label>
            <select
              value={combatParticipant1}
              onChange={(e) => setCombatParticipant1(e.target.value)}
              className="input"
            >
              <option value="">-- Select Participant 1 --</option>
              {combatParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias || p.name} - {p.facultyId}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boxing Combat - Participant 2
            </label>
            <select
              value={combatParticipant2}
              onChange={(e) => setCombatParticipant2(e.target.value)}
              className="input"
            >
              <option value="">-- Select Participant 2 --</option>
              {combatParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias || p.name} - {p.facultyId}
                </option>
              ))}
            </select>
          </div>

          {(combatParticipant1 || combatParticipant2) && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Currently active combat:
              <div className="ml-4">
                {combatParticipant1
                  ? `P1: ${getParticipantName(combatParticipant1)}`
                  : 'P1: None'}
              </div>
              <div className="ml-4">
                {combatParticipant2
                  ? `P2: ${getParticipantName(combatParticipant2)}`
                  : 'P2: None'}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            {saving ? 'Saving...' : 'Update Active Participants'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Changes are broadcast instantly to all
          invigilators. They will see the updated participant names without
          needing to refresh.
        </p>
      </div>
    </div>
  );
}
