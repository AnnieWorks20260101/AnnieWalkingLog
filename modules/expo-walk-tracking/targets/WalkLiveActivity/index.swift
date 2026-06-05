import SwiftUI
import WidgetKit

@main
struct WalkLiveActivityBundle: WidgetBundle {
  var body: some Widget {
    if #available(iOS 16.2, *) {
      WalkLiveActivityWidget()
    }
  }
}
