import Foundation

struct WalkCoordinatePayload: Codable {
  let latitude: Double
  let longitude: Double
}

struct WalkCustomMarkPayload: Codable {
  let latitude: Double
  let longitude: Double
  let icon: String
  let buttonId: String
}

struct WalkSessionSnapshotPayload {
  let route: [WalkCoordinatePayload]
  let poops: [WalkCoordinatePayload]
  let customMarks: [WalkCustomMarkPayload]
  let isTracking: Bool
}

enum WalkSessionStorage {
  private static var defaults: UserDefaults? {
    UserDefaults(suiteName: WalkStorageConstants.appGroupId)
  }

  static func beginSession(customButtonId: String, customIcon: String) {
    guard let defaults else { return }
    defaults.set("[]", forKey: WalkStorageConstants.keyRoute)
    defaults.set("[]", forKey: WalkStorageConstants.keyPoops)
    defaults.set("[]", forKey: WalkStorageConstants.keyCustomMarks)
    defaults.set(true, forKey: WalkStorageConstants.keyIsTracking)
    defaults.set(customButtonId, forKey: WalkStorageConstants.keyCustomButtonId)
    defaults.set(customIcon, forKey: WalkStorageConstants.keyCustomIcon)
  }

  static func endSession() {
    defaults?.set(false, forKey: WalkStorageConstants.keyIsTracking)
  }

  static func clearSession() {
    guard let defaults else { return }
    [
      WalkStorageConstants.keyRoute,
      WalkStorageConstants.keyPoops,
      WalkStorageConstants.keyCustomMarks,
      WalkStorageConstants.keyIsTracking,
      WalkStorageConstants.keyCustomButtonId,
      WalkStorageConstants.keyCustomIcon,
      WalkStorageConstants.keyLastLatitude,
      WalkStorageConstants.keyLastLongitude,
    ].forEach { defaults.removeObject(forKey: $0) }
  }

  static func setLastCoordinate(latitude: Double, longitude: Double) {
    guard let defaults else { return }
    defaults.set(latitude, forKey: WalkStorageConstants.keyLastLatitude)
    defaults.set(longitude, forKey: WalkStorageConstants.keyLastLongitude)
  }

  static func fallbackCoordinate() -> WalkCoordinatePayload? {
    guard let defaults else { return nil }
    if defaults.object(forKey: WalkStorageConstants.keyLastLatitude) != nil,
       defaults.object(forKey: WalkStorageConstants.keyLastLongitude) != nil {
      return WalkCoordinatePayload(
        latitude: defaults.double(forKey: WalkStorageConstants.keyLastLatitude),
        longitude: defaults.double(forKey: WalkStorageConstants.keyLastLongitude)
      )
    }

    let route = readRoute()
    return route.last
  }

  static func appendPoop(latitude: Double, longitude: Double) {
    setLastCoordinate(latitude: latitude, longitude: longitude)
    var poops = readPoops()
    poops.append(WalkCoordinatePayload(latitude: latitude, longitude: longitude))
    writePoops(poops)
  }

  static func appendCustomMark(latitude: Double, longitude: Double) {
    setLastCoordinate(latitude: latitude, longitude: longitude)
    let buttonId = defaults?.string(forKey: WalkStorageConstants.keyCustomButtonId) ?? "pee"
    let icon = defaults?.string(forKey: WalkStorageConstants.keyCustomIcon) ?? "💦"
    var marks = readCustomMarks()
    marks.append(
      WalkCustomMarkPayload(
        latitude: latitude,
        longitude: longitude,
        icon: icon,
        buttonId: buttonId
      )
    )
    writeCustomMarks(marks)
  }

  static func getSnapshot() -> WalkSessionSnapshotPayload {
    WalkSessionSnapshotPayload(
      route: readRoute(),
      poops: readPoops(),
      customMarks: readCustomMarks(),
      isTracking: defaults?.bool(forKey: WalkStorageConstants.keyIsTracking) ?? false
    )
  }

  private static func readRoute() -> [WalkCoordinatePayload] {
    decodeArray(key: WalkStorageConstants.keyRoute)
  }

  private static func readPoops() -> [WalkCoordinatePayload] {
    decodeArray(key: WalkStorageConstants.keyPoops)
  }

  private static func writePoops(_ poops: [WalkCoordinatePayload]) {
    encodeArray(poops, key: WalkStorageConstants.keyPoops)
  }

  private static func readCustomMarks() -> [WalkCustomMarkPayload] {
    guard let defaults,
          let raw = defaults.string(forKey: WalkStorageConstants.keyCustomMarks),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode([WalkCustomMarkPayload].self, from: data) else {
      return []
    }
    return decoded
  }

  private static func writeCustomMarks(_ marks: [WalkCustomMarkPayload]) {
    guard let defaults,
          let data = try? JSONEncoder().encode(marks),
          let raw = String(data: data, encoding: .utf8) else {
      return
    }
    defaults.set(raw, forKey: WalkStorageConstants.keyCustomMarks)
  }

  private static func decodeArray(key: String) -> [WalkCoordinatePayload] {
    guard let defaults,
          let raw = defaults.string(forKey: key),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode([WalkCoordinatePayload].self, from: data) else {
      return []
    }
    return decoded
  }

  private static func encodeArray<T: Encodable>(_ value: T, key: String) {
    guard let defaults,
          let data = try? JSONEncoder().encode(value),
          let raw = String(data: data, encoding: .utf8) else {
      return
    }
    defaults.set(raw, forKey: key)
  }
}
