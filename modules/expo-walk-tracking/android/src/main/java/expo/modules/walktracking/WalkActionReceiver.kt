package expo.modules.walktracking

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

class WalkActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent == null) {
      return
    }

    val action = intent.action ?: return
    val pendingResult = goAsync()

    when (action) {
      WalkTrackingContracts.ACTION_RECORD_POOP -> {
        recordMark(context, isPoop = true, pendingResult)
      }
      WalkTrackingContracts.ACTION_RECORD_CUSTOM -> {
        recordMark(context, isPoop = false, pendingResult)
      }
      else -> pendingResult.finish()
    }
  }

  private fun recordMark(context: Context, isPoop: Boolean, pendingResult: PendingResult) {
    val appContext = context.applicationContext
    val fusedLocationClient = LocationServices.getFusedLocationProviderClient(appContext)
    val cancellationToken = CancellationTokenSource()

    fusedLocationClient
      .getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cancellationToken.token)
      .addOnSuccessListener { location ->
        val coordinate = if (location != null) {
          WalkCoordinate(location.latitude, location.longitude)
        } else {
          WalkSessionStorage.getLastRoutePoint(appContext)
        }

        if (coordinate != null) {
          if (isPoop) {
            WalkSessionStorage.appendPoop(appContext, coordinate.latitude, coordinate.longitude)
          } else {
            WalkSessionStorage.appendCustomMark(appContext, coordinate.latitude, coordinate.longitude)
          }
          WalkTrackingForegroundService.refreshNotification(appContext)
        }

        pendingResult.finish()
      }
      .addOnFailureListener {
        val fallback = WalkSessionStorage.getLastRoutePoint(appContext)
        if (fallback != null) {
          if (isPoop) {
            WalkSessionStorage.appendPoop(appContext, fallback.latitude, fallback.longitude)
          } else {
            WalkSessionStorage.appendCustomMark(appContext, fallback.latitude, fallback.longitude)
          }
          WalkTrackingForegroundService.refreshNotification(appContext)
        }
        pendingResult.finish()
      }
  }
}
