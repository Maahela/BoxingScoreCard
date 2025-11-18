import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/firestoreHelpers';
import type { AuditLog } from '@/types';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'create' | 'update' | 'delete' | 'restore'
  >('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const loadLogsEffect = async () => {
      setLoading(true);
      try {
        const filters: {
          action?: AuditLog['action'];
          startDate?: number;
          endDate?: number;
        } = {};

        if (filter !== 'all') {
          filters.action = filter;
        }

        if (dateRange.start) {
          filters.startDate = new Date(dateRange.start).getTime();
        }

        if (dateRange.end) {
          filters.endDate = new Date(dateRange.end).getTime();
        }

        const fetchedLogs = await getAuditLogs(filters);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogsEffect();
  }, [filter, dateRange]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'restore':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="restore">Restore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="input"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="btn btn-secondary"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No audit logs found for the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Collection
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{log.userName}</div>
                    <div className="text-xs text-gray-500">{log.userRole}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.collectionName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.details.reason && (
                      <div className="mb-1">{log.details.reason}</div>
                    )}
                    {log.details.eventId && (
                      <div className="text-xs text-gray-500">
                        Event: {log.details.eventId.substring(0, 8)}...
                      </div>
                    )}
                    {log.details.participantId && (
                      <div className="text-xs text-gray-500">
                        Participant: {log.details.participantId.substring(0, 8)}
                        ...
                      </div>
                    )}
                    {log.details.newData?.total !== undefined && (
                      <div className="text-xs text-green-600 font-semibold">
                        Score: {log.details.newData.total}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
