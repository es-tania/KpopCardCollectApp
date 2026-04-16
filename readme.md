# APK de test (le plus rapide)

eas build --platform android --profile preview

En local :
npx expo prebuild --platform android
cd android
gradlew assembleRelease
