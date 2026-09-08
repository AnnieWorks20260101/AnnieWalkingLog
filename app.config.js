// Expo は .env を自動読み込みします
// app.json の値は ConfigContext 経由で config として渡されます
const { GOOGLE_WEB_CLIENT_ID: DEFAULT_GOOGLE_WEB_CLIENT_ID } = require('./src/constants/googleAuth');

/** @type {(ctx: import('expo/config').ConfigContext) => import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY?.trim() || undefined;
  const googleMapsApiKeyAndroid = process.env.GOOGLE_MAPS_API_KEY_Android?.trim() || undefined;
  const googleMapsApiKeyIos = process.env.GOOGLE_MAPS_API_KEY_iOS?.trim() || undefined;

  const googleWebClientId =
    process.env.GOOGLE_WEB_CLIENT_ID?.trim() || DEFAULT_GOOGLE_WEB_CLIENT_ID;

  if (!openWeatherApiKey) {
    console.warn(
      '[app.config] OPENWEATHER_API_KEY が未設定です。.env.example を .env にコピーしてキーを設定してください。'
    );
  }
  if (!googleMapsApiKeyAndroid) {
    console.warn(
      '[app.config] GOOGLE_MAPS_API_KEY_Android が未設定です。Android の地図表示に必要です（.env.example を参照）。'
    );
  }
  if (!googleMapsApiKeyIos) {
    console.warn(
      '[app.config] GOOGLE_MAPS_API_KEY_iOS が未設定です。iOS の地図表示に必要です（.env.example を参照）。'
    );
  }

  if (!process.env.GOOGLE_WEB_CLIENT_ID?.trim()) {
    console.warn(
      '[app.config] GOOGLE_WEB_CLIENT_ID が未設定のため、google-services.json と同じ既定値を使います。'
    );
  }

  const revenueCatApiKeyIos = process.env.REVENUECAT_API_KEY_IOS?.trim() || undefined;
  const revenueCatApiKeyAndroid = process.env.REVENUECAT_API_KEY_ANDROID?.trim() || undefined;

  if (!revenueCatApiKeyIos) {
    console.warn(
      '[app.config] REVENUECAT_API_KEY_IOS が未設定です。RevenueCat iOS 課金に必要です（.env.example を参照）。'
    );
  }
  if (!revenueCatApiKeyAndroid) {
    console.warn(
      '[app.config] REVENUECAT_API_KEY_ANDROID が未設定です。RevenueCat Android 課金に必要です（.env.example を参照）。'
    );
  }

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKeyAndroid,
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: googleMapsApiKeyIos,
      },
    },
    extra: {
      ...config.extra,
      openWeatherApiKey,
      googleMapsApiKeyAndroid,
      googleMapsApiKeyIos,
      googleWebClientId,
      revenueCatApiKeyIos,
      revenueCatApiKeyAndroid,
      eas: {
        ...config.extra?.eas,
        build: {
          ...config.extra?.eas?.build,
          experimental: {
            ios: {
              appExtensions: [
                {
                  targetName: 'WalkLiveActivity',
                  bundleIdentifier:
                    'com.annieworks.AnnieWalkingLog.walkliveactivity',
                  entitlements: {
                    'com.apple.security.application-groups': [
                      'group.com.annieworks.AnnieWalkingLog.walk',
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
  };
};
