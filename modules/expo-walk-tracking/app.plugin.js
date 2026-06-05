const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  AndroidConfig,
  withInfoPlist,
  withPodfileProperties,
} = require('@expo/config-plugins');
const withAppleTargets = require('@bacons/apple-targets/app.plugin');

const SERVICE_CLASS = 'expo.modules.walktracking.WalkTrackingForegroundService';
const RECEIVER_CLASS = 'expo.modules.walktracking.WalkActionReceiver';
const APPLE_TARGETS_ROOT = path.join(__dirname, 'targets');
const WALK_LIVE_ACTIVITY_TARGET = 'WalkLiveActivity';

function hasWalkLiveActivityTarget(projectRoot) {
  const pbxprojPath = path.join(
    projectRoot,
    'ios',
    'AnnieWalkingLog.xcodeproj',
    'project.pbxproj'
  );
  if (!fs.existsSync(pbxprojPath)) {
    return false;
  }

  const pbxproj = fs.readFileSync(pbxprojPath, 'utf8');
  return (
    pbxproj.includes(`name = ${WALK_LIVE_ACTIVITY_TARGET};`) &&
    pbxproj.includes('PBXNativeTarget')
  );
}

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

const EXPO_WALK_TRACKING_POD = "pod 'ExpoWalkTracking', :path => '../modules/expo-walk-tracking/ios'";
const IOS_DEPLOYMENT_TARGET = '16.2';

/** @type {import('@expo/config-plugins').ConfigPlugin} */
function withIosDeploymentTarget(config) {
  const { withDangerousMod } = require('@expo/config-plugins');

  return withDangerousMod(config, [
    'ios',
    async (configWithDangerousMod) => {
      const pbxprojPath = path.join(
        configWithDangerousMod.modRequest.platformProjectRoot,
        'AnnieWalkingLog.xcodeproj',
        'project.pbxproj'
      );
      if (!fs.existsSync(pbxprojPath)) {
        return configWithDangerousMod;
      }

      const pbxproj = fs.readFileSync(pbxprojPath, 'utf8');
      const updated = pbxproj.replace(
        /IPHONEOS_DEPLOYMENT_TARGET = [\d.]+;/g,
        `IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET};`
      );
      if (updated !== pbxproj) {
        fs.writeFileSync(pbxprojPath, updated);
      }

      return configWithDangerousMod;
    },
  ]);
}

function injectExpoWalkTrackingPod(podfile) {
  const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

  if (podfile.includes(EXPO_WALK_TRACKING_POD)) {
    return podfile;
  }

  return mergeContents({
    tag: 'expo-walk-tracking-pod',
    src: podfile,
    newSrc: `  ${EXPO_WALK_TRACKING_POD}`,
    anchor: /use_expo_modules!/,
    offset: 1,
    comment: '#',
  }).contents;
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
function withExpoWalkTrackingPod(config) {
  const { withPodfile, withDangerousMod } = require('@expo/config-plugins');

  config = withPodfile(config, (configWithPodfile) => {
    const podfile = configWithPodfile.modResults;
    if (typeof podfile !== 'string') {
      return configWithPodfile;
    }

    configWithPodfile.modResults = injectExpoWalkTrackingPod(podfile);
    return configWithPodfile;
  });

  return withDangerousMod(config, [
    'ios',
    async (configWithDangerousMod) => {
      const podfilePath = path.join(
        configWithDangerousMod.modRequest.platformProjectRoot,
        'Podfile'
      );
      if (!fs.existsSync(podfilePath)) {
        return configWithDangerousMod;
      }

      const podfile = fs.readFileSync(podfilePath, 'utf8');
      const nextPodfile = injectExpoWalkTrackingPod(podfile);
      if (nextPodfile !== podfile) {
        fs.writeFileSync(podfilePath, nextPodfile);
      }

      return configWithDangerousMod;
    },
  ]);
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withExpoWalkTracking(config) {
  config = withPodfileProperties(config, (configWithProps) => {
    configWithProps.modResults['ios.deploymentTarget'] = IOS_DEPLOYMENT_TARGET;
    return configWithProps;
  });
  config = withIosDeploymentTarget(config);
  config = withExpoWalkTrackingPod(config);
  config = withAndroidManifest(config, (configWithManifest) => {
    configWithManifest.modResults = addWalkTrackingComponents(configWithManifest.modResults);
    return configWithManifest;
  });

  config = withInfoPlist(config, (configWithPlist) => {
    configWithPlist.modResults.NSSupportsLiveActivities = true;
    return configWithPlist;
  });

  const projectRoot = config._internal?.projectRoot || process.cwd();
  if (!hasWalkLiveActivityTarget(projectRoot)) {
    config = withAppleTargets(config, {
      root: APPLE_TARGETS_ROOT,
    });
  }

  return config;
};
