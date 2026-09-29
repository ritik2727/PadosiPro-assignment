import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.secondaryContainer, style];
      case 'outline':
        return [styles.outlineContainer, style];
      case 'subtle':
        return [styles.subtleContainer, style];
      default:
        return [
          styles.primaryContainer,
          disabled && styles.disabledContainer,
          style,
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.secondaryText, textStyle];
      case 'outline':
        return [styles.outlineText, textStyle];
      case 'subtle':
        return [styles.subtleText, textStyle];
      default:
        return [
          styles.primaryText,
          disabled && styles.disabledText,
          textStyle,
        ];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.baseButton, ...getContainerStyle()]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : colors.primary}
        />
      ) : (
        <Text style={[styles.baseText, ...getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  disabledContainer: {
    backgroundColor: colors.primaryDisabled,
  },
  primaryText: {
    color: '#ffffff',
  },
  disabledText: {
    color: '#ffffff',
    opacity: 0.9,
  },
  secondaryContainer: {
    backgroundColor: colors.primaryLight,
  },
  secondaryText: {
    color: colors.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderDark,
  },
  outlineText: {
    color: colors.textSecondary,
  },
  subtleContainer: {
    backgroundColor: 'transparent',
    height: 40,
  },
  subtleText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});
