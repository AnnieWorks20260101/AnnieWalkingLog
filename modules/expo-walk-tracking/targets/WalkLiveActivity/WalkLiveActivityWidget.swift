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
          Text(context.state.title)
            .font(.headline)
        }
        DynamicIslandExpandedRegion(.trailing) {
          HStack(spacing: 8) {
            Text("\(context.attributes.poopLabel) \(context.state.poopCount)")
            Text("\(context.attributes.customIcon) \(context.state.customCount)")
          }
          .font(.caption)
        }
        DynamicIslandExpandedRegion(.bottom) {
          WalkLiveActivityActionRow(context: context)
        }
      } compactLeading: {
        Text("🐾")
      } compactTrailing: {
        Text("\(context.state.poopCount)")
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
    VStack(alignment: .leading, spacing: 10) {
      Text(context.state.title)
        .font(.headline)
        .foregroundStyle(WalkLiveActivityColors.primaryText)
      Text(context.state.body)
        .font(.subheadline)
        .foregroundStyle(WalkLiveActivityColors.secondaryText)
      HStack(spacing: 16) {
        Text("\(context.attributes.poopLabel) \(context.state.poopCount)")
        Text("\(context.attributes.customIcon) \(context.state.customCount)")
      }
      .font(.caption)
      .foregroundStyle(WalkLiveActivityColors.secondaryText)
      WalkLiveActivityActionRow(context: context)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
  }
}

@available(iOS 16.2, *)
private enum WalkLiveActivityColors {
  // Lock screen Live Activities render on a dark material; avoid systemBackground tint.
  static let primaryText = Color.white
  static let secondaryText = Color.white.opacity(0.82)
  static let actionButtonBackground = Color.white.opacity(0.22)
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
        .buttonStyle(WalkLiveActivityActionButtonStyle())

        Button(intent: RecordCustomIntent()) {
          WalkLiveActivityActionButtonLabel(symbol: context.attributes.customIcon)
        }
        .buttonStyle(WalkLiveActivityActionButtonStyle())
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
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .background(
        RoundedRectangle(cornerRadius: WalkLiveActivityMetrics.actionButtonCornerRadius)
          .fill(WalkLiveActivityColors.actionButtonBackground)
      )
      .opacity(configuration.isPressed ? 0.72 : 1)
      .scaleEffect(configuration.isPressed ? 0.97 : 1)
      .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
  }
}
