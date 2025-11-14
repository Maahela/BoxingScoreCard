import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPin } from '@/lib/firestoreHelpers';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const pinData = await verifyPin(pin);
      
      if (!pinData) {
        setError('Invalid PIN. Please try again.');
        setLoading(false);
        return;
      }

      login(
        pinData.role,
        pinData.invigilatorId,
        pinData.name,
        pinData.eventsAssigned
      );

      // Navigate based on role
      switch (pinData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'invigilator':
          navigate('/invigilator');
          break;
        case 'display':
          navigate('/display');
          break;
      }
    } catch (err) {
      setError('Error verifying PIN. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Boxing Scoreboard
          </h1>
          <p className="text-gray-600">Interfaculty Boxing Freshers 2024</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input text-center text-2xl tracking-widest"
              placeholder="••••••"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="btn btn-primary w-full text-lg"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For PIN access, contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
