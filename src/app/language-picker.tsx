import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@/constants/languages';
import { useLocale } from '@/hooks/useLocale';
import { RTL_CODES } from '@/i18n/i18n';
import { Colors } from '@/constants/colors';

export default function LanguagePickerScreen() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = !q
      ? [...LANGUAGES]
      : LANGUAGES.filter(
          (l) =>
            l.nativeName.toLowerCase().includes(q) ||
            l.englishName.toLowerCase().includes(q)
        );
    return list.sort((a, b) => a.nativeName.localeCompare(b.nativeName));
  }, [query]);

  const handleSelect = async (code: string) => {
    const wasRTL = RTL_CODES.has(locale);
    const willBeRTL = RTL_CODES.has(code);
    await setLocale(code);
    if (wasRTL !== willBeRTL) {
      Alert.alert(
        t('languagePicker.restartTitle'),
        t('languagePicker.restartText'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('languagePicker.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('languagePicker.search')}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = item.code === locale;
          return (
            <TouchableOpacity
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => handleSelect(item.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <View style={styles.rowText}>
                <Text style={[styles.nativeName, selected && styles.nativeNameSelected]}>
                  {item.nativeName}
                </Text>
                <Text style={styles.englishName}>{item.englishName}</Text>
              </View>
              <View style={styles.badges}>
                {item.isRTL && (
                  <View style={styles.rtlBadge}>
                    <Text style={styles.rtlBadgeText}>{t('languagePicker.rtl')}</Text>
                  </View>
                )}
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mintMid,
  },
  backBtn: {
    width: 40,
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    color: Colors.darkGreen,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mintMid,
  },
  searchInput: {
    backgroundColor: Colors.lightMintBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.mintMid,
  },
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mintMid,
  },
  rowSelected: {
    borderColor: Colors.darkGreen,
    backgroundColor: Colors.mintMid,
  },
  flag: {
    fontSize: 26,
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nativeNameSelected: {
    color: Colors.darkGreen,
  },
  englishName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rtlBadge: {
    backgroundColor: Colors.accentLime,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  rtlBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.darkGreen,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.darkGreen,
    fontWeight: '700',
  },
});
