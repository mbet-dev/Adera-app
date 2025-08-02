import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { CustomerNavigator, PartnerNavigator, DriverNavigator, AdminNavigator } from './RoleNavigators';
import { GuestNavigator } from './GuestNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import { RootStackParamList } from '../types/navigation';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  console.log('[AppNavigator] State:', { isAuthenticated, userRole, isLoading });

  useEffect(() => {
    console.log('[AppNavigator] Auth state changed:', {
      isAuthenticated,
      userRole,
      isLoading
    });
  }, [isAuthenticated, userRole, isLoading]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Render the appropriate navigator based on user role
  const renderAuthenticatedStack = () => {
    const role = userRole?.toUpperCase();
    console.log(`[AppNavigator] Rendering authenticated stack. Role from context: '${userRole}', Uppercased role for switch: '${role}'`);
    
    switch (role) {
      case 'CUSTOMER':
        return <Stack.Screen name="CustomerMainTabs" component={CustomerNavigator} />;
      case 'PARTNER':
        return <Stack.Screen name="PartnerTabs" component={PartnerNavigator} />;
      case 'DRIVER':
        return <Stack.Screen name="DriverTabs" component={DriverNavigator} />;
      case 'ADMIN':
        return <Stack.Screen name="AdminTabs" component={AdminNavigator} />;
      default:
        console.warn(`[AppNavigator] Role '${role}' not matched in switch. Defaulting to Customer view as a fallback.`);
        return <Stack.Screen name="CustomerMainTabs" component={CustomerNavigator} />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }} 
        initialRouteName={isAuthenticated ? undefined : "Auth"}
      >
        {!isAuthenticated ? (
          // Unauthenticated screens
          <>
            <Stack.Screen 
              name="Auth" 
              children={(props) => (
                <LoginScreen
                  {...props}
                  onSignupPress={() => props.navigation.navigate('Register')}
                  onForgotPasswordPress={() => props.navigation.navigate('ForgotPassword')}
                  onGuestBrowsePress={() => props.navigation.navigate('GuestTabs')}
                />
              )}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen 
              name="ForgotPassword" 
              children={(props) => (
                <ForgotPasswordScreen
                  {...props}
                  onLoginPress={() => props.navigation.navigate('Auth')}
                />
              )}
            />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="GuestTabs" component={GuestNavigator} />
          </>
        ) : (
          // Authenticated navigators
          renderAuthenticatedStack()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 