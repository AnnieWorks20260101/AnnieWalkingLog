package expo.modules.walktracking

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class WalkTrackingStartOptions : Record {
  @Field
  var title: String = "Walking"

  @Field
  var body: String = "🐾"

  @Field
  var poopLabel: String = "💩"

  @Field
  var customLabel: String = "Custom"

  @Field
  var customButtonId: String = "pee"

  @Field
  var customIcon: String = "💦"

  @Field
  var distanceIntervalMeters: Double = WalkTrackingContracts.DEFAULT_DISTANCE_INTERVAL_METERS.toDouble()
}

class ExpoWalkTrackingModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWalkTracking")

    AsyncFunction("startWalkTracking") { options: WalkTrackingStartOptions, promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "Application context is unavailable", null)
        return@AsyncFunction
      }

      if (!hasLocationPermission(context)) {
        promise.reject("ERR_LOCATION_PERMISSION", "Location permission is not granted", null)
        return@AsyncFunction
      }

      WalkTrackingForegroundService.start(
        context,
        WalkTrackingStartConfig(
          title = options.title,
          body = options.body,
          poopLabel = options.poopLabel,
          customLabel = options.customLabel,
          customButtonId = options.customButtonId,
          customIcon = options.customIcon,
          distanceIntervalMeters = options.distanceIntervalMeters.toFloat(),
        )
      )
      promise.resolve(null)
    }

    AsyncFunction("stopWalkTracking") { promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "Application context is unavailable", null)
        return@AsyncFunction
      }

      WalkTrackingForegroundService.stop(context)
      val snapshot = WalkSessionStorage.getSnapshot(context)
      WalkSessionStorage.clearSession(context)
      promise.resolve(snapshotToMap(snapshot))
    }

    AsyncFunction("getWalkSessionSnapshot") { promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "Application context is unavailable", null)
        return@AsyncFunction
      }
      promise.resolve(snapshotToMap(WalkSessionStorage.getSnapshot(context)))
    }

    AsyncFunction("appendPoopMark") { promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "Application context is unavailable", null)
        return@AsyncFunction
      }
      appendMarkFromCurrentLocation(context, isPoop = true, promise)
    }

    AsyncFunction("appendCustomMark") { promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "Application context is unavailable", null)
        return@AsyncFunction
      }
      appendMarkFromCurrentLocation(context, isPoop = false, promise)
    }

    Function("setLastKnownCoordinate") { _: Double, _: Double ->
      // Android route updates are handled by WalkTrackingForegroundService.
    }

    Function("isWalkTrackingActive") {
      val context = appContext.reactContext?.applicationContext ?: return@Function false
      WalkSessionStorage.getSnapshot(context).isTracking
    }
  }

  private fun hasLocationPermission(context: android.content.Context): Boolean {
    val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
    val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
    return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
  }

  private fun appendMarkFromCurrentLocation(
    context: android.content.Context,
    isPoop: Boolean,
    promise: Promise,
  ) {
    val fusedLocationClient = com.google.android.gms.location.LocationServices.getFusedLocationProviderClient(context)
    val cancellationToken = com.google.android.gms.tasks.CancellationTokenSource()

    fusedLocationClient
      .getCurrentLocation(
        com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY,
        cancellationToken.token
      )
      .addOnSuccessListener { location ->
        val coordinate = if (location != null) {
          WalkCoordinate(location.latitude, location.longitude)
        } else {
          WalkSessionStorage.getLastRoutePoint(context)
        }

        if (coordinate == null) {
          promise.reject("ERR_NO_LOCATION", "Current location is unavailable", null)
          return@addOnSuccessListener
        }

        if (isPoop) {
          WalkSessionStorage.appendPoop(context, coordinate.latitude, coordinate.longitude)
        } else {
          WalkSessionStorage.appendCustomMark(context, coordinate.latitude, coordinate.longitude)
        }
        promise.resolve(
          mapOf(
            "latitude" to coordinate.latitude,
            "longitude" to coordinate.longitude,
          )
        )
      }
      .addOnFailureListener { error ->
        val fallback = WalkSessionStorage.getLastRoutePoint(context)
        if (fallback == null) {
          promise.reject("ERR_NO_LOCATION", error.message, error)
          return@addOnFailureListener
        }

        if (isPoop) {
          WalkSessionStorage.appendPoop(context, fallback.latitude, fallback.longitude)
        } else {
          WalkSessionStorage.appendCustomMark(context, fallback.latitude, fallback.longitude)
        }
        promise.resolve(
          mapOf(
            "latitude" to fallback.latitude,
            "longitude" to fallback.longitude,
          )
        )
      }
  }

  private fun snapshotToMap(snapshot: WalkSessionSnapshot): Map<String, Any?> {
    return mapOf(
      "route" to snapshot.route.map {
        mapOf("latitude" to it.latitude, "longitude" to it.longitude)
      },
      "poops" to snapshot.poops.map {
        mapOf("latitude" to it.latitude, "longitude" to it.longitude)
      },
      "customMarks" to snapshot.customMarks.map {
        mapOf(
          "latitude" to it.latitude,
          "longitude" to it.longitude,
          "icon" to it.icon,
          "buttonId" to it.buttonId,
        )
      },
      "isTracking" to snapshot.isTracking,
      "startTimeMs" to snapshot.startTimeMs,
    )
  }
}
