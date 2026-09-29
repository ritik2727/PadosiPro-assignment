import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { LogoMark } from '../components/LogoMark';

export const SplashScreen: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <LogoMark size={72} />
      </View>
      <Text style={styles.brandTitle}>PadosiPro</Text>
      <Text style={styles.tagline}>You don't manage tasks — we do.</Text>

      {/* Mint animated spinner */}
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 36,
  },
  spinnerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    borderTopColor: '#5eead4',
    borderRightColor: colors.primary,
  },
});
