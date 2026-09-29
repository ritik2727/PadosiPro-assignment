import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  onSaved: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSaved }) => {
  const { saveProfile, profile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber || '');
  const [addressArea, setAddressArea] = useState(profile?.addressArea || '');
  const [societyBuilding, setSocietyBuilding] = useState(profile?.societyBuilding || '');
  const [flatUnit, setFlatUnit] = useState(profile?.flatUnit || '');
  const [gateNotes, setGateNotes] = useState(profile?.gateNotes || '');
  const [businessName, setBusinessName] = useState(profile?.businessName || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const cleanMobile = mobileNumber.replace(/[^\d]/g, '');
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!addressArea.trim()) {
      newErrors.addressArea = 'Address & area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await saveProfile({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        addressArea: addressArea.trim(),
        societyBuilding: societyBuilding.trim() || undefined,
        flatUnit: flatUnit.trim() || undefined,
        gateNotes: gateNotes.trim() || undefined,
        businessName: businessName.trim() || undefined,
      });
      onSaved();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Location Chip */}
          <View style={styles.locationChip}>
            <Text style={styles.locationChipText}>Mumbai</Text>
          </View>

          <Text style={styles.heading}>A few details</Text>
          <Text style={styles.subtitle}>
            So your Lifestyle Manager can coordinate visits and deliveries smoothly.
          </Text>

          {/* Server Error Alert */}
          {serverError && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{serverError}</Text>
            </View>
          )}

          {/* Input Fields */}
          <Input
            label="Full name"
            placeholder="e.g. Ayush"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            error={errors.fullName}
          />

          <Input
            label="Mobile number"
            placeholder="98765 43210"
            iconName="phone-outline"
            prefix="+91"
            keyboardType="phone-pad"
            maxLength={12}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            }}
            error={errors.mobileNumber}
          />

          <Input
            label="Address & area"
            placeholder="e.g. Vijay Nagar, Andheri East"
            value={addressArea}
            onChangeText={(text) => {
              setAddressArea(text);
              if (errors.addressArea) setErrors({ ...errors, addressArea: '' });
            }}
            error={errors.addressArea}
          />

          <Input
            label="Society / building (optional)"
            placeholder="Name as on the gate"
            value={societyBuilding}
            onChangeText={setSocietyBuilding}
          />

          <Input
            label="Flat / unit (optional)"
            placeholder="e.g. Tower B, 1204"
            value={flatUnit}
            onChangeText={setFlatUnit}
          />

          <Input
            label="Gate or entry notes (optional)"
            placeholder="Anything the team should know at entry"
            value={gateNotes}
            onChangeText={setGateNotes}
          />

          <Input
            label="Business name (optional)"
            placeholder="e.g. Acme Consultancy"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <View style={styles.buttonWrapper}>
            <Button
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 160,
  },
  contentContainer: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  locationChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorAlert: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  errorAlertText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 16,
  },
});
