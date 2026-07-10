import { Tabs } from 'expo-router';
import React from 'react';
import { ColorValue, Platform } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Stethoscope } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { useLocale } from '@/hooks/useLocale';

type IconProps = { color: string | ColorValue; size: number };
const str = (c: string | ColorValue): string => c as string;

function HomeIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V16H9V21H4C3.4 21 3 20.6 3 20V10.5Z"
        fill={str(color)}
        opacity={0.9}
      />
    </Svg>
  );
}

function CollectionIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="2" fill={str(color)} opacity={0.9} />
      <Rect x="13" y="3" width="8" height="8" rx="2" fill={str(color)} opacity={0.65} />
      <Rect x="3" y="13" width="8" height="8" rx="2" fill={str(color)} opacity={0.65} />
      <Rect x="13" y="13" width="8" height="8" rx="2" fill={str(color)} opacity={0.9} />
    </Svg>
  );
}

function ProfileIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={str(color)} opacity={0.9} />
      <Path
        d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20"
        stroke={str(color)}
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.9}
      />
    </Svg>
  );
}

export default function TabLayout() {
  const { t } = useLocale();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.darkGreen,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: t('tabs.diagnosis'),
          tabBarIcon: ({ color, size }) => <Stethoscope color={str(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: t('tabs.collection'),
          tabBarIcon: ({ color, size }) => <CollectionIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
