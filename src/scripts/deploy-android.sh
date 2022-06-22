TRACK=$1
OFFSET=$2
SCRIPTS_DIR=$3

if [ -n "$(git status --porcelain)" ]; then
  echo "Git status not clean!"
  git status --porcelain
  exit 1
fi

if [ -z "$(git rev-list --tags)" ]; then
  echo "Must have at least one git tag for the changelog!"
  exit 1
fi

if ! grep -q KEYSTORE_FILE .env; then
  echo "Apollos Android deployments not setup correctly!"
  exit 1
fi

if ! grep -q GOOGLE_MAPS_API_KEY .env; then
  if [ -z "$APOLLOS_API_KEY" ] || [ -z "$CHURCH" ]; then
    echo "Must have APOLLOS_API_KEY and CHURCH in the environment"
    exit 1
  fi
  GOOGLE_MAPS_API_KEY=$("$SCRIPTS_DIR/get-config.sh" "$APOLLOS_API_KEY" "$CHURCH/APP_GOOGLE_MAPS_API_KEY" |
    grep value |
    sed -E "s/.*\"value\":\"(.*)\"}/\1/")
  if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    "$SCRIPTS_DIR/get-config.sh" "$APOLLOS_API_KEY" "$CHURCH/APP_GOOGLE_MAPS_API_KEY"
    echo "Couldn't get APP_GOOGLE_MAPS_API_KEY from config"
    exit 1
  fi
  sed i "" "s/GOOGLE_MAPS_API_KEY=.*//g" .env
  echo "
  GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY" >>.env
  export GOOGLE_MAPS_API_KEY="XXX"
fi

COMMITS=$(git rev-list --count HEAD)
VERSION_CODE=$((COMMITS + OFFSET))
sed -i "" -E "s/versionCode [0-9]+\s*$/versionCode $VERSION_CODE/g" android/app/build.gradle

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

# TODO fix, this is only showing the most recent commit
# and we don't want the git commit making it to production
#fastlane run changelog_from_git_commits quiet:true |
#grep Result |
#sed -E "s/.*Result: (.*)/\1/" >"fastlane/metadata/android/en-US/changelogs/$COMMITS.txt"

if [ "$TRACK" = "internal" ]; then
  fastlane run gradle task:clean project_dir:android
  GOOGLE_MAPS_API_KEY="XXX" fastlane run gradle task:bundle build_type:Release project_dir:android
  exit 1
  fastlane run supply \
    track:"$TRACK" \
    version_code:"$VERSION_CODE" \
    skip_upload_apk:true \
    skip_upload_metadata:true \
    skip_upload_images:true \
    skip_upload_screenshots:true \
    aab:android/app/build/outputs/bundle/release/app-release.aab \
    json_key:fastlane/google-api-key.json \
    package_name:"$PACKAGE"
else
  fastlane run supply \
    track:internal \
    track_promote_to:"$TRACK" \
    version_code:"$VERSION_CODE" \
    skip_upload_apk:true \
    skip_upload_aab:true \
    skip_upload_metadata:true \
    skip_upload_images:true \
    skip_upload_screenshots:true \
    json_key:fastlane/google-api-key.json \
    package_name:"$PACKAGE"
fi
