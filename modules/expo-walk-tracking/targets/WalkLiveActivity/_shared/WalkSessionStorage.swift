import Foundation

struct WalkCoordinatePayload: Codable {
  let latitude: Double
  let longitude: Double

  var isUsable: Bool {
    abs(latitude) <= 90 && abs(longitude) <= 180 && !(latitude == 0 && longitude == 0)
  }
}

struct WalkCustomMarkPayload: Codable {
  let latitude: Double
  let longitude: Double
  let icon: String
  let buttonId: String
}

enum WalkSessionStorage {
  private static var defaults: UserDefaults? {
    UserDefaults(suiteName: WalkStorageConstants.appGroupId)
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
      let coordinate = WalkCoordinatePayload(
        latitude: defaults.double(forKey: WalkStorageConstants.keyLastLatitude),
        longitude: defaults.double(forKey: WalkStorageConstants.keyLastLongitude)
      )
      if coordinate.isUsable {
        return coordinate
      }
    }
    return nil
  }

  static func appendPoop(latitude: Double, longitude: Double) {
    setLastCoordinate(latitude: latitude, longitude: longitude)
    var poops = readPoops()
    poops.append(WalkCoordinatePayload(latitude: latitude, longitude: longitude))
    writePoops(poops)
  }

  static func readPoopsCount() -> Int {
    readPoops().count
  }

  static func readCustomMarksCount() -> Int {
    readCustomMarks().count
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
