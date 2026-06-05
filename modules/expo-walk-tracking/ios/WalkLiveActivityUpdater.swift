import ActivityKit
import Foundation

enum WalkLiveActivityUpdater {
  @available(iOS 16.2, *)
  static func refreshCounts() async {
    let snapshot = WalkSessionStorage.getSnapshot()
    let activities = Activity<WalkActivityAttributes>.activities

    for activity in activities {
      let current = activity.content.state
      let updated = WalkActivityAttributes.ContentState(
        title: current.title,
        body: current.body,
        poopCount: snapshot.poops.count,
        customCount: snapshot.customMarks.count
      )
      await activity.update(ActivityContent(state: updated, staleDate: nil))
    }
  }
}
