import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LogoMarkProps {
  size?: number;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 48 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <MaterialCommunityIcons name="layers-triple" size={size * 0.55} color="#5eead4" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d3830', // Deep dark teal squircle
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
