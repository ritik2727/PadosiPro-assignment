import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { LogoMark } from '../components/LogoMark';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onNavigateToOtp: (email: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToHome: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onNavigateToOtp,
  onNavigateToProfile,
  onNavigateToHome,
}) => {
  const { register, login, setPendingEmail } = useAuth();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (mobileNumber && !/^[6-9]\d{9}$/.test(mobileNumber.replace(/[^\d]/g, ''))) {
        newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email.trim(), password);
        setPendingEmail(email.trim());
        onNavigateToOtp(email.trim());
      } else {
        const result = await login(email.trim(), password);
        if (result.hasProfile) {
          onNavigateToHome();
        } else {
          onNavigateToProfile();
        }
      }
    } catch (err: any) {
      if (err.code === 'UNVERIFIED_EMAIL') {
        setPendingEmail(email.trim());
        onNavigateToOtp(email.trim());
      } else {
        setServerError(err.message || 'Authentication failed. Please try again.');
      }
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
      >
        <View style={styles.contentContainer}>
          {/* Logo Squircle */}
          <View style={styles.logoRow}>
            <LogoMark size={52} />
          </View>

          <Text style={styles.brandSub}>PadosiPro</Text>
          <Text style={styles.heading}>
            {mode === 'register' ? 'Welcome' : 'Welcome back'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'register'
              ? "Enter your mobile number and email. We'll send the OTP to your email."
              : 'Enter your email and password to log in.'}
          </Text>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
              onPress={() => {
                setMode('register');
                setServerError(null);
                setErrors({});
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'register' && styles.tabTextActive,
                ]}
              >
                New User (Register)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
              onPress={() => {
                setMode('login');
                setServerError(null);
                setErrors({});
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Server Error Alert */}
          {serverError ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          {mode === 'register' && (
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
          )}

          <Input
            label="Email"
            placeholder="you@example.com"
            iconName="email-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter at least 6 characters"
            iconName="lock-outline"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
          />

          {mode === 'register' && (
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              iconName="lock-check-outline"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button
              title={mode === 'register' ? 'Get OTP' : 'Sign In'}
              onPress={handleSubmit}
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
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  contentContainer: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    marginBottom: 12,
  },
  brandSub: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  buttonContainer: {
    marginTop: 12,
  },
});
