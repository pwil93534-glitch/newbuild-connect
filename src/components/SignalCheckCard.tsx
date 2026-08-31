import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Button } from './Button';
import { SignalMeter } from './SignalMeter';
import { Colors, FontSize, FontWeight, Spacing } from '../design-system';
import { useSignalCheck } from '../hooks/useSignalCheck';
import { ConnectionType } from '../types';

const CONNECTION_LABEL: Record<ConnectionType, string> = {
  wifi: 'Wi-Fi',
  cellular: 'Cellular',
  none: 'No connection',
  unknown: 'Unknown connection',
};

const CONNECTION_ICON: Record<ConnectionType, keyof typeof Ionicons.glyphMap> = {
  wifi: 'wifi-outline',
  cellular: 'cellular-outline',
  none: 'close-circle-outline',
  unknown: 'help-circle-outline',
};

interface SignalCheckCardProps {
  contextLabel?: string;
}

export function SignalCheckCard({ contextLabel }: SignalCheckCardProps) {
  const { result, isChecking, error, runCheck } = useSignalCheck();

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const showTip = result?.quality === 'poor' || result?.quality === 'fair' || result?.quality === 'none';

  return (
    <Card style={styles.card} padding={Spacing.md}>
      <View style={styles.header}>
        <Ionicons name="cellular-outline" size={20} color={Colors.primary} />
        <Text style={styles.title}>
          {contextLabel ? `Signal Check — ${contextLabel}` : 'Phone Signal Check'}
        </Text>
      </View>

      {isChecking && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking your connection…</Text>
        </View>
      )}

      {!isChecking && error && <Text style={styles.errorText}>{error}</Text>}

      {!isChecking && !error && result && (
        <>
          <SignalMeter quality={result.quality} />
          <View style={styles.detailsRow}>
            <Ionicons name={CONNECTION_ICON[result.connectionType]} size={14} color={Colors.textSecondary} />
            <Text style={styles.detailsText}>
              {CONNECTION_LABEL[result.connectionType]}
              {result.latencyMs !== null ? ` · ${result.latencyMs}ms response` : ''}
            </Text>
          </View>
          {showTip && (
            <Text style={styles.tipText}>
              New-build communities can have thinner coverage until nearby towers catch up. If it's
              spotty on site, your strategist can point you to the strongest spot to make a call.
            </Text>
          )}
        </>
      )}

      <Button
        title={isChecking ? 'Checking…' : 'Check Again'}
        onPress={runCheck}
        variant="secondary"
        size="sm"
        disabled={isChecking}
        style={styles.retryBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  errorText: { fontSize: FontSize.sm, color: Colors.danger },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tipText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginTop: 2 },
  retryBtn: { alignSelf: 'flex-start', marginTop: Spacing.xs },
});
