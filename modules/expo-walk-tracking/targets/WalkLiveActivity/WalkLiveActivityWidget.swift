import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct WalkLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WalkActivityAttributes.self) { context in
      WalkLiveActivityLockScreenView(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          VStack(alignment: .leading, spacing: 2) {
            Text(context.state.title)
              .font(.headline)
              .foregroundStyle(context.primaryTextColor)
            if !context.state.activePetLabel.isEmpty {
              WalkLiveActivityActivePetLabel(context: context)
            }
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          HStack(spacing: 8) {
            Text("\(context.attributes.poopLabel) \(context.state.poopCount)")
            Text("\(context.attributes.customIcon) \(context.state.customCount)")
          }
          .font(.caption)
          .foregroundStyle(context.secondaryTextColor)
        }
        DynamicIslandExpandedRegion(.bottom) {
          WalkLiveActivityActionRow(context: context)
        }
      } compactLeading: {
        Text("🐾")
      } compactTrailing: {
        Text("\(context.state.poopCount)")
          .foregroundStyle(context.primaryTextColor)
      } minimal: {
        Text("🐾")
      }
    }
  }
}

@available(iOS 16.2, *)
private struct WalkLiveActivityLockScreenView: View {
  let context: ActivityViewContext<WalkActivityAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(context.state.title)
        .font(.headline)
        .foregroundStyle(context.primaryTextColor)
      if !context.state.activePetLabel.isEmpty {
        WalkLiveActivityActivePetLabel(context: context)
      }
      HStack(spacing: 16) {
        Text("\(context.attributes.poopLabel) \(context.state.poopCount)")
        Text("\(context.attributes.customIcon) \(context.state.customCount)")
      }
      .font(.caption)
      .foregroundStyle(context.secondaryTextColor)
      WalkLiveActivityActionRow(context: context)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
  }
}

@available(iOS 16.2, *)
private extension ActivityViewContext where Attributes == WalkActivityAttributes {
  var primaryTextColor: Color {
    Color(hex: attributes.textColorHex) ?? .white
  }

  var secondaryTextColor: Color {
    primaryTextColor.opacity(0.82)
  }
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActivePetLabel: View {
  let context: ActivityViewContext<WalkActivityAttributes>

  var body: some View {
    if #available(iOS 17.0, *), WalkSessionStorage.canCycleActivePet() {
      Button(intent: CycleActivePetIntent()) {
        Text(context.state.activePetLabel)
          .font(.subheadline)
          .foregroundStyle(context.secondaryTextColor)
          .frame(maxWidth: .infinity, alignment: .leading)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
    } else {
      Text(context.state.activePetLabel)
        .font(.subheadline)
        .foregroundStyle(context.secondaryTextColor)
    }
  }
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActionRow: View {
  let context: ActivityViewContext<WalkActivityAttributes>

  var body: some View {
    if #available(iOS 17.0, *) {
      HStack(spacing: 12) {
        Button(intent: RecordPoopIntent()) {
          WalkLiveActivityActionButtonLabel(symbol: context.attributes.poopLabel)
        }
        .buttonStyle(WalkLiveActivityActionButtonStyle(tint: context.primaryTextColor))

        Button(intent: RecordCustomIntent()) {
          WalkLiveActivityActionButtonLabel(symbol: context.attributes.customIcon)
        }
        .buttonStyle(WalkLiveActivityActionButtonStyle(tint: context.primaryTextColor))
      }
      .padding(.top, 6)
    }
  }
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActionButtonLabel: View {
  let symbol: String

  var body: some View {
    Text(symbol)
      .font(.system(size: 30))
      .frame(maxWidth: .infinity)
      .frame(minHeight: WalkLiveActivityMetrics.actionButtonHeight)
  }
}

@available(iOS 16.2, *)
private enum WalkLiveActivityMetrics {
  // Match Android notification_walk_custom.xml (48dp buttons, 28sp emoji).
  static let actionButtonHeight: CGFloat = 48
  static let actionButtonCornerRadius: CGFloat = 12
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActionButtonStyle: ButtonStyle {
  let tint: Color

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .background(
        RoundedRectangle(cornerRadius: WalkLiveActivityMetrics.actionButtonCornerRadius)
          .fill(tint.opacity(0.22))
      )
      .opacity(configuration.isPressed ? 0.72 : 1)
      .scaleEffect(configuration.isPressed ? 0.97 : 1)
      .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
  }
}

private extension Color {
  init?(hex: String) {
    var cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    if cleaned.hasPrefix("#") {
      cleaned.removeFirst()
    }
    guard cleaned.count == 6, let value = UInt64(cleaned, radix: 16) else {
      return nil
    }
    let red = Double((value >> 16) & 0xFF) / 255
    let green = Double((value >> 8) & 0xFF) / 255
    let blue = Double(value & 0xFF) / 255
    self.init(.sRGB, red: red, green: green, blue: blue, opacity: 1)
  }
}
