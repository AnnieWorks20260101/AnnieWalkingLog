package expo.modules.walktracking

object WalkTrackingContracts {
  const val CHANNEL_ID = "walk_tracking"
  const val NOTIFICATION_ID = 61001

  const val ACTION_START = "expo.modules.walktracking.action.START"
  const val ACTION_STOP = "expo.modules.walktracking.action.STOP"
  const val ACTION_RECORD_POOP = "expo.modules.walktracking.action.RECORD_POOP"
  const val ACTION_RECORD_CUSTOM = "expo.modules.walktracking.action.RECORD_CUSTOM"
  const val ACTION_CYCLE_PET = "expo.modules.walktracking.action.CYCLE_PET"

  const val EXTRA_TITLE = "title"
  const val EXTRA_BODY = "body"
  const val EXTRA_POOP_LABEL = "poopLabel"
  const val EXTRA_CUSTOM_LABEL = "customLabel"
  const val EXTRA_CUSTOM_BUTTON_ID = "customButtonId"
  const val EXTRA_CUSTOM_ICON = "customIcon"
  const val EXTRA_TEXT_COLOR_HEX = "textColorHex"
  const val EXTRA_ACTIVE_PET_ID = "activePetId"
  const val EXTRA_ACTIVE_PET_LABEL_PREFIX = "activePetLabelPrefix"
  const val EXTRA_WALK_PETS_JSON = "walkPetsJson"
  const val EXTRA_DISTANCE_INTERVAL_METERS = "distanceIntervalMeters"

  const val DEFAULT_DISTANCE_INTERVAL_METERS = 5f
  const val DEFAULT_TEXT_COLOR_HEX = "#FFFFFF"
}
