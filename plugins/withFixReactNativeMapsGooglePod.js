const { withPodfile } = require('@expo/config-plugins');

/**
 * Expo's legacy Maps plugin still injects:
 *   pod 'react-native-google-maps', path: ...
 * but react-native-maps >= 1.23 removed that podspec and uses:
 *   pod 'react-native-maps/Google', :path => ...
 */
/** @type {import('@expo/config-plugins').ConfigPlugin} */
function withFixReactNativeMapsGooglePod(config) {
  return withPodfile(config, (configWithPodfile) => {
    const contents = configWithPodfile.modResults.contents;
    if (typeof contents !== 'string') {
      return configWithPodfile;
    }

    if (!contents.includes("pod 'react-native-google-maps'")) {
      return configWithPodfile;
    }

    configWithPodfile.modResults.contents = contents.replace(
      /pod 'react-native-google-maps',\s*path:\s*File\.dirname\(`node --print "require\.resolve\('react-native-maps\/package\.json'\)"`\)/g,
      [
        "rn_maps_path = File.dirname(`node --print \"require.resolve('react-native-maps/package.json')\"`)",
        "  pod 'react-native-maps/Google', :path => rn_maps_path",
      ].join('\n  ')
    );

    return configWithPodfile;
  });
}

module.exports = withFixReactNativeMapsGooglePod;
