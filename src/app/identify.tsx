import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { LeafLoader } from '@/components/LeafLoader';
import { Colors } from '@/constants/colors';
import { useClaudeVision } from '@/hooks/useClaudeVision';
import { useLocale } from '@/hooks/useLocale';
import { pendingImageStore } from '@/stores/pendingImageStore';
import { plantResultStore } from '@/stores/plantResultStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MAX_API_EDGE = 1568;

// Downscale only if the longest edge exceeds MAX_API_EDGE (never upscale).
// Returns just the base64 for the API — the original URI is kept for display.
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

function PermissionScreen({ onRequest, title, text, btnLabel }: {
  onRequest: () => void;
  title: string;
  text: string;
  btnLabel: string;
}) {
  return (
    <SafeAreaView style={styles.permissionContainer} edges={['top', 'bottom']}>
      <Text style={styles.permissionEmoji}>📷</Text>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionText}>{text}</Text>
      <TouchableOpacity style={styles.permissionBtn} onPress={onRequest} activeOpacity={0.85}>
        <LinearGradient colors={['#4ADE80', '#16A34A']} style={styles.permissionGradient}>
          <Text style={styles.permissionBtnText}>{btnLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function IdentifyScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { identify, loading, error } = useClaudeVision();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  // DEBUG: show exact technical error whenever the hook reports one
  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error ?? t('identify.unknownError'));
    }
  }, [error]);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  // Pick up any image pre-loaded from the gallery picker on the Home screen
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
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 0.9,
        exif: false,
      });
      if (!photo) return;
      // Keep the original high-res URI for display; only the base64 is shrunken for the API.
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
    if (!result) {
      // Alert is shown by the useEffect above once `error` state updates
      return;
    }
    plantResultStore.set(result, capturedUri);
    router.push('/result');
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setCapturedBase64(null);
  };

  // ── Permission not determined / denied ──
  // Skip camera permission check if we already have a preloaded gallery image
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

  // ── Loading overlay ──
  if (loading) {
    return (
      <View style={[styles.bg, styles.loadingContainer]}>
        <LeafLoader label={t('identify.loading')} />
      </View>
    );
  }

  // ── Preview mode (after capture) ──
  if (capturedUri) {
    return (
      <View style={styles.bg}>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />

        {/* Gradient overlay at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={styles.previewOverlay}
        />

        {/* Single back button — inlined to guarantee exactly one instance */}
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

            <TouchableOpacity
              style={styles.identifyBtn}
              onPress={handleIdentify}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#4ADE80', '#16A34A']}
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

  // ── Camera view ──
  return (
    <View style={styles.bg}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Dark top gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      {/* Dark bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
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
              <Path
                d="M1 4V10H7"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M3.51 15A9 9 0 1 0 5.64 5.64L1 10"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Focus frame */}
        <View style={styles.frameContainer} pointerEvents="none">
          <View style={styles.frame}>
            {/* Corners */}
            {[
              { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
              { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
              { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
            ].map((corner, i) => (
              <View
                key={i}
                style={[styles.corner, corner, { borderColor: Colors.primaryGreen }]}
              />
            ))}
          </View>
          <Text style={styles.frameHint}>{t('identify.centerPlant')}</Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {/* Gallery button */}
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

          {/* Capture button */}
          <TouchableOpacity
            onPress={handleCapture}
            style={styles.captureOuter}
            activeOpacity={0.85}
            disabled={!cameraReady}
          >
            <LinearGradient
              colors={['#4ADE80', '#16A34A']}
              style={styles.captureInner}
            >
              <View style={styles.captureCore} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Flash placeholder (spacing) */}
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
  permissionEmoji: { fontSize: 56 },
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
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    width: SCREEN_W * 0.72,
    height: SCREEN_W * 0.72,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 2,
  },
  frameHint: {
    color: 'rgba(255,255,255,0.75)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 3,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  // Preview styles
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
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'underline',
  },
});
