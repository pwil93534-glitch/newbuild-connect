import * as Network from 'expo-network';
import { ConnectionType, SignalCheckResult, SignalQuality } from '../types';

// Small, payload-free endpoint used purely to time a round trip. iOS and
// Android don't expose carrier signal bars (dBm) to apps, so "signal" here
// means real-world responsiveness — what actually determines whether a call,
// photo upload, or form submission is fast or stalls on site.
const PROBE_URL = 'https://www.gstatic.com/generate_204';
const PROBE_TIMEOUT_MS = 6000;

function mapConnectionType(type: Network.NetworkStateType | undefined): ConnectionType {
  switch (type) {
    case Network.NetworkStateType.WIFI:
      return 'wifi';
    case Network.NetworkStateType.CELLULAR:
      return 'cellular';
    case Network.NetworkStateType.NONE:
      return 'none';
    default:
      return 'unknown';
  }
}

async function measureLatencyMs(): Promise<number | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    await fetch(PROBE_URL, { method: 'GET', cache: 'no-store', signal: controller.signal });
    return Date.now() - startedAt;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function classifyQuality(
  connectionType: ConnectionType,
  isInternetReachable: boolean,
  latencyMs: number | null
): SignalQuality {
  if (connectionType === 'none') return 'none';
  if (!isInternetReachable || latencyMs === null) return 'poor';
  if (latencyMs < 150) return 'excellent';
  if (latencyMs < 400) return 'good';
  if (latencyMs < 900) return 'fair';
  return 'poor';
}

export async function checkSignal(): Promise<SignalCheckResult> {
  const state = await Network.getNetworkStateAsync();
  const connectionType = mapConnectionType(state.type);
  const isInternetReachable = state.isInternetReachable ?? false;

  const latencyMs = connectionType === 'none' ? null : await measureLatencyMs();
  const quality = classifyQuality(connectionType, isInternetReachable, latencyMs);

  return {
    quality,
    connectionType,
    isInternetReachable,
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}
