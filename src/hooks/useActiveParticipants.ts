import { useState, useEffect } from 'react';
import { subscribeToActiveParticipants } from '@/lib/firestoreHelpers';
import type { ActiveParticipants } from '@/types';

export function useActiveParticipants() {
  const [activeParticipants, setActiveParticipants] =
    useState<ActiveParticipants | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveParticipants((data) => {
      setActiveParticipants(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { activeParticipants, loading };
}
