import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "885239396497-se82ukv29vfmrurbh5mhtlj5j8r8n5li.apps.googleusercontent.com",
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();

  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error("لم يتم الحصول على idToken من Google");
  }

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  return auth().signInWithCredential(googleCredential);
}