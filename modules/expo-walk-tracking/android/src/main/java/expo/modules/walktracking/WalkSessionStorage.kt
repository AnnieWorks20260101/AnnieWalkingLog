package expo.modules.walktracking

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class WalkCoordinate(
  val latitude: Double,
  val longitude: Double,
)

data class WalkCustomMark(
  val latitude: Double,
  val longitude: Double,
  val icon: String,
  val buttonId: String,
)

data class WalkSessionSnapshot(
  val route: List<WalkCoordinate>,
  val poops: List<WalkCoordinate>,
  val customMarks: List<WalkCustomMark>,
  val isTracking: Boolean,
)

object WalkSessionStorage {
  private const val PREFS_NAME = "expo_walk_tracking_session"
  private const val KEY_ROUTE = "route"
  private const val KEY_POOPS = "poops"
  private const val KEY_CUSTOM_MARKS = "customMarks"
  private const val KEY_IS_TRACKING = "isTracking"
  private const val KEY_CUSTOM_BUTTON_ID = "customButtonId"
  private const val KEY_CUSTOM_ICON = "customIcon"

  @Synchronized
  fun beginSession(context: Context, customButtonId: String, customIcon: String) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit()
      .putString(KEY_ROUTE, "[]")
      .putString(KEY_POOPS, "[]")
      .putString(KEY_CUSTOM_MARKS, "[]")
      .putBoolean(KEY_IS_TRACKING, true)
      .putString(KEY_CUSTOM_BUTTON_ID, customButtonId)
      .putString(KEY_CUSTOM_ICON, customIcon)
      .apply()
  }

  @Synchronized
  fun endSession(context: Context) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit()
      .putBoolean(KEY_IS_TRACKING, false)
      .apply()
  }

  @Synchronized
  fun clearSession(context: Context) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().clear().apply()
  }

  @Synchronized
  fun appendRoutePointIfNeeded(
    context: Context,
    latitude: Double,
    longitude: Double,
    minDistanceMeters: Float,
  ): Boolean {
    val route = readRoute(context).toMutableList()
    val last = route.lastOrNull()
    if (last != null && distanceMeters(last.latitude, last.longitude, latitude, longitude) < minDistanceMeters) {
      return false
    }
    route.add(WalkCoordinate(latitude, longitude))
    writeRoute(context, route)
    return true
  }

  @Synchronized
  fun appendPoop(context: Context, latitude: Double, longitude: Double) {
    val poops = readPoops(context).toMutableList()
    poops.add(WalkCoordinate(latitude, longitude))
    writePoops(context, poops)
  }

  @Synchronized
  fun appendCustomMark(context: Context, latitude: Double, longitude: Double) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val buttonId = prefs.getString(KEY_CUSTOM_BUTTON_ID, "pee") ?: "pee"
    val icon = prefs.getString(KEY_CUSTOM_ICON, "💦") ?: "💦"
    val marks = readCustomMarks(context).toMutableList()
    marks.add(WalkCustomMark(latitude, longitude, icon, buttonId))
    writeCustomMarks(context, marks)
  }

  @Synchronized
  fun getLastRoutePoint(context: Context): WalkCoordinate? {
    return readRoute(context).lastOrNull()
  }

  @Synchronized
  fun getSnapshot(context: Context): WalkSessionSnapshot {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return WalkSessionSnapshot(
      route = readRoute(context),
      poops = readPoops(context),
      customMarks = readCustomMarks(context),
      isTracking = prefs.getBoolean(KEY_IS_TRACKING, false),
    )
  }

  private fun readRoute(context: Context): List<WalkCoordinate> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return parseCoordinateArray(prefs.getString(KEY_ROUTE, "[]") ?: "[]")
  }

  private fun writeRoute(context: Context, route: List<WalkCoordinate>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_ROUTE, coordinateArrayToJson(route)).apply()
  }

  private fun readPoops(context: Context): List<WalkCoordinate> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return parseCoordinateArray(prefs.getString(KEY_POOPS, "[]") ?: "[]")
  }

  private fun writePoops(context: Context, poops: List<WalkCoordinate>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_POOPS, coordinateArrayToJson(poops)).apply()
  }

  private fun readCustomMarks(context: Context): List<WalkCustomMark> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_CUSTOM_MARKS, "[]") ?: "[]"
    val array = JSONArray(raw)
    val marks = mutableListOf<WalkCustomMark>()
    for (index in 0 until array.length()) {
      val item = array.getJSONObject(index)
      marks.add(
        WalkCustomMark(
          latitude = item.getDouble("latitude"),
          longitude = item.getDouble("longitude"),
          icon = item.optString("icon", "💦"),
          buttonId = item.optString("buttonId", "pee"),
        )
      )
    }
    return marks
  }

  private fun writeCustomMarks(context: Context, marks: List<WalkCustomMark>) {
    val array = JSONArray()
    marks.forEach { mark ->
      array.put(
        JSONObject()
          .put("latitude", mark.latitude)
          .put("longitude", mark.longitude)
          .put("icon", mark.icon)
          .put("buttonId", mark.buttonId)
      )
    }
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_CUSTOM_MARKS, array.toString()).apply()
  }

  private fun parseCoordinateArray(raw: String): List<WalkCoordinate> {
    val array = JSONArray(raw)
    val coordinates = mutableListOf<WalkCoordinate>()
    for (index in 0 until array.length()) {
      val item = array.getJSONObject(index)
      coordinates.add(
        WalkCoordinate(
          latitude = item.getDouble("latitude"),
          longitude = item.getDouble("longitude"),
        )
      )
    }
    return coordinates
  }

  private fun coordinateArrayToJson(coordinates: List<WalkCoordinate>): String {
    val array = JSONArray()
    coordinates.forEach { coordinate ->
      array.put(
        JSONObject()
          .put("latitude", coordinate.latitude)
          .put("longitude", coordinate.longitude)
      )
    }
    return array.toString()
  }

  private fun distanceMeters(
    startLat: Double,
    startLng: Double,
    endLat: Double,
    endLng: Double,
  ): Float {
    val earthRadius = 6371000.0
    val dLat = Math.toRadians(endLat - startLat)
    val dLng = Math.toRadians(endLng - startLng)
    val a = sin(dLat / 2) * sin(dLat / 2) +
      cos(Math.toRadians(startLat)) * cos(Math.toRadians(endLat)) *
      sin(dLng / 2) * sin(dLng / 2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return (earthRadius * c).toFloat()
  }
}
