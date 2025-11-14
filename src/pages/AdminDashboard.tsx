import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  useRealtimeFaculties,
  useRealtimeParticipants,
  useRealtimeEvents,
  useRealtimeTemplates,
} from '@/hooks/useRealtimeData';
import {
  addFaculty,
  addParticipant,
  addEvent,
  addTemplate,
  updateDocument,
  deleteDocument,
} from '@/lib/firestoreHelpers';
import type { Faculty, Participant, Event, Template, CriteriaItem } from '@/types';

export function AdminDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { faculties } = useRealtimeFaculties();
  const { participants } = useRealtimeParticipants();
  const { events } = useRealtimeEvents();
  const { templates } = useRealtimeTemplates();
  
  const [activeTab, setActiveTab] = useState<'faculties' | 'participants' | 'events' | 'templates'>('faculties');

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
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {auth.name || 'Admin'}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-2 overflow-x-auto">
          {(['faculties', 'participants', 'events', 'templates'] as const).map((tab) => (
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
        {activeTab === 'faculties' && (
          <FacultiesPanel faculties={faculties} />
        )}
        {activeTab === 'participants' && (
          <ParticipantsPanel participants={participants} faculties={faculties} />
        )}
        {activeTab === 'events' && (
          <EventsPanel events={events} templates={templates} />
        )}
        {activeTab === 'templates' && (
          <TemplatesPanel templates={templates} />
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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState('');

  const handleAdd = async () => {
    if (!name || !facultyId) return;
    await addParticipant({
      name,
      facultyId,
      events: [],
    });
    setName('');
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
            placeholder="Participant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <button onClick={handleAdd} className="btn btn-success">
            Save Participant
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {participants.map((participant) => {
          const faculty = faculties.find((f) => f.id === participant.facultyId);
          return (
            <div
              key={participant.id}
              className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{participant.name}</div>
                {faculty && (
                  <div
                    className="text-sm"
                    style={{ color: faculty.colorHex }}
                  >
                    {faculty.name}
                  </div>
                )}
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
          <div
            key={event.id}
            className="p-4 bg-gray-50 rounded-lg"
          >
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
                <div key={crit.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span>{crit.label}</span>
                  <span className="text-sm text-gray-600">Max: {crit.maxPoints}</span>
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
              <button
                onClick={handleAddCriteria}
                className="btn btn-secondary"
              >
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
