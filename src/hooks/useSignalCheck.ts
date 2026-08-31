import { useCallback, useState } from 'react';
import { checkSignal } from '../services/network';
import { SignalCheckResult } from '../types';

interface UseSignalCheckResult {
  result: SignalCheckResult | null;
  isChecking: boolean;
  error: string | null;
  runCheck: () => Promise<void>;
}

export function useSignalCheck(): UseSignalCheckResult {
  const [result, setResult] = useState<SignalCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const next = await checkSignal();
      setResult(next);
    } catch {
      setError('Could not check your signal right now. Check your network settings and try again.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { result, isChecking, error, runCheck };
}
