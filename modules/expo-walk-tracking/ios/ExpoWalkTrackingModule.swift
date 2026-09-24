import ExpoModulesCore
import ActivityKit
import CoreLocation

struct WalkTrackingStartOptions: Record {
  @Field var title: String = "Walking"
  @Field var body: String = "🐾"
  @Field var poopLabel: String = "💩"
  @Field var customLabel: String = "Custom"
  @Field var customButtonId: String = "pee"
  @Field var customIcon: String = "💦"
  @Field var textColorHex: String = "#FFFFFF"
  @Field var activePetId: String = ""
  @Field var walkPetsJson: String = "[]"
  @Field var activePetLabelPrefix: String = ""
  @Field var distanceIntervalMeters: Double = 5
}

public class ExpoWalkTrackingModule: Module {
  private var currentActivity: Activity<WalkActivityAttributes>?

  public func definition() -> ModuleDefinition {
    Name("ExpoWalkTracking")

    AsyncFunction("startWalkTracking") { (options: WalkTrackingStartOptions) in
      guard #available(iOS 16.2, *) else {
        return
      }

      WalkSessionStorage.beginSession(
        customButtonId: options.customButtonId,
        customIcon: options.customIcon,
        activePetId: options.activePetId,
        walkPetsJson: options.walkPetsJson,
        activePetLabelPrefix: options.activePetLabelPrefix
      )

      let attributes = WalkActivityAttributes(
        poopLabel: options.poopLabel,
        customLabel: options.customLabel,
        customIcon: options.customIcon,
        textColorHex: options.textColorHex
      )
      let state = WalkActivityAttributes.ContentState(
        title: options.title,
        body: options.body,
        poopCount: 0,
        customCount: 0,
        activePetLabel: WalkSessionStorage.activePetDisplayLabel()
      )

      if ActivityAuthorizationInfo().areActivitiesEnabled {
        do {
          let activity = try Activity.request(
            attributes: attributes,
            content: .init(state: state, staleDate: nil),
            pushType: nil
          )
          self.currentActivity = activity
        } catch {
          NSLog("ExpoWalkTracking: Live Activity request failed: \(error.localizedDescription)")
        }
      }
    }

    AsyncFunction("stopWalkTracking") { () -> [String: Any] in
      if #available(iOS 16.2, *) {
        let finalState = self.currentActivity?.content.state
        await self.currentActivity?.end(
          ActivityContent(
            state: finalState ?? WalkActivityAttributes.ContentState(
              title: "",
              body: "",
              poopCount: 0,
              customCount: 0,
              activePetLabel: ""
            ),
            staleDate: nil
          ),
          dismissalPolicy: .immediate
        )
        self.currentActivity = nil
      }

      let snapshot = WalkSessionStorage.getSnapshot()
      WalkSessionStorage.endSession()
      let payload = Self.snapshotToDictionary(snapshot)
      WalkSessionStorage.clearSession()
      return payload
    }

    AsyncFunction("getWalkSessionSnapshot") { () -> [String: Any] in
      Self.snapshotToDictionary(WalkSessionStorage.getSnapshot())
    }

    AsyncFunction("appendPoopMark") { () -> [String: Double] in
      let coordinate = try await Self.resolveCoordinate()
      WalkSessionStorage.appendPoop(latitude: coordinate.latitude, longitude: coordinate.longitude)
      if #available(iOS 16.2, *) {
        await WalkLiveActivityUpdater.refreshCounts()
      }
      return ["latitude": coordinate.latitude, "longitude": coordinate.longitude]
    }

    AsyncFunction("appendCustomMark") { () -> [String: Double] in
      let coordinate = try await Self.resolveCoordinate()
      WalkSessionStorage.appendCustomMark(latitude: coordinate.latitude, longitude: coordinate.longitude)
      if #available(iOS 16.2, *) {
        await WalkLiveActivityUpdater.refreshCounts()
      }
      return ["latitude": coordinate.latitude, "longitude": coordinate.longitude]
    }

    Function("setActiveMarkPetId") { (petId: String) in
      WalkSessionStorage.setActivePetId(petId)
      if #available(iOS 16.2, *) {
        Task {
          await WalkLiveActivityUpdater.refreshCounts()
        }
      }
    }

    Function("getActiveMarkPetId") { () -> String in
      WalkSessionStorage.activePetId()
    }

    Function("setLastKnownCoordinate") { (latitude: Double, longitude: Double) in
      WalkSessionStorage.setLastCoordinate(latitude: latitude, longitude: longitude)
    }

    Function("isWalkTrackingActive") { () -> Bool in
      WalkSessionStorage.getSnapshot().isTracking
    }
  }

  private static func snapshotToDictionary(_ snapshot: WalkSessionSnapshotPayload) -> [String: Any] {
    var payload: [String: Any] = [
      "route": snapshot.route.map { ["latitude": $0.latitude, "longitude": $0.longitude] },
      "poops": snapshot.poops.map {
        [
          "latitude": $0.latitude,
          "longitude": $0.longitude,
          "petId": $0.petId,
        ]
      },
      "customMarks": snapshot.customMarks.map {
        [
          "latitude": $0.latitude,
          "longitude": $0.longitude,
          "icon": $0.icon,
          "buttonId": $0.buttonId,
          "petId": $0.petId,
        ]
      },
      "isTracking": snapshot.isTracking,
    ]

    if let startTimeMs = snapshot.startTimeMs {
      payload["startTimeMs"] = startTimeMs
    }

    return payload
  }

  private static func resolveCoordinate() async throws -> WalkCoordinatePayload {
    if let fallback = WalkSessionStorage.fallbackCoordinate() {
      return fallback
    }

    let manager = CLLocationManager()
    if let location = manager.location {
      let coordinate = WalkCoordinatePayload(
        latitude: location.coordinate.latitude,
        longitude: location.coordinate.longitude
      )
      if coordinate.isUsable {
        return coordinate
      }
    }

    throw Exception(name: "ERR_NO_LOCATION", description: "Current location is unavailable")
  }
}
