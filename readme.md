# APK de test (le plus rapide)

npx expo prebuild --platform android
eas build --platform android --profile preview

En local :
npx expo prebuild --platform android
cd android
gradlew assembleDebug

gradlew assembleRelease
