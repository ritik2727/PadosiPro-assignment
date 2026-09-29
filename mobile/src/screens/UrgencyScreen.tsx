import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { tasksApi } from '../api/tasks';
import { UrgencyOption } from '../types';

interface UrgencyScreenProps {
  selection: {
    category: string;
    serviceTitle: string;
    subServices: string[];
  };
  onBack: () => void;
  onSubmitted: (lmName: string) => void;
}

export const UrgencyScreen: React.FC<UrgencyScreenProps> = ({
  selection,
  onBack,
  onSubmitted,
}) => {
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyOption | null>('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urgencyOptions: Array<{
    type: UrgencyOption;
    title: string;
    desc: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }> = [
    {
      type: 'Standard',
      title: 'Standard',
      desc: 'Within a few days is fine',
      icon: 'calendar-outline',
    },
    {
      type: 'Same day',
      title: 'Same day',
      desc: 'Today if possible',
      icon: 'white-balance-sunny',
    },
    {
      type: 'Express',
      title: 'Express',
      desc: 'As soon as you can',
      icon: 'flash-outline',
    },
    {
      type: 'Scheduled',
      title: 'Scheduled',
      desc: 'I have a specific time',
      icon: 'clock-outline',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedUrgency) return;

    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.createRequest({
        category: selection.category,
        serviceTitle: selection.serviceTitle,
        subServices: selection.subServices,
        urgency: selectedUrgency,
      });

      if (res.success && res.data) {
        onSubmitted(res.data.lifestyle_manager || 'Pilot LM');
      } else {
        throw new Error(res.error || 'Failed to submit request');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrap}>
          <Text style={styles.heading}>When do you need this?</Text>
          <Text style={styles.subtitle}>
            Pick what feels closest. You can always add detail next.
          </Text>

          {/* Selected Task Summary Pill */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Selected Service:</Text>
            <Text style={styles.summaryTitle}>{selection.serviceTitle}</Text>
            <Text style={styles.summarySub}>{selection.subServices.join(' • ')}</Text>
          </View>

          {/* Error Alert */}
          {error && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          )}

          {/* Urgency Option Cards */}
          <View style={styles.cardsContainer}>
            {urgencyOptions.map((opt) => {
              const isSelected = selectedUrgency === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  activeOpacity={0.8}
                  onPress={() => setSelectedUrgency(opt.type)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                >
                  {/* Left Icon */}
                  <View style={styles.iconWrap}>
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={24}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                  </View>

                  {/* Text */}
                  <View style={styles.textWrap}>
                    <Text style={[styles.optTitle, isSelected && styles.optTitleSelected]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.optDesc}>{opt.desc}</Text>
                  </View>

                  {/* Check circle if selected */}
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Next Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Next"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedUrgency || loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },
  contentWrap: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  summarySub: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  errorAlert: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 18,
  },
  optionCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  iconWrap: {
    width: 36,
    alignItems: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  optTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  optTitleSelected: {
    color: colors.primary,
  },
  optDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
});
