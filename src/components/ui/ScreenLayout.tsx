import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView 
      style={[
        styles.safe, 
        { 
          backgroundColor: colors.background,
        }
      ]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={colors.text === '#000000' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
        translucent={false}
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
  },
  container: {
    flex: 1,
  },
  horizontalPadding: {
    paddingHorizontal: 16,
  },
});
