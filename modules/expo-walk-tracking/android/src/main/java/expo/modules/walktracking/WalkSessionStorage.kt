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

data class WalkPoopMark(
  val latitude: Double,
  val longitude: Double,
  val petId: String = "",
)

data class WalkCustomMark(
  val latitude: Double,
  val longitude: Double,
  val icon: String,
  val buttonId: String,
  val petId: String = "",
)

data class WalkSessionPet(
  val id: String,
  val name: String,
)

data class WalkSessionSnapshot(
  val route: List<WalkCoordinate>,
  val poops: List<WalkPoopMark>,
  val customMarks: List<WalkCustomMark>,
  val isTracking: Boolean,
  val startTimeMs: Long?,
)

object WalkSessionStorage {
  private const val PREFS_NAME = "expo_walk_tracking_session"
  private const val KEY_ROUTE = "route"
  private const val KEY_POOPS = "poops"
  private const val KEY_CUSTOM_MARKS = "customMarks"
  private const val KEY_IS_TRACKING = "isTracking"
  private const val KEY_CUSTOM_BUTTON_ID = "customButtonId"
  private const val KEY_CUSTOM_ICON = "customIcon"
  private const val KEY_ACTIVE_PET_ID = "activePetId"
  private const val KEY_ACTIVE_PET_LABEL_PREFIX = "activePetLabelPrefix"
  private const val KEY_WALK_PETS_JSON = "walkPetsJson"
  private const val KEY_START_TIME_MS = "startTimeMs"

  @Synchronized
  fun beginSession(
    context: Context,
    customButtonId: String,
    customIcon: String,
    activePetId: String,
    walkPetsJson: String,
    activePetLabelPrefix: String,
  ) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val pets = parseWalkPets(walkPetsJson)
    val resolvedActivePetId = when {
      activePetId.isNotBlank() && pets.any { it.id == activePetId } -> activePetId
      pets.isNotEmpty() -> pets.first().id
      else -> activePetId
    }
    prefs.edit()
      .putString(KEY_ROUTE, "[]")
      .putString(KEY_POOPS, "[]")
      .putString(KEY_CUSTOM_MARKS, "[]")
      .putBoolean(KEY_IS_TRACKING, true)
      .putString(KEY_CUSTOM_BUTTON_ID, customButtonId)
      .putString(KEY_CUSTOM_ICON, customIcon)
      .putString(KEY_ACTIVE_PET_ID, resolvedActivePetId)
      .putString(KEY_WALK_PETS_JSON, walkPetsJson)
      .putString(KEY_ACTIVE_PET_LABEL_PREFIX, activePetLabelPrefix)
      .putLong(KEY_START_TIME_MS, System.currentTimeMillis())
      .apply()
  }

  @Synchronized
  fun setActivePetId(context: Context, petId: String) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val pets = readWalkPets(context)
    val resolved = when {
      petId.isNotBlank() && pets.any { it.id == petId } -> petId
      pets.isNotEmpty() -> pets.first().id
      else -> petId
    }
    prefs.edit().putString(KEY_ACTIVE_PET_ID, resolved).apply()
  }

  @Synchronized
  fun activePetId(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_ACTIVE_PET_ID, "") ?: ""
  }

  @Synchronized
  fun readWalkPets(context: Context): List<WalkSessionPet> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return parseWalkPets(prefs.getString(KEY_WALK_PETS_JSON, "[]") ?: "[]")
  }

  @Synchronized
  fun canCycleActivePet(context: Context): Boolean {
    return readWalkPets(context).size > 1
  }

  @Synchronized
  fun cycleActivePet(context: Context): Boolean {
    val pets = readWalkPets(context)
    if (pets.size <= 1) {
      return false
    }
    val currentId = activePetId(context)
    val currentIndex = pets.indexOfFirst { it.id == currentId }.let { if (it < 0) 0 else it }
    val next = pets[(currentIndex + 1) % pets.size]
    setActivePetId(context, next.id)
    return true
  }

  @Synchronized
  fun activePetDisplayLabel(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val prefix = prefs.getString(KEY_ACTIVE_PET_LABEL_PREFIX, "") ?: ""
    val pets = readWalkPets(context)
    if (pets.isEmpty()) {
      return ""
    }
    val currentId = activePetId(context)
    val pet = pets.firstOrNull { it.id == currentId } ?: pets.first()
    val name = pet.name.ifBlank { pet.id }
    return if (canCycleActivePet(context)) {
      "$prefix$name ⇄"
    } else {
      "$prefix$name"
    }
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
    poops.add(WalkPoopMark(latitude, longitude, activePetId(context)))
    writePoops(context, poops)
  }

  @Synchronized
  fun appendCustomMark(context: Context, latitude: Double, longitude: Double) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val buttonId = prefs.getString(KEY_CUSTOM_BUTTON_ID, "pee") ?: "pee"
    val icon = prefs.getString(KEY_CUSTOM_ICON, "💦") ?: "💦"
    val marks = readCustomMarks(context).toMutableList()
    marks.add(WalkCustomMark(latitude, longitude, icon, buttonId, activePetId(context)))
    writeCustomMarks(context, marks)
  }

  @Synchronized
  fun getLastRoutePoint(context: Context): WalkCoordinate? {
    return readRoute(context).lastOrNull()
  }

  @Synchronized
  fun getSnapshot(context: Context): WalkSessionSnapshot {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val startTimeMs = if (prefs.contains(KEY_START_TIME_MS)) {
      prefs.getLong(KEY_START_TIME_MS, 0L)
    } else {
      null
    }
    return WalkSessionSnapshot(
      route = readRoute(context),
      poops = readPoops(context),
      customMarks = readCustomMarks(context),
      isTracking = prefs.getBoolean(KEY_IS_TRACKING, false),
      startTimeMs = startTimeMs,
    )
  }

  @Synchronized
  fun readPoopsCount(context: Context): Int = readPoops(context).size

  @Synchronized
  fun readCustomMarksCount(context: Context): Int = readCustomMarks(context).size

  @Synchronized
  fun readPoopsCountForActivePet(context: Context): Int {
    val petId = activePetId(context)
    if (petId.isBlank() || !canCycleActivePet(context)) {
      return readPoopsCount(context)
    }
    return readPoops(context).count { it.petId == petId }
  }

  @Synchronized
  fun readCustomMarksCountForActivePet(context: Context): Int {
    val petId = activePetId(context)
    if (petId.isBlank() || !canCycleActivePet(context)) {
      return readCustomMarksCount(context)
    }
    return readCustomMarks(context).count { it.petId == petId }
  }

  @Synchronized
  fun readCustomIcon(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_CUSTOM_ICON, "💦") ?: "💦"
  }

  private fun readRoute(context: Context): List<WalkCoordinate> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return parseCoordinateArray(prefs.getString(KEY_ROUTE, "[]") ?: "[]")
  }

  private fun writeRoute(context: Context, route: List<WalkCoordinate>) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_ROUTE, coordinateArrayToJson(route)).apply()
  }

  private fun readPoops(context: Context): List<WalkPoopMark> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val array = JSONArray(prefs.getString(KEY_POOPS, "[]") ?: "[]")
    val marks = mutableListOf<WalkPoopMark>()
    for (index in 0 until array.length()) {
      val item = array.getJSONObject(index)
      marks.add(
        WalkPoopMark(
          latitude = item.getDouble("latitude"),
          longitude = item.getDouble("longitude"),
          petId = item.optString("petId", ""),
        )
      )
    }
    return marks
  }

  private fun writePoops(context: Context, poops: List<WalkPoopMark>) {
    val array = JSONArray()
    poops.forEach { mark ->
      array.put(
        JSONObject()
          .put("latitude", mark.latitude)
          .put("longitude", mark.longitude)
          .put("petId", mark.petId)
      )
    }
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_POOPS, array.toString()).apply()
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
          petId = item.optString("petId", ""),
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
          .put("petId", mark.petId)
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

  private fun parseWalkPets(raw: String): List<WalkSessionPet> {
    return try {
      val array = JSONArray(raw)
      val pets = mutableListOf<WalkSessionPet>()
      for (index in 0 until array.length()) {
        val item = array.getJSONObject(index)
        val id = item.optString("id", "")
        if (id.isBlank()) {
          continue
        }
        pets.add(
          WalkSessionPet(
            id = id,
            name = item.optString("name", id),
          )
        )
      }
      pets
    } catch (_: Exception) {
      emptyList()
    }
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
