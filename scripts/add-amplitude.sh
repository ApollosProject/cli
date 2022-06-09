AMPLITUDE_KEY=$1
ENCRYPTION_KEY=$2
npx @apollosproject/apollos-cli secrets -d "$ENCRYPTION_KEY"
echo "
AMPLITUDE_API_KEY=$AMPLITUDE_KEY" >>.env.shared
npx @apollosproject/apollos-cli secrets -e "$ENCRYPTION_KEY"
yarn add @amplitude/react-native
echo "import { Amplitude } from '@amplitude/react-native';
import ApollosConfig from '@apollosproject/config';
const amplitude = Amplitude.getInstance();
amplitude.init(ApollosConfig.AMPLITUDE_API_KEY);" |
  cat - src/Providers.js >temp && mv temp src/Providers.js
sed -i "" "s/<AnalyticsProvider>/<AnalyticsProvider trackFunctions={[ ({ eventName, properties }) => amplitude.logEvent(eventName, properties), ]}>/" src/Providers.js
yarn eslint src/Providers.js --fix
