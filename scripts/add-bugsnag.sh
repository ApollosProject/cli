KEY=$1

# npx @bugsnag/react-native-cli init would be better for all of this
# we can't because it has prompts
TARGET=$(grep "target" ios/Podfile | sed -n 1p | sed -E "s/target '(.*)'.*/\1/")
# npx @bugsnag/react-native-cli install would be better
yarn add @bugsnag/react-native
sed -i "" "s/^apply from: \"\.\.\/\.\.\/node_modules\/react-native\/react\.gradle\"/apply from: \"..\/..\/node_modules\/react-native\/react.gradle\"\napply plugin: \"com.bugsnag.android.gradle\"/g" android/app/build.gradle
sed -E -i "" "s/classpath(.*)/classpath\1\nclasspath\(\"com.bugsnag:bugsnag-android-gradle-plugin:5.+\"\)/g" android/build.gradle
# we can use a shortcut for this part
echo "y" | npx @bugsnag/react-native-cli insert
# npx @bugsnag/react-native-cli configure would be better
sed -i "" "s/<\/application>/<meta-data android:name=\"com.bugsnag.android.API_KEY\" android:value=\"$KEY\" \/>\n<\/application>/g" android/app/src/main/AndroidManifest.xml
LINE=$(grep -n "/plist" ios/Newspring/Info.plist | sed "s/:.*//")
sed -E -i "" "$((LINE - 1))s/.*/<key>bugsnag<\/key><dict><key>apiKey<\/key><string>$KEY<\/string><\/dict><\/dict>/g" "ios/$TARGET/Info.plist"

yarn eslint index.js --fix
