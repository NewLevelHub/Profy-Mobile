import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
});

export { isErrorWithCode, statusCodes };

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    const err = Object.assign(new Error('Sign in cancelled'), {
      code: statusCodes.SIGN_IN_CANCELLED,
    });
    throw err;
  }

  const { idToken } = response.data;
  if (!idToken) throw new Error('Google Sign-In: no id_token returned');
  return idToken;
}
