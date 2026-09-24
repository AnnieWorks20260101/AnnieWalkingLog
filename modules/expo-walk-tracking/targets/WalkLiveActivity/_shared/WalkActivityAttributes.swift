import ActivityKit
import Foundation

struct WalkActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var title: String
    var body: String
    var poopCount: Int
    var customCount: Int
    var activePetLabel: String
  }

  var poopLabel: String
  var customLabel: String
  var customIcon: String
  /// Hex color for lock-screen / Live Activity text, e.g. #FFFFFF
  var textColorHex: String
}
