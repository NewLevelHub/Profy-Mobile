import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/constants/themes/themes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular: require('./src/assets/fonts/Nunito-Regular.ttf'),
    Nunito_500Medium: require('./src/assets/fonts/Nunito-Medium.ttf'),
    Nunito_600SemiBold: require('./src/assets/fonts/Nunito-SemiBold.ttf'),
    Nunito_700Bold: require('./src/assets/fonts/Nunito-Bold.ttf'),
    Nunito_800ExtraBold: require('./src/assets/fonts/Nunito-ExtraBold.ttf'),
    Nunito_900Black: require('./src/assets/fonts/Nunito-Black.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
