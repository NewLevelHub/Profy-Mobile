import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { getProfile } from '../api/profile';
import {
  RootStackParamList,
  AuthStackParamList,
  AppStackParamList,
  AppTabParamList,
} from '../types';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyResetCodeScreen from '../screens/VerifyResetCodeScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import ArtifactsSetupScreen from '../screens/onboarding/ArtifactsSetupScreen';
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import PraiseScreen from '../screens/PraiseScreen';
import ResultLoadingScreen from '../screens/ResultLoadingScreen';
import ResultScreen from '../screens/ResultScreen';
import DirectionDetailScreen from '../screens/DirectionDetailScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import UniversityListScreen from '../screens/UniversityListScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import GapAnalysisScreen from '../screens/GapAnalysisScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import { colors, fontFamily, fontSize } from '../constants/themes/themes';
import HomeSVG from '../../assets/home.svg';
import ResultsSVG from '../../assets/results.svg';
import StrategySVG from '../../assets/strategy.svg';
import ProfileSVG from '../../assets/Profile.svg';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

function TabIcon({ Icon, focused }: { Icon: React.FC<{ width: number; height: number; fill?: string; stroke?: string }>; focused: boolean }) {
  const iconColor = focused ? colors.primary : colors.textMuted;
  return <Icon width={24} height={24} fill={iconColor} stroke={iconColor} />;
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: focused ? fontFamily.extrabold : fontFamily.semibold,
        fontSize: fontSize.tiny,
        color: focused ? colors.primary : colors.textMuted,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={HomeSVG} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Главная" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Result"
        component={ResultScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={ResultsSVG} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Результаты" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Roadmap"
        component={RoadmapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={StrategySVG} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Роадмап" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={ProfileSVG} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Профиль" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const logout = useAuthStore((s) => s.logout);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setInitialRoute('MainTabs');
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          logout();
          resetAssessment();
          clearProfile();
          return;
        }
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
      <AppStack.Screen name="ResultLoading" component={ResultLoadingScreen} />
      <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
      <AppStack.Screen name="DirectionDetail" component={DirectionDetailScreen} />
      <AppStack.Screen name="UniversityList" component={UniversityListScreen} />
      <AppStack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
      <AppStack.Screen name="GapAnalysis" component={GapAnalysisScreen} />
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
