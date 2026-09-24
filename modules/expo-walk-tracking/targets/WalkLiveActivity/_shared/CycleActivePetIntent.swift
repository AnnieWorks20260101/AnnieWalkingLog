import AppIntents

@available(iOS 17.0, *)
struct CycleActivePetIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "Switch active pet"
  static var description: IntentDescription = "Cycle the active pet for walk marks"
  static var openAppWhenRun: Bool = false

  func perform() async throws -> some IntentResult {
    guard WalkSessionStorage.cycleActivePet() else {
      return .result()
    }
    if #available(iOS 16.2, *) {
      await WalkLiveActivityUpdater.refreshCounts()
    }
    return .result()
  }
}
