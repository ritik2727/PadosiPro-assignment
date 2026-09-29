import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';

interface RequestSubmittedScreenProps {
  lmName?: string;
  onBackToHome: () => void;
}

export const RequestSubmittedScreen: React.FC<RequestSubmittedScreenProps> = ({
  lmName = 'Pilot LM',
  onBackToHome,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        {/* Mint Circle Checkmark */}
        <View style={styles.checkCircle}>
          <MaterialCommunityIcons name="check" size={28} color={colors.primary} />
        </View>

        <Text style={styles.heading}>We're on it</Text>
        <Text style={styles.subtitle}>
          {lmName} has your request and will handle the rest. You'll see updates on your home screen.
        </Text>

        <View style={styles.buttonWrapper}>
          <Button title="Back to home" onPress={onBackToHome} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentWrap: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f7f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 36,
  },
  buttonWrapper: {
    width: '100%',
  },
});
