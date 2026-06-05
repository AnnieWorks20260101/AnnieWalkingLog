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
      Text(context.state.body)
        .font(.subheadline)
        .foregroundStyle(.secondary)
      HStack(spacing: 16) {
        Text("\(context.attributes.poopLabel) \(context.state.poopCount)")
        Text("\(context.attributes.customIcon) \(context.state.customCount)")
      }
      .font(.caption)
      .foregroundStyle(.secondary)
      WalkLiveActivityActionRow(context: context)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
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
