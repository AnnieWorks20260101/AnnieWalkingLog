const fs = require('fs');
const path = require('path');
const { withPodfile, withDangerousMod } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const MODULAR_HEADER_PODS = [
  "pod 'GoogleUtilities', :modular_headers => true",
  "pod 'RecaptchaInterop', :modular_headers => true",
];

function injectGoogleModularHeaders(podfile) {
  if (MODULAR_HEADER_PODS.every((line) => podfile.includes(line))) {
    return podfile;
  }

  return mergeContents({
    tag: 'google-modular-headers',
    src: podfile,
    newSrc: MODULAR_HEADER_PODS.map((line) => `  ${line}`).join('\n'),
    anchor: /use_expo_modules!/,
    offset: 1,
    comment: '#',
  }).contents;
}

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withGoogleModularHeaders(config) {
  config = withPodfile(config, (configWithPodfile) => {
    const podfile = configWithPodfile.modResults;
    if (typeof podfile !== 'string') {
      return configWithPodfile;
    }

    configWithPodfile.modResults = injectGoogleModularHeaders(podfile);
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
      const nextPodfile = injectGoogleModularHeaders(podfile);
      if (nextPodfile !== podfile) {
        fs.writeFileSync(podfilePath, nextPodfile);
      }

      return configWithDangerousMod;
    },
  ]);
};
