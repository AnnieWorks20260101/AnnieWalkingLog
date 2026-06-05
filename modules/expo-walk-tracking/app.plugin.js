const path = require('path');
const { withAndroidManifest, AndroidConfig, withInfoPlist } = require('@expo/config-plugins');
const withAppleTargets = require('@bacons/apple-targets/app.plugin');

const SERVICE_CLASS = 'expo.modules.walktracking.WalkTrackingForegroundService';
const RECEIVER_CLASS = 'expo.modules.walktracking.WalkActionReceiver';
const APPLE_TARGETS_ROOT = path.join(__dirname, 'targets');

function addWalkTrackingComponents(androidManifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

  if (!application.service) {
    application.service = [];
  }
  if (!application.receiver) {
    application.receiver = [];
  }

  const hasService = application.service.some(
    (item) => item.$['android:name'] === SERVICE_CLASS
  );
  if (!hasService) {
    application.service.push({
      $: {
        'android:name': SERVICE_CLASS,
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'location',
      },
    });
  }

  const hasReceiver = application.receiver.some(
    (item) => item.$['android:name'] === RECEIVER_CLASS
  );
  if (!hasReceiver) {
    application.receiver.push({
      $: {
        'android:name': RECEIVER_CLASS,
        'android:enabled': 'true',
        'android:exported': 'false',
      },
    });
  }

  return androidManifest;
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withExpoWalkTracking(config) {
  config = withAndroidManifest(config, (configWithManifest) => {
    configWithManifest.modResults = addWalkTrackingComponents(configWithManifest.modResults);
    return configWithManifest;
  });

  config = withInfoPlist(config, (configWithPlist) => {
    configWithPlist.modResults.NSSupportsLiveActivities = true;
    return configWithPlist;
  });

  config = withAppleTargets(config, {
    root: APPLE_TARGETS_ROOT,
  });

  return config;
};
