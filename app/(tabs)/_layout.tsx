import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../../src/design-system';

function TabIcon({ name, focused, label }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
        size={24}
        color={focused ? Colors.primary : Colors.textSecondary}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} label="Home" /> }} />
      <Tabs.Screen name="communities" options={{ tabBarIcon: ({ focused }) => <TabIcon name="business" focused={focused} label="Search" /> }} />
      <Tabs.Screen name="journey" options={{ tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} label="Journey" /> }} />
      <Tabs.Screen name="advisor" options={{ tabBarIcon: ({ focused }) => <TabIcon name="chatbubbles" focused={focused} label="Advisor" /> }} />
      <Tabs.Screen name="calculator" options={{ tabBarIcon: ({ focused }) => <TabIcon name="calculator" focused={focused} label="Calc" /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} label="Profile" /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tabLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
});
