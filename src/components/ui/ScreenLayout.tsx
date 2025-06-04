import React from 'react';
import { SafeAreaView, View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noHorizontalPadding?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  style,
  noHorizontalPadding = false,
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.text === '#000000' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.container,
          !noHorizontalPadding && styles.horizontalPadding,
          { backgroundColor: colors.background },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // Add extra top padding for Android to avoid notch overlap
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  horizontalPadding: {
    paddingHorizontal: 16,
  },
}); 