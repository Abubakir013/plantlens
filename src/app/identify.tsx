import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Camera } from 'lucide-react-native';

import { LeafLoader } from '@/components/LeafLoader';
import { Colors } from '@/constants/colors';
import { useClaudeVision } from '@/hooks/useClaudeVision';
import { useLocale } from '@/hooks/useLocale';
import { pendingImageStore } from '@/stores/pendingImageStore';
import { plantResultStore } from '@/stores/plantResultStore';

const { width: SCREEN_W } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_W * 0.72;
const MAX_API_EDGE = 1568;

async function resizeForAPI(uri: string, srcW: number, srcH: number): Promise<string> {
  const longest = Math.max(srcW, srcH);
  const result = await ImageManipulator.manipulateAsync(
    uri,
    longest > MAX_API_EDGE
      ? [srcW >= srcH ? { resize: { width: MAX_API_EDGE } } : { resize: { height: MAX_API_EDGE } }]
      : [],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64 ?? '';
}

// ── Animated scanning line ────────────────────────────────────────────────────
function ScanLine() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 2400, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [0, FRAME_SIZE - 2, FRAME_SIZE - 2],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.06, 0.86, 0.94, 1],
    outputRange: [0, 0.9, 0.9, 0, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity, transform: [{ translateY }] }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(82,183,136,0.9)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 1.5 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(82,183,136,0.18)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 10, marginTop: -4 }}
      />
    </Animated.View>
  );
}

// ── Pulsing corner brackets ───────────────────────────────────────────────────
const CORNER_DEFS = [
  { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
  { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5 },
  { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
  { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5 },
] as const;

function PulsingCorners() {
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 1100, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <>
      {CORNER_DEFS.map((corner, i) => (
        <Animated.View
          key={i}
          style={[styles.corner, corner, { borderColor: Colors.primaryGreen, opacity: pulse }]}
        />
      ))}
    </>
  );
}

// ── Single floating botanical particle ───────────────────────────────────────
function FloatingParticle({ leftPx, size, startDelay, cycleDuration }: {
  leftPx: number;
  size: number;
  startDelay: number;
  cycleDuration: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(startDelay),
        Animated.timing(progress, { toValue: 1, duration: cycleDuration, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 0.08, 0.82, 0.92, 1],
    outputRange: [
      FRAME_SIZE * 0.88,
      FRAME_SIZE * 0.78,
      FRAME_SIZE * 0.06,
      FRAME_SIZE * 0.02,
      FRAME_SIZE * 0.88,
    ],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.72, 0.9, 1],
    outputRange: [0, 0.5, 0.5, 0, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: leftPx, top: 0, opacity, transform: [{ translateY }] }}
    >
      <Svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 8 12">
        <Path
          d="M4 12 C2 10 0 7 1 4 C2 6 3 8 4 9 C4 6 3 2 4 0 C5 2 4 6 4 9 C5 8 6 6 7 4 C8 7 6 10 4 12Z"
          fill="#52B788"
          opacity={0.9}
        />
      </Svg>
    </Animated.View>
  );
}

// ── Expanding ring around capture button ─────────────────────────────────────
function CaptureRing({ active }: { active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!active) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.40, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.45, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1.5,
        borderColor: Colors.primaryGreen,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ── Back button ───────────────────────────────────────────────────────────────
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn} activeOpacity={0.8}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 18L9 12L15 6"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}

// ── Permission screen ─────────────────────────────────────────────────────────
function PermissionScreen({ onRequest, title, text, btnLabel }: {
  onRequest: () => void;
  title: string;
  text: string;
  btnLabel: string;
}) {
  return (
    <SafeAreaView style={styles.permissionContainer} edges={['top', 'bottom']}>
      <Camera size={56} color={Colors.darkGreen} />
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionText}>{text}</Text>
      <TouchableOpacity style={styles.permissionBtn} onPress={onRequest} activeOpacity={0.85}>
        <LinearGradient colors={['#2D6A4F', '#143026']} style={styles.permissionGradient}>
          <Text style={styles.permissionBtnText}>{btnLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function IdentifyScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { identify, loading, error } = useClaudeVision();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (error) Alert.alert(t('common.error'), error ?? t('identify.unknownError'));
  }, [error]);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  useEffect(() => {
    const uri = pendingImageStore.getUri();
    const b64 = pendingImageStore.getBase64();
    if (uri && b64) {
      setCapturedUri(uri);
      setCapturedBase64(b64);
      pendingImageStore.clear();
    }
  }, []);

  const hasPreloaded = capturedUri !== null;

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.9, exif: false });
      if (!photo) return;
      const apiBase64 = await resizeForAPI(photo.uri, photo.width, photo.height);
      setCapturedUri(photo.uri);
      setCapturedBase64(apiBase64);
    } catch {
      Alert.alert(t('common.error'), t('identify.captureError'));
    }
  };

  const handlePickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('identify.galleryPermissionTitle'), t('identify.galleryPermissionText'));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: false,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    const apiBase64 = await resizeForAPI(asset.uri, asset.width, asset.height);
    setCapturedUri(asset.uri);
    setCapturedBase64(apiBase64);
  };

  const handleIdentify = async () => {
    if (!capturedBase64 || !capturedUri) return;
    const result = await identify(capturedBase64);
    if (!result) return;
    plantResultStore.set(result, capturedUri);
    router.push('/result');
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setCapturedBase64(null);
  };

  if (!hasPreloaded) {
    if (!permission) return <View style={styles.bg} />;
    if (!permission.granted) {
      return (
        <PermissionScreen
          onRequest={requestPermission}
          title={t('identify.permissionTitle')}
          text={t('identify.permissionText')}
          btnLabel={t('identify.grantPermission')}
        />
      );
    }
  }

  if (loading) {
    return (
      <View style={[styles.bg, styles.loadingContainer]}>
        <LeafLoader label={t('identify.loading')} />
      </View>
    );
  }

  // ── Preview (after capture) ───────────────────────────────────────────────
  if (capturedUri) {
    return (
      <View style={styles.bg}>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={styles.previewOverlay}
        />
        <TouchableOpacity
          onPress={handleRetake}
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 16, left: 16, zIndex: 20 }]}
          activeOpacity={0.8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <SafeAreaView style={StyleSheet.absoluteFill} edges={['bottom']} pointerEvents="box-none">
          <View style={styles.previewActions}>
            <Text style={styles.previewHint}>{t('identify.previewHint')}</Text>
            <TouchableOpacity style={styles.identifyBtn} onPress={handleIdentify} activeOpacity={0.88}>
              <LinearGradient
                colors={['#2D6A4F', '#143026']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.identifyGradient}
              >
                <Text style={styles.identifyText}>{t('identify.identifyButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn} activeOpacity={0.8}>
              <Text style={styles.retakeText}>{t('identify.retake')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Camera view ───────────────────────────────────────────────────────────
  return (
    <View style={styles.bg}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.60)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.70)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <SafeAreaView style={StyleSheet.absoluteFill} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.topBarTitle}>{t('identify.title')}</Text>
          <TouchableOpacity
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            style={styles.flipBtn}
            activeOpacity={0.8}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M1 4V10H7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M3.51 15A9 9 0 1 0 5.64 5.64L1 10" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Focus frame with animations */}
        <View style={styles.frameContainer} pointerEvents="none">
          <View style={styles.frame}>
            <PulsingCorners />
            <ScanLine />
            {/* Botanical particles floating upward */}
            <FloatingParticle leftPx={FRAME_SIZE * 0.12} size={6} startDelay={0}    cycleDuration={4000} />
            <FloatingParticle leftPx={FRAME_SIZE * 0.30} size={5} startDelay={900}  cycleDuration={3600} />
            <FloatingParticle leftPx={FRAME_SIZE * 0.55} size={7} startDelay={1800} cycleDuration={4400} />
            <FloatingParticle leftPx={FRAME_SIZE * 0.74} size={5} startDelay={500}  cycleDuration={3800} />
            <FloatingParticle leftPx={FRAME_SIZE * 0.88} size={6} startDelay={2400} cycleDuration={4200} />
          </View>
          <Text style={styles.frameHint}>{t('identify.centerPlant')}</Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {/* Gallery */}
          <TouchableOpacity onPress={handlePickFromGallery} style={styles.sideBtn} activeOpacity={0.8}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
                stroke="white"
                strokeWidth={1.8}
              />
              <Circle cx="8.5" cy="8.5" r="1.5" fill="white" />
              <Path d="M21 15L16 10L5 21" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <Text style={styles.sideBtnLabel}>{t('identify.gallery')}</Text>
          </TouchableOpacity>

          {/* Capture button with expanding ring */}
          <View style={styles.captureWrap}>
            <CaptureRing active={cameraReady} />
            <TouchableOpacity
              onPress={handleCapture}
              style={styles.captureOuter}
              activeOpacity={0.85}
              disabled={!cameraReady}
            >
              <LinearGradient
                colors={['#2D6A4F', '#143026']}
                style={styles.captureInner}
              >
                <View style={styles.captureCore} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Flash icon (placeholder) */}
          <View style={styles.sideBtn}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 2L4.09 12.74C3.74 13.16 4.04 13.8 4.6 13.8H11L11 22L19.91 11.26C20.26 10.84 19.96 10.2 19.4 10.2H13V2Z"
                fill="white"
                opacity={0.85}
              />
            </Svg>
            <Text style={styles.sideBtnLabel}>{t('identify.flash')}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightMintBg,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  permissionBtn: {
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  permissionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
  },
  permissionBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  flipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: -40,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 2,
  },
  frameHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  sideBtnLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  captureWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
    padding: 3,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  captureInner: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  // Preview
  preview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  previewHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  identifyBtn: {
    alignSelf: 'stretch',
    borderRadius: 14,
    shadowColor: Colors.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  identifyGradient: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  identifyText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.4,
  },
  retakeBtn: {
    paddingVertical: 8,
  },
  retakeText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'underline',
  },
});
