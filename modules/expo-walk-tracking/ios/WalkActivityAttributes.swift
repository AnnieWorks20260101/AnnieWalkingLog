import ActivityKit
import Foundation

struct WalkActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var title: String
    var body: String
    var poopCount: Int
    var customCount: Int
  }

  var poopLabel: String
  var customLabel: String
  var customIcon: String
}
