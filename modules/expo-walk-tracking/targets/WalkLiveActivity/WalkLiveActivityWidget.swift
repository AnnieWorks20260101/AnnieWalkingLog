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
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActionRow: View {
  let context: ActivityViewContext<WalkActivityAttributes>

  var body: some View {
    if #available(iOS 17.0, *) {
      HStack(spacing: 12) {
        Button(intent: RecordPoopIntent()) {
          Text(context.attributes.poopLabel)
            .font(.title2)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(.borderedProminent)

        Button(intent: RecordCustomIntent()) {
          Text(context.attributes.customIcon)
            .font(.title2)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(.bordered)
      }
      .padding(.top, 4)
    }
  }
}
