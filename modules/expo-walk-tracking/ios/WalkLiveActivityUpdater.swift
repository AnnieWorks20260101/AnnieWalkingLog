import ActivityKit
import Foundation

enum WalkLiveActivityUpdater {
  @available(iOS 16.2, *)
  static func refreshCounts() async {
    let activePetLabel = WalkSessionStorage.activePetDisplayLabel()
    let poopCount = WalkSessionStorage.readPoopsCountForActivePet()
    let customCount = WalkSessionStorage.readCustomMarksCountForActivePet()
    let activities = Activity<WalkActivityAttributes>.activities

    for activity in activities {
      let current = activity.content.state
      let updated = WalkActivityAttributes.ContentState(
        title: current.title,
        body: current.body,
        poopCount: poopCount,
        customCount: customCount,
        activePetLabel: activePetLabel
      )
      await activity.update(ActivityContent(state: updated, staleDate: nil))
    }
  }
}
