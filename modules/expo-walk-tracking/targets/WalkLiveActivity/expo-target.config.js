/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'WalkLiveActivity',
  displayName: 'Walk Live Activity',
  bundleIdentifier: '.walkliveactivity',
  deploymentTarget: '16.2',
  frameworks: ['SwiftUI', 'WidgetKit', 'ActivityKit', 'AppIntents'],
  entitlements: {
    'com.apple.security.application-groups': [
      'group.com.annieworks.AnnieWalkingLog.walk',
    ],
  },
});
