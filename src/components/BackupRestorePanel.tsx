import { useState, useRef } from 'react';
import { downloadBackup, uploadAndRestoreBackup } from '@/lib/firestoreHelpers';

interface BackupRestorePanelProps {
  exportedBy: string;
}

export function BackupRestorePanel({ exportedBy }: BackupRestorePanelProps) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await downloadBackup(exportedBy);
      alert('Backup downloaded successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a valid JSON backup file');
      return;
    }

    const confirmed = window.confirm(
      'Warning: Restoring from backup will ADD scores to the current database. ' +
        'This will NOT delete existing scores. Continue?'
    );

    if (!confirmed) return;

    setRestoreLoading(true);
    setRestoreResult(null);

    try {
      const result = await uploadAndRestoreBackup(file, exportedBy);
      setRestoreResult(result);

      if (result.failed === 0) {
        alert(`Successfully restored ${result.success} scores!`);
      } else {
        alert(
          `Restored ${result.success} scores. ${result.failed} failed. Check details below.`
        );
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup. Please check the file format.');
    } finally {
      setRestoreLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Backup & Restore</h2>

      <div className="space-y-6">
        {/* Backup Section */}
        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">
            📦 Backup Scores
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Download all scores as a JSON file. This includes all score data,
            metadata, and timestamps.
          </p>
          <button
            onClick={handleBackup}
            disabled={backupLoading}
            className="btn btn-primary"
          >
            {backupLoading ? 'Creating Backup...' : '⬇ Download Backup'}
          </button>
        </div>

        {/* Restore Section */}
        <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-orange-900">
            📥 Restore Scores
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Upload a backup JSON file to restore scores. This will ADD scores to
            the database without deleting existing data.
          </p>
          <div className="flex gap-3 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleRestoreClick}
              disabled={restoreLoading}
              className="btn btn-secondary"
            >
              {restoreLoading ? 'Restoring...' : '⬆ Upload & Restore'}
            </button>
            {restoreLoading && (
              <span className="text-sm text-gray-600">
                Processing backup file...
              </span>
            )}
          </div>
        </div>

        {/* Restore Results */}
        {restoreResult && (
          <div
            className={`p-6 rounded-lg border-2 ${
              restoreResult.failed === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-3">Restore Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Successfully restored:</span>
                <span className="text-green-600 font-bold">
                  {restoreResult.success} scores
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Failed:</span>
                <span className="text-red-600 font-bold">
                  {restoreResult.failed} scores
                </span>
              </div>
            </div>

            {restoreResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2 text-red-700">
                  Errors:
                </h4>
                <div className="bg-white p-3 rounded border border-red-200 max-h-40 overflow-y-auto">
                  {restoreResult.errors.map((error, idx) => (
                    <div key={idx} className="text-xs text-red-600 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning Notice */}
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Backup files contain all score data in JSON format</li>
                <li>Restore does NOT clear existing scores first</li>
                <li>
                  To completely replace scores, clear the database manually
                  before restoring
                </li>
                <li>
                  Store backup files securely - they contain sensitive
                  competition data
                </li>
                <li>Restore operations are logged in the audit log</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
