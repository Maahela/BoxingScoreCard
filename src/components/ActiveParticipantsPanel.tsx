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
    }
  }, [activeParticipants]);

  const handleSave = async () => {
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

      <div className="space-y-6">
        {/* Phase 1 Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
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
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
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
