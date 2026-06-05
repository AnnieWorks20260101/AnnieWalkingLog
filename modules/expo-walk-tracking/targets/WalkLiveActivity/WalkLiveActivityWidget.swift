import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct WalkLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WalkActivityAttributes.self) { context in
      WalkLiveActivityLockScreenView(context: context)
        .activityBackgroundTint(Color(.systemBackground))
        .activitySystemActionForegroundColor(Color.primary)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Text(context.state.title)
            .font(.headline)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("💩 \(context.state.poopCount)")
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
    VStack(alignment: .leading, spacing: 8) {
      Text(context.state.title)
        .font(.headline)
      Text(context.state.body)
        .font(.subheadline)
      Text("💩 \(context.state.poopCount)  •  \(context.attributes.customLabel) \(context.state.customCount)")
        .font(.caption)
      WalkLiveActivityActionRow(context: context)
    }
    .padding(.vertical, 4)
  }
}

@available(iOS 16.2, *)
private struct WalkLiveActivityActionRow: View {
  let context: ActivityViewContext<WalkActivityAttributes>

  var body: some View {
    if #available(iOS 17.0, *) {
      HStack(spacing: 12) {
        Button(intent: RecordPoopIntent()) {
          Text(context.attributes.poopLabel)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)

        Button(intent: RecordCustomIntent()) {
          Text(context.attributes.customLabel)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.bordered)
      }
    }
  }
}
