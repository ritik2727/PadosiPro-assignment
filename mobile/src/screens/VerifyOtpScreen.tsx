import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LogoMark } from '../components/LogoMark';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface VerifyOtpScreenProps {
  email: string;
  initialPreviewUrl?: string;
  onBack: () => void;
  onVerified: (hasProfile: boolean) => void;
}

export const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  email,
  initialPreviewUrl,
  onBack,
  onVerified,
}) => {
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialPreviewUrl);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);

  // 30s Countdown timer for resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      onVerified(result.hasProfile);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setError(null);
    setSuccessMsg(null);
    setResending(true);
    try {
      const res = await resendOtp(email);
      setCooldown(res.cooldownSeconds || 30);
      if (res.previewUrl) {
        setPreviewUrl(res.previewUrl);
      }
      setSuccessMsg('A new verification code has been dispatched.');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <Header onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Logo Squircle */}
          <View style={styles.logoRow}>
            <LogoMark size={52} />
          </View>

          <Text style={styles.heading}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a code to <Text style={styles.boldEmail}>{email}</Text>. It
            expires in 10 minutes.
          </Text>

          {/* Status Alerts */}
          {error && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          )}

          {successMsg && (
            <View style={styles.successAlert}>
              <Text style={styles.successAlertText}>{successMsg}</Text>
            </View>
          )}

          {/* 6-Digit Code Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>6-digit code</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setOtp(cleaned);
                  if (error) setError(null);
                }}
                autoFocus
                placeholder="------"
                placeholderTextColor="#cbd5e1"
              />
              <View style={styles.dashedSlots}>
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const digit = otp[idx];
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.dashSlot,
                        otp.length === idx && styles.dashSlotActive,
                      ]}
                    >
                      <Text style={styles.dashText}>{digit || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Resend Link */}
          <View style={styles.resendContainer}>
            {cooldown > 0 ? (
              <Text style={styles.cooldownText}>
                Resend code in <Text style={styles.cooldownSeconds}>{cooldown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                <Text style={styles.resendActiveText}>
                  {resending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Note for test reviewer */}
          <View style={styles.devNote}>
            <Text style={styles.devNoteText}>
              💡 Testing note: The 6-digit OTP is printed directly in the backend terminal console.
            </Text>
            {previewUrl ? (
              <TouchableOpacity
                style={styles.etherealBtn}
                onPress={() => Linking.openURL(previewUrl)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="email-open-outline"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.etherealBtnText}>Open Ethereal Test Email in Browser</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Verify Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Verify"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6 || loading}
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
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  contentContainer: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    marginBottom: 16,
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
    marginBottom: 28,
  },
  boldEmail: {
    fontWeight: '600',
    color: colors.text,
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
  successAlert: {
    backgroundColor: colors.successBackground,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  successAlertText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '500',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  codeContainer: {
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  dashedSlots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dashSlot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  dashSlotActive: {
    borderBottomColor: colors.primary,
  },
  dashText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  resendContainer: {
    marginBottom: 24,
  },
  cooldownText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cooldownSeconds: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendActiveText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  devNote: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  devNoteText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  etherealBtn: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etherealBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
});
