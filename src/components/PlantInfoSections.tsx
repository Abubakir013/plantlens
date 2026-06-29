import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';
import { useLocale } from '@/hooks/useLocale';
import type { GuideTopic } from '@/hooks/useClaudeVision';

export interface PlantSectionsData {
  scientificName: string;
  guideTopics?: GuideTopic[];
  /** Plant ID from the collection — if set, guide-detail will persist fetched guides back to storage. */
  plantId?: string;
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
function IconBook() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={Colors.darkGreen} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={Colors.darkGreen} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDown() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={Colors.textMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const GUIDE_ICONS: Record<string, string[]> = {
  watering: ['M12 2C9 6 5 11 5 15a7 7 0 0 0 14 0c0-4-3-9-7-13z'],
  pruning: [
    'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'M8.46 8.46l7.08 7.08',
    'M15.54 8.46L8.46 15.54',
  ],
  propagation: ['M12 3v18', 'M5 10l7-7 7 7'],
  repotting: [
    'M4 14h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z',
    'M9 14V9a3 3 0 0 1 6 0v5',
  ],
  fertilizing: ['M13 2L3 14h9l-1 8 10-12h-9z'],
  sunlight: [
    'M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z',
    'M12 2v2', 'M12 20v2',
    'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42',
    'M2 12h2', 'M20 12h2',
    'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42',
  ],
  temperature: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
  soil: ['M3 9h18', 'M3 14h18', 'M5 19h14'],
  commonProblems: [
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
};

function GuideTopicIcon({ topicId }: { topicId: string }) {
  const paths = GUIDE_ICONS[topicId] ?? ['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z'];
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={Colors.darkGreen}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const progress = useSharedValue(1);

  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(progress.value, [0, 1], [0, 900]),
    overflow: 'hidden' as const,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0, 1]),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [-90, 0])}deg` }],
  }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 280 });
  };

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity onPress={toggle} style={styles.sectionHeader} activeOpacity={0.85}>
        <View style={styles.sectionIconBox}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={bodyStyle}>
        <Animated.View style={innerStyle}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Guide row ────────────────────────────────────────────────────────────────
function GuideRow({
  topic,
  onPress,
  last,
}: {
  topic: GuideTopic;
  onPress: () => void;
  last?: boolean;
}) {
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { stiffness: 400, damping: 22 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { stiffness: 400, damping: 22 });
        }}
        style={[styles.guideRow, !last && styles.guideRowBorder]}
      >
        <View style={styles.guideIconBox}>
          <GuideTopicIcon topicId={topic.id} />
        </View>
        <View style={styles.guideRowText}>
          <Text style={styles.guideRowTitle}>{topic.title}</Text>
          <Text style={styles.guideRowSummary} numberOfLines={1}>{topic.summary}</Text>
        </View>
        <ChevronRight />
      </Pressable>
    </Animated.View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PlantInfoSections({ data }: { data: PlantSectionsData }) {
  const { t, locale } = useLocale();
  const { guideTopics, scientificName, plantId } = data;

  const hasGuides = Array.isArray(guideTopics) && guideTopics.length > 0;

  const stagger = useRef([
    { op: new RNAnimated.Value(0), y: new RNAnimated.Value(24) },
  ]).current;

  useEffect(() => {
    if (!hasGuides) return;
    RNAnimated.stagger(
      80,
      stagger.map(({ op, y }) =>
        RNAnimated.parallel([
          RNAnimated.timing(op, { toValue: 1, duration: 380, useNativeDriver: true }),
          RNAnimated.timing(y, { toValue: 0, duration: 380, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  if (!hasGuides) return null;

  const navigateToGuide = (topic: GuideTopic) => {
    router.push({
      pathname: '/guide-detail',
      params: {
        latinName: scientificName,
        topicId: topic.id,
        topicTitle: topic.title,
        language: locale,
        ...(plantId ? { plantId } : {}),
      },
    });
  };

  return (
    <View style={styles.container}>
      <RNAnimated.View
        style={{ opacity: stagger[0].op, transform: [{ translateY: stagger[0].y }] }}
      >
        <CollapsibleSection title={t('result.guidesTitle')} icon={<IconBook />}>
          <View style={styles.rowsContainer}>
            {guideTopics!.map((topic, idx) => (
              <GuideRow
                key={topic.id}
                topic={topic}
                onPress={() => navigateToGuide(topic)}
                last={idx === guideTopics!.length - 1}
              />
            ))}
          </View>
        </CollapsibleSection>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  rowsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  guideRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  guideIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.lightMintBg,
    borderWidth: 1,
    borderColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideRowText: {
    flex: 1,
    gap: 2,
  },
  guideRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  guideRowSummary: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
});
