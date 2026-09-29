import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface LogoMarkProps {
  size?: number;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 48 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.24 }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size, borderRadius: size * 0.24 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
});
