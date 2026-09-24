import ActivityKit
import Foundation

enum WalkLiveActivityUpdater {
  @available(iOS 16.2, *)
  static func refreshCounts() async {
    let poops = WalkSessionStorage.readPoopsCountForActivePet()
    let customs = WalkSessionStorage.readCustomMarksCountForActivePet()
    let activePetLabel = WalkSessionStorage.activePetDisplayLabel()
    let activities = Activity<WalkActivityAttributes>.activities

    for activity in activities {
      let current = activity.content.state
      let updated = WalkActivityAttributes.ContentState(
        title: current.title,
        body: current.body,
        poopCount: poops,
        customCount: customs,
        activePetLabel: activePetLabel
      )
      await activity.update(ActivityContent(state: updated, staleDate: nil))
    }
  }
}
