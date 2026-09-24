import Foundation

struct WalkCoordinatePayload: Codable {
  let latitude: Double
  let longitude: Double

  var isUsable: Bool {
    abs(latitude) <= 90 && abs(longitude) <= 180 && !(latitude == 0 && longitude == 0)
  }
}

struct WalkPoopMarkPayload: Codable {
  let latitude: Double
  let longitude: Double
  let petId: String

  enum CodingKeys: String, CodingKey {
    case latitude
    case longitude
    case petId
  }

  init(latitude: Double, longitude: Double, petId: String = "") {
    self.latitude = latitude
    self.longitude = longitude
    self.petId = petId
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    latitude = try container.decode(Double.self, forKey: .latitude)
    longitude = try container.decode(Double.self, forKey: .longitude)
    petId = try container.decodeIfPresent(String.self, forKey: .petId) ?? ""
  }
}

struct WalkCustomMarkPayload: Codable {
  let latitude: Double
  let longitude: Double
  let icon: String
  let buttonId: String
  let petId: String

  enum CodingKeys: String, CodingKey {
    case latitude
    case longitude
    case icon
    case buttonId
    case petId
  }

  init(latitude: Double, longitude: Double, icon: String, buttonId: String, petId: String = "") {
    self.latitude = latitude
    self.longitude = longitude
    self.icon = icon
    self.buttonId = buttonId
    self.petId = petId
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    latitude = try container.decode(Double.self, forKey: .latitude)
    longitude = try container.decode(Double.self, forKey: .longitude)
    icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? "💦"
    buttonId = try container.decodeIfPresent(String.self, forKey: .buttonId) ?? "pee"
    petId = try container.decodeIfPresent(String.self, forKey: .petId) ?? ""
  }
}

struct WalkSessionPetPayload: Codable {
  let id: String
  let name: String
}

struct WalkSessionSnapshotPayload {
  let route: [WalkCoordinatePayload]
  let poops: [WalkPoopMarkPayload]
  let customMarks: [WalkCustomMarkPayload]
  let isTracking: Bool
  let startTimeMs: Double?
}

enum WalkSessionStorage {
  private static var defaults: UserDefaults? {
    UserDefaults(suiteName: WalkStorageConstants.appGroupId)
  }

  static func beginSession(
    customButtonId: String,
    customIcon: String,
    activePetId: String,
    walkPetsJson: String,
    activePetLabelPrefix: String
  ) {
    guard let defaults else { return }
    let pets = parseWalkPets(walkPetsJson)
    let resolvedActivePetId: String = {
      if !activePetId.isEmpty, pets.contains(where: { $0.id == activePetId }) {
        return activePetId
      }
      return pets.first?.id ?? activePetId
    }()

    defaults.set("[]", forKey: WalkStorageConstants.keyRoute)
    defaults.set("[]", forKey: WalkStorageConstants.keyPoops)
    defaults.set("[]", forKey: WalkStorageConstants.keyCustomMarks)
    defaults.set(true, forKey: WalkStorageConstants.keyIsTracking)
    defaults.set(customButtonId, forKey: WalkStorageConstants.keyCustomButtonId)
    defaults.set(customIcon, forKey: WalkStorageConstants.keyCustomIcon)
    defaults.set(resolvedActivePetId, forKey: WalkStorageConstants.keyActivePetId)
    defaults.set(walkPetsJson, forKey: WalkStorageConstants.keyWalkPetsJson)
    defaults.set(activePetLabelPrefix, forKey: WalkStorageConstants.keyActivePetLabelPrefix)
    defaults.set(Date().timeIntervalSince1970 * 1000, forKey: WalkStorageConstants.keyStartTimeMs)
  }

  static func setActivePetId(_ petId: String) {
    guard let defaults else { return }
    let pets = readWalkPets()
    let resolved: String = {
      if !petId.isEmpty, pets.contains(where: { $0.id == petId }) {
        return petId
      }
      return pets.first?.id ?? petId
    }()
    defaults.set(resolved, forKey: WalkStorageConstants.keyActivePetId)
  }

  static func activePetId() -> String {
    defaults?.string(forKey: WalkStorageConstants.keyActivePetId) ?? ""
  }

  static func readWalkPets() -> [WalkSessionPetPayload] {
    parseWalkPets(defaults?.string(forKey: WalkStorageConstants.keyWalkPetsJson) ?? "[]")
  }

  static func canCycleActivePet() -> Bool {
    readWalkPets().count > 1
  }

  @discardableResult
  static func cycleActivePet() -> Bool {
    let pets = readWalkPets()
    guard pets.count > 1 else { return false }
    let currentId = activePetId()
    let currentIndex = pets.firstIndex(where: { $0.id == currentId }) ?? 0
    let next = pets[(currentIndex + 1) % pets.count]
    setActivePetId(next.id)
    return true
  }

  static func activePetDisplayLabel() -> String {
    let pets = readWalkPets()
    guard let pet = pets.first(where: { $0.id == activePetId() }) ?? pets.first else {
      return ""
    }
    let prefix = defaults?.string(forKey: WalkStorageConstants.keyActivePetLabelPrefix) ?? ""
    let name = pet.name.isEmpty ? pet.id : pet.name
    if canCycleActivePet() {
      return "\(prefix)\(name) ⇄"
    }
    return "\(prefix)\(name)"
  }

  static func readPoopsCountForActivePet() -> Int {
    let petId = activePetId()
    let poops = readPoops()
    if petId.isEmpty || !canCycleActivePet() {
      return poops.count
    }
    return poops.filter { $0.petId == petId }.count
  }

  static func readCustomMarksCountForActivePet() -> Int {
    let petId = activePetId()
    let marks = readCustomMarks()
    if petId.isEmpty || !canCycleActivePet() {
      return marks.count
    }
    return marks.filter { $0.petId == petId }.count
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
      WalkStorageConstants.keyActivePetId,
      WalkStorageConstants.keyActivePetLabelPrefix,
      WalkStorageConstants.keyWalkPetsJson,
      WalkStorageConstants.keyLastLatitude,
      WalkStorageConstants.keyLastLongitude,
      WalkStorageConstants.keyStartTimeMs,
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
      let coordinate = WalkCoordinatePayload(
        latitude: defaults.double(forKey: WalkStorageConstants.keyLastLatitude),
        longitude: defaults.double(forKey: WalkStorageConstants.keyLastLongitude)
      )
      if coordinate.isUsable {
        return coordinate
      }
    }

    return readRoute().last(where: { $0.isUsable })
  }

  static func appendPoop(latitude: Double, longitude: Double) {
    setLastCoordinate(latitude: latitude, longitude: longitude)
    var poops = readPoops()
    poops.append(
      WalkPoopMarkPayload(
        latitude: latitude,
        longitude: longitude,
        petId: activePetId()
      )
    )
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
        buttonId: buttonId,
        petId: activePetId()
      )
    )
    writeCustomMarks(marks)
  }

  static func getSnapshot() -> WalkSessionSnapshotPayload {
    let startTimeMs: Double? = {
      guard let defaults,
            defaults.object(forKey: WalkStorageConstants.keyStartTimeMs) != nil else {
        return nil
      }
      return defaults.double(forKey: WalkStorageConstants.keyStartTimeMs)
    }()

    return WalkSessionSnapshotPayload(
      route: readRoute(),
      poops: readPoops(),
      customMarks: readCustomMarks(),
      isTracking: defaults?.bool(forKey: WalkStorageConstants.keyIsTracking) ?? false,
      startTimeMs: startTimeMs
    )
  }

  private static func readRoute() -> [WalkCoordinatePayload] {
    decodeArray(key: WalkStorageConstants.keyRoute)
  }

  private static func readPoops() -> [WalkPoopMarkPayload] {
    guard let defaults,
          let raw = defaults.string(forKey: WalkStorageConstants.keyPoops),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode([WalkPoopMarkPayload].self, from: data) else {
      return []
    }
    return decoded
  }

  private static func writePoops(_ poops: [WalkPoopMarkPayload]) {
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
    encodeArray(marks, key: WalkStorageConstants.keyCustomMarks)
  }

  private static func parseWalkPets(_ raw: String) -> [WalkSessionPetPayload] {
    guard let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode([WalkSessionPetPayload].self, from: data) else {
      return []
    }
    return decoded.filter { !$0.id.isEmpty }
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
