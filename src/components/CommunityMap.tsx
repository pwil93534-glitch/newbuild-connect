import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../design-system';
import { Community, BuyerType } from '../types';
import {
  COMMUNITY_COORDINATES,
  BASE_COORDINATES,
  ARIZONA_REGION,
  PHOENIX_REGION,
  TUCSON_REGION,
} from '../constants/map';
import { useBuyerStore } from '../stores/buyer';

const TWENTY_MILES_METERS = 20 * 1609.34;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityMapProps {
  communities: Community[];
}

export function CommunityMap({ communities }: CommunityMapProps) {
  const router = useRouter();
  const { buyer } = useBuyerStore();
  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(
    buyer?.military_base ? PHOENIX_REGION : ARIZONA_REGION
  );

  const isVeteran = buyer?.buyer_type === 'veteran';
  const buyerBase = buyer?.military_base ?? null;

  const selectedCommunity = communities.find((c) => c.id === selectedId) ?? null;

  function selectCommunity(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    const coords = COMMUNITY_COORDINATES[id];
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...coords, latitudeDelta: 0.12, longitudeDelta: 0.12 },
        400
      );
    }
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }

  function deselect() {
    setSelectedId(null);
    Animated.timing(cardAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
  }

  function zoomToPhoenix() {
    mapRef.current?.animateToRegion(PHOENIX_REGION, 500);
  }

  function zoomToTucson() {
    mapRef.current?.animateToRegion(TUCSON_REGION, 500);
  }

  function zoomToAll() {
    mapRef.current?.animateToRegion(ARIZONA_REGION, 500);
  }

  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [220, 0] });

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={deselect}
        showsUserLocation
        showsCompass
        showsScale
      >
        {/* Military base circles for veteran buyers */}
        {isVeteran && buyerBase && BASE_COORDINATES[buyerBase] && (
          <>
            <Circle
              center={BASE_COORDINATES[buyerBase]}
              radius={TWENTY_MILES_METERS}
              strokeColor="rgba(0, 51, 102, 0.4)"
              fillColor="rgba(0, 51, 102, 0.08)"
              strokeWidth={2}
            />
            <Marker
              coordinate={BASE_COORDINATES[buyerBase]}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={deselect}
            >
              <View style={styles.baseMarker}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
                <Text style={styles.baseMarkerText}>{BASE_COORDINATES[buyerBase].shortName}</Text>
              </View>
            </Marker>
          </>
        )}

        {/* Community markers */}
        {communities.map((community) => {
          const coords = COMMUNITY_COORDINATES[community.id];
          if (!coords) return null;
          const isSelected = community.id === selectedId;
          const priceLabel = `$${(community.priceFrom / 1000).toFixed(0)}K`;
          return (
            <Marker
              key={community.id}
              coordinate={coords}
              anchor={{ x: 0.5, y: 1 }}
              onPress={(e) => {
                e.stopPropagation();
                selectCommunity(community.id);
              }}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerContainerSelected]}>
                <View style={[styles.marker, { backgroundColor: community.color }, isSelected && styles.markerSelected]}>
                  <Text style={[styles.markerPrice, isSelected && styles.markerPriceSelected]}>
                    {priceLabel}
                  </Text>
                  {community.vaEligible && isVeteran && (
                    <Ionicons name="shield-checkmark" size={10} color={isSelected ? Colors.white : Colors.primary} />
                  )}
                </View>
                <View style={[styles.markerTail, { borderTopColor: community.color }, isSelected && { borderTopColor: Colors.primary }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Zone controls */}
      <View style={styles.zoneControls}>
        <TouchableOpacity style={styles.zoneBtn} onPress={zoomToAll}>
          <Text style={styles.zoneBtnText}>All AZ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoneBtn} onPress={zoomToPhoenix}>
          <Text style={styles.zoneBtnText}>Phoenix</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoneBtn} onPress={zoomToTucson}>
          <Text style={styles.zoneBtnText}>Tucson</Text>
        </TouchableOpacity>
      </View>

      {/* Count pill */}
      <View style={styles.countPill}>
        <Text style={styles.countPillText}>{communities.length} communities</Text>
      </View>

      {/* Veteran overlay legend */}
      {isVeteran && buyerBase && (
        <View style={styles.legend}>
          <View style={styles.legendCircle} />
          <Text style={styles.legendText}>20-mile BAH zone</Text>
        </View>
      )}

      {/* Bottom community card */}
      {selectedCommunity && (
        <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardTranslateY }] }]}>
          <View style={[styles.card, { borderLeftColor: selectedCommunity.color, borderLeftWidth: 5 }]}>
            <TouchableOpacity style={styles.cardDismiss} onPress={deselect} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.cardHeader}>
              <View style={[styles.cardDot, { backgroundColor: selectedCommunity.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{selectedCommunity.name}</Text>
                <Text style={styles.cardBuilder}>{selectedCommunity.builder} · {selectedCommunity.city}, AZ</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.cardPrice}>
                ${(selectedCommunity.priceFrom / 1000).toFixed(0)}K – ${(selectedCommunity.priceTo / 1000).toFixed(0)}K
              </Text>
              <View style={styles.cardBadges}>
                {selectedCommunity.vaEligible && (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>VA</Text>
                  </View>
                )}
                {selectedCommunity.fhaEligible && (
                  <View style={[styles.cardBadge, { backgroundColor: Colors.buyerFirstTimeLight }]}>
                    <Text style={[styles.cardBadgeText, { color: Colors.buyerFirstTime }]}>FHA</Text>
                  </View>
                )}
                {selectedCommunity.seniorCommunity && (
                  <View style={[styles.cardBadge, { backgroundColor: Colors.buyerSeniorLight }]}>
                    <Text style={[styles.cardBadgeText, { color: Colors.buyerSenior }]}>55+</Text>
                  </View>
                )}
              </View>
            </View>

            {selectedCommunity.activeIncentives.length > 0 && (
              <Text style={styles.cardIncentive} numberOfLines={1}>
                🏷 {selectedCommunity.activeIncentives[0]}
              </Text>
            )}

            {selectedCommunity.distanceFromBase != null && isVeteran && (
              <Text style={styles.cardDistance}>
                <Ionicons name="shield-outline" size={12} color={Colors.primary} /> {selectedCommunity.distanceFromBase} mi from base
              </Text>
            )}

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => router.push(`/community/${selectedCommunity.id}` as any)}
            >
              <Text style={styles.viewBtnText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  markerContainer: { alignItems: 'center' },
  markerContainerSelected: { zIndex: 10 },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  markerSelected: { borderColor: Colors.primary, borderWidth: 2, ...Shadows.md },
  markerPrice: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  markerPriceSelected: { color: Colors.primary },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: Colors.transparent,
    borderRightColor: Colors.transparent,
    marginTop: -1,
  },

  baseMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.sm,
  },
  baseMarkerText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white },

  zoneControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 6,
  },
  zoneBtn: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  zoneBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },

  countPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...Shadows.sm,
  },
  countPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.white },

  legend: {
    position: 'absolute',
    bottom: 200,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(0,51,102,0.4)',
    backgroundColor: 'rgba(0,51,102,0.08)',
  },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },

  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  cardDismiss: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingRight: 28 },
  cardDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  cardName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardBuilder: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  cardBadges: { flexDirection: 'row', gap: 4 },
  cardBadge: {
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cardBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary },
  cardIncentive: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.medium },
  cardDistance: { fontSize: FontSize.xs, color: Colors.textSecondary },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  viewBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
});
