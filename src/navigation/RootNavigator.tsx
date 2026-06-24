import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { getProfile } from '../api/profile';
import { RootStackParamList, AuthStackParamList, AppStackParamList } from '../types';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import ArtifactsSetupScreen from '../screens/onboarding/ArtifactsSetupScreen';
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import PraiseScreen from '../screens/PraiseScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { colors } from '../constants/themes/themes';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setInitialRoute('Home');
      })
      .catch(() => {
        clearProfile();
        setInitialRoute('Welcome');
      });
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AppStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <AppStack.Screen name="Welcome" component={WelcomeScreen} />
      <AppStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <AppStack.Screen name="ArtifactsSetup" component={ArtifactsSetupScreen} />
      <AppStack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <AppStack.Screen name="Assessment" component={AssessmentScreen} />
      <AppStack.Screen name="Praise" component={PraiseScreen} />
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const token = useAuthStore((s) => s.token);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        {token ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
