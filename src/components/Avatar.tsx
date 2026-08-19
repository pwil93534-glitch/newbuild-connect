import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, FontWeight } from '../design-system';

interface AvatarProps {
  name?: string;
  size?: number;
  imageUri?: string;
  imageSource?: any;
  style?: ViewStyle;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function Avatar({ name, size = 48, imageUri, imageSource, style }: AvatarProps) {
  const initials = name ? getInitials(name) : '?';
  const fontSize = size * 0.38;
  const source = imageSource ?? (imageUri ? { uri: imageUri } : null);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          contentFit="cover"
          contentPosition="top"
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});
