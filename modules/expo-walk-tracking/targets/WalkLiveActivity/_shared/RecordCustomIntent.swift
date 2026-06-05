import AppIntents
import CoreLocation

@available(iOS 17.0, *)
struct RecordCustomIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "Record custom mark"
  static var description: IntentDescription = "Record a custom mark during a walk"
  static var openAppWhenRun: Bool = false

  func perform() async throws -> some IntentResult {
    let coordinate = await Self.resolveCoordinate()
    WalkSessionStorage.appendCustomMark(latitude: coordinate.latitude, longitude: coordinate.longitude)
    if #available(iOS 16.2, *) {
      await WalkLiveActivityUpdater.refreshCounts()
    }
    return .result()
  }

  private static func resolveCoordinate() async -> WalkCoordinatePayload {
    if let fallback = WalkSessionStorage.fallbackCoordinate() {
      return fallback
    }

    let manager = CLLocationManager()
    if let location = manager.location {
      return WalkCoordinatePayload(
        latitude: location.coordinate.latitude,
        longitude: location.coordinate.longitude
      )
    }

    return WalkCoordinatePayload(latitude: 0, longitude: 0)
  }
}
