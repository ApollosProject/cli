TRACK=$1

if [ -n "$(git status --porcelain)" ]; then
  echo "Git status not clean!"
  git status --porcelain
  exit 1
fi

if [ -z "$(git rev-list --tags)" ]; then
  echo "Must have at least one git tag for the changelog!"
  exit 1
fi

COMMITS=$(git rev-list --count HEAD)
sed -i "" -E "s/versionCode [0-9]+\s*$/versionCode $COMMITS/g" android/app/build.gradle
fastlane run gradle task:clean project_dir:android
fastlane run gradle task:bundle build_type:Release project_dir:android

PACKAGE=$(grep applicationId android/app/build.gradle | sed -E "s/.*applicationId[[:space:]]+\"(.*)\".*/\1/")

# initialize metadata
if [ ! -d "fastlane/metadata/android" ]; then
  fastlane supply init \
    --json_key "fastlane/google-api-key.json" \
    --package_name "$PACKAGE"
fi

# supply needs a default changelog
if [ ! -d "fastlane/metadata/android/en-US/changelogs" ]; then
  mkdir fastlane/metadata/android/en-US/changelogs
  echo "bug fixes and performance improvements" >fastlane/metadata/android/en-US/changelogs/default.txt
fi

# TODO fix this
# it currently doesn't output to any changelog file
# fastlane run changelog_from_git_commits

if [ "$TRACK" = "internal" ]; then
  fastlane run supply \
    track:$TRACK \
    version_code:$COMMITS \
    skip_upload_apk:true \
    aab:android/app/build/outputs/bundle/release/app-release.aab \
    json_key:fastlane/google-api-key.json \
    package_name:$PACKAGE
else
  fastlane run supply \
    track:internal \
    track_promote_to:$TRACK \
    version_code:$COMMITS \
    skip_upload_apk:true \
    skip_upload_aab:true \
    json_key:fastlane/google-api-key.json \
    package_name:$PACKAGE
fi
