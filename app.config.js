// Expo は .env を自動読み込みします
const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY?.trim() || undefined;
  const googleMapsApiKeyAndroid = process.env.GOOGLE_MAPS_API_KEY_Android?.trim() || undefined;
  const googleMapsApiKeyIos = process.env.GOOGLE_MAPS_API_KEY_iOS?.trim() || undefined;

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

  return {
    expo: {
      ...appJson.expo,
      android: {
        ...appJson.expo.android,
        config: {
          ...appJson.expo.android?.config,
          googleMaps: {
            apiKey: googleMapsApiKeyAndroid,
          },
        },
      },
      ios: {
        ...appJson.expo.ios,
        config: {
          ...appJson.expo.ios?.config,
          googleMapsApiKey: googleMapsApiKeyIos,
        },
      },
      extra: {
        ...appJson.expo.extra,
        openWeatherApiKey,
        googleMapsApiKeyAndroid,
        googleMapsApiKeyIos,
        eas: {
          ...appJson.expo.extra?.eas,
          build: {
            ...appJson.expo.extra?.eas?.build,
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
    },
  };
};
