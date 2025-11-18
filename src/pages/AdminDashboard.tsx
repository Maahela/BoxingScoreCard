import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  useRealtimeFaculties,
  useRealtimeParticipants,
  useRealtimeEvents,
  useRealtimeTemplates,
  useRealtimeScores,
} from '@/hooks/useRealtimeData';
import {
  addFaculty,
  addParticipant,
  addEvent,
  addTemplate,
  updateDocument,
  deleteDocument,
} from '@/lib/firestoreHelpers';
import { ActiveParticipantsPanel } from '@/components/ActiveParticipantsPanel';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { BackupRestorePanel } from '@/components/BackupRestorePanel';
import type {
  Faculty,
  Participant,
  Event,
  Template,
  CriteriaItem,
  Score,
} from '@/types';

export function AdminDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { faculties } = useRealtimeFaculties();
  const { participants } = useRealtimeParticipants();
  const { events } = useRealtimeEvents();
  const { templates } = useRealtimeTemplates();
  const { scores } = useRealtimeScores();

  const [activeTab, setActiveTab] = useState<
    | 'active'
    | 'faculties'
    | 'participants'
    | 'events'
    | 'templates'
    | 'scores'
    | 'audit'
    | 'backup'
  >('active');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Welcome, {auth.name || 'Admin'}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-2 overflow-x-auto">
          {(
            [
              'active',
              'faculties',
              'participants',
              'events',
              'templates',
              'scores',
              'audit',
              'backup',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'active' && (
          <ActiveParticipantsPanel
            participants={participants}
            events={events}
          />
        )}
        {activeTab === 'faculties' && <FacultiesPanel faculties={faculties} />}
        {activeTab === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            faculties={faculties}
          />
        )}
        {activeTab === 'events' && (
          <EventsPanel events={events} templates={templates} />
        )}
        {activeTab === 'templates' && <TemplatesPanel templates={templates} />}
        {activeTab === 'scores' && (
          <ScoresPanel
            scores={scores}
            participants={participants}
            faculties={faculties}
            events={events}
          />
        )}
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'backup' && (
          <BackupRestorePanel exportedBy={auth.adminId || 'admin'} />
        )}
      </div>
    </div>
  );
}

// Faculties Panel
function FacultiesPanel({ faculties }: { faculties: Faculty[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#3B82F6');

  const handleAdd = async () => {
    if (!name) return;
    await addFaculty({
      name,
      colorHex,
      order: faculties.length,
    });
    setName('');
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Faculties</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Faculty'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Faculty Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-3"
          />
          <div className="flex gap-3 items-center mb-3">
            <label className="font-medium">Color:</label>
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-10 w-20 border rounded"
            />
          </div>
          <button onClick={handleAdd} className="btn btn-success">
            Save Faculty
          </button>
        </div>
      )}

      <div className="space-y-3">
        {faculties.map((faculty) => (
          <div
            key={faculty.id}
            className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: faculty.colorHex }}
              />
              <span className="font-semibold">{faculty.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Participants Panel
function ParticipantsPanel({
  participants,
  faculties,
}: {
  participants: Participant[];
  faculties: Faculty[];
}) {
  const { events } = useRealtimeEvents();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleAdd = async () => {
    if (!name || !facultyId || selectedEvents.length === 0) {
      alert('Please fill in name, faculty, and select at least one event');
      return;
    }
    await addParticipant({
      name,
      alias: alias || undefined,
      facultyId,
      events: selectedEvents,
    });
    setName('');
    setAlias('');
    setSelectedEvents([]);
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Participants</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Participant'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-3"
          />
          <input
            type="text"
            placeholder="Alias/Nickname (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="input mb-3"
          />
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="input mb-3"
          >
            <option value="">Select Faculty</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <div className="mb-3">
            <label className="font-semibold mb-2 block">
              Assign to Events:
            </label>
            <div className="space-y-2">
              {events.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="w-4 h-4"
                  />
                  <span>{event.name}</span>
                  <span className="text-xs text-gray-500">
                    (Phase {event.phase}, {event.participantsRequired} per
                    faculty)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleAdd} className="btn btn-success">
            Save Participant
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {participants.map((participant) => {
          const faculty = faculties.find((f) => f.id === participant.facultyId);
          const participantEvents = events.filter((e) =>
            participant.events.includes(e.id)
          );
          return (
            <div key={participant.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{participant.name}</div>
                  {participant.alias && (
                    <div className="text-sm text-gray-500 italic">
                      "{participant.alias}"
                    </div>
                  )}
                  {faculty && (
                    <div
                      className="text-sm mt-1"
                      style={{ color: faculty.colorHex }}
                    >
                      {faculty.name}
                    </div>
                  )}
                  {participantEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {participantEvents.map((event) => (
                        <span
                          key={event.id}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {event.shortName}
                        </span>
                      ))}
                    </div>
                  )}
                  {participantEvents.length === 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      ⚠️ Not assigned to any events
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Events Panel
function EventsPanel({
  events,
  templates,
}: {
  events: Event[];
  templates: Template[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [templateId, setTemplateId] = useState('');

  const handleAdd = async () => {
    if (!name || !shortName || !templateId) return;
    await addEvent({
      name,
      shortName,
      templateId,
      order: events.length,
      isCombat: false,
      phase: 1,
      participantsRequired: 2,
    });
    setName('');
    setShortName('');
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Events</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-3"
          />
          <input
            type="text"
            placeholder="Short Name"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className="input mb-3"
          />
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="input mb-3"
          >
            <option value="">Select Template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button onClick={handleAdd} className="btn btn-success">
            Save Event
          </button>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold">{event.name}</div>
            <div className="text-sm text-gray-600">{event.shortName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Templates Panel
function TemplatesPanel({ templates }: { templates: Template[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState<CriteriaItem[]>([]);
  const [newCritLabel, setNewCritLabel] = useState('');
  const [newCritMax, setNewCritMax] = useState('10');

  const handleAddCriteria = () => {
    if (!newCritLabel) return;
    setCriteria([
      ...criteria,
      {
        id: Date.now().toString(),
        label: newCritLabel,
        maxPoints: Number(newCritMax) || 10,
      },
    ]);
    setNewCritLabel('');
    setNewCritMax('10');
  };

  const handleSave = async () => {
    if (!name || criteria.length === 0) return;
    await addTemplate({
      name,
      criteria,
      layout: 'detailed',
    });
    setName('');
    setCriteria([]);
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Scoring Templates</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Template'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-3"
          />

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Criteria</h3>
            <div className="space-y-2 mb-3">
              {criteria.map((crit) => (
                <div
                  key={crit.id}
                  className="flex justify-between items-center p-2 bg-white rounded"
                >
                  <span>{crit.label}</span>
                  <span className="text-sm text-gray-600">
                    Max: {crit.maxPoints}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Criteria Label"
                value={newCritLabel}
                onChange={(e) => setNewCritLabel(e.target.value)}
                className="input flex-1"
              />
              <input
                type="number"
                placeholder="Max"
                value={newCritMax}
                onChange={(e) => setNewCritMax(e.target.value)}
                className="input w-20"
              />
              <button onClick={handleAddCriteria} className="btn btn-secondary">
                Add
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-success">
            Save Template
          </button>
        </div>
      )}

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold mb-2">{template.name}</div>
            <div className="text-sm text-gray-600">
              {template.criteria.length} criteria
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Scores Panel with Delete Functionality
function ScoresPanel({
  scores,
  participants,
  faculties,
  events,
}: {
  scores: Score[];
  participants: Participant[];
  faculties: Faculty[];
  events: Event[];
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    scoreId: string;
    step: 1 | 2 | null;
  }>({ scoreId: '', step: null });
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [filterFaculty, setFilterFaculty] = useState<string>('all');

  const handleDeleteClick = (scoreId: string) => {
    setDeleteConfirm({ scoreId, step: 1 });
  };

  const handleConfirmStep1 = () => {
    setDeleteConfirm((prev) => ({ ...prev, step: 2 }));
  };

  const handleConfirmStep2 = async () => {
    if (deleteConfirm.scoreId) {
      await deleteDocument('scores', deleteConfirm.scoreId);
      setDeleteConfirm({ scoreId: '', step: null });
    }
  };

  const handleCancel = () => {
    setDeleteConfirm({ scoreId: '', step: null });
  };

  // Filter scores
  const filteredScores = scores.filter((score) => {
    if (filterEvent !== 'all' && score.eventId !== filterEvent) return false;
    if (filterFaculty !== 'all' && score.facultyId !== filterFaculty)
      return false;
    return true;
  });

  // Sort by timestamp (newest first)
  const sortedScores = [...filteredScores].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Manage Scores</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Event
            </label>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="input"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Faculty
            </label>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="input"
            >
              <option value="all">All Faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {sortedScores.length} of {scores.length} scores
        </div>
      </div>

      {/* Scores List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedScores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No scores found matching the filters
          </div>
        ) : (
          sortedScores.map((score) => {
            const participant = participants.find(
              (p) => p.id === score.participantId
            );
            const faculty = faculties.find((f) => f.id === score.facultyId);
            const event = events.find((e) => e.id === score.eventId);
            const isDeleting = deleteConfirm.scoreId === score.id;

            return (
              <div
                key={score.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isDeleting
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">
                        {participant?.name || 'Unknown Participant'}
                      </span>
                      {participant?.alias && (
                        <span className="text-sm text-gray-500 italic">
                          "{participant.alias}"
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      {faculty && (
                        <span
                          className="font-medium"
                          style={{ color: faculty.colorHex }}
                        >
                          {faculty.name}
                        </span>
                      )}
                      {event && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {event.name}
                        </span>
                      )}
                      <span>Round {score.roundNumber}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {score.total} points
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(score.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button & Confirmation */}
                  <div className="ml-4">
                    {!isDeleting && (
                      <button
                        onClick={() => handleDeleteClick(score.id!)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}

                    {isDeleting && deleteConfirm.step === 1 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-red-700 mb-1">
                          Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmStep1}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {isDeleting && deleteConfirm.step === 2 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-bold text-red-800 mb-1">
                          Final confirmation!
                        </p>
                        <p className="text-xs text-red-600 mb-1">
                          This cannot be undone
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmStep2}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-sm font-bold"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
