package expo.modules.walktracking

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

class WalkTrackingForegroundService : Service() {
  private lateinit var fusedLocationClient: FusedLocationProviderClient
  private var locationCallback: LocationCallback? = null
  private var distanceIntervalMeters = WalkTrackingContracts.DEFAULT_DISTANCE_INTERVAL_METERS

  private var title = "Walking"
  private var body = "🐾"
  private var poopLabel = "💩"
  private var customIcon = "💦"

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(applicationContext)
    runningInstance = this
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      WalkTrackingContracts.ACTION_STOP -> {
        stopTracking()
        stopSelf()
        return START_NOT_STICKY
      }
      WalkTrackingContracts.ACTION_START -> {
        title = intent.getStringExtra(WalkTrackingContracts.EXTRA_TITLE) ?: title
        body = intent.getStringExtra(WalkTrackingContracts.EXTRA_BODY) ?: body
        poopLabel = intent.getStringExtra(WalkTrackingContracts.EXTRA_POOP_LABEL) ?: poopLabel
        customIcon = intent.getStringExtra(WalkTrackingContracts.EXTRA_CUSTOM_ICON) ?: customIcon
        distanceIntervalMeters =
          intent.getFloatExtra(
            WalkTrackingContracts.EXTRA_DISTANCE_INTERVAL_METERS,
            WalkTrackingContracts.DEFAULT_DISTANCE_INTERVAL_METERS
          )

        val customButtonId =
          intent.getStringExtra(WalkTrackingContracts.EXTRA_CUSTOM_BUTTON_ID) ?: "pee"

        WalkSessionStorage.beginSession(this, customButtonId, customIcon)
        resumeTracking()
      }
      else -> {
        if (WalkSessionStorage.getSnapshot(applicationContext).isTracking) {
          customIcon = WalkSessionStorage.readCustomIcon(applicationContext)
          resumeTracking()
        } else {
          stopSelf()
        }
      }
    }

    return START_STICKY
  }

  private fun resumeTracking() {
    try {
      startTracking()
    } catch (error: Exception) {
      Log.e(TAG, "Failed to start walk tracking service", error)
      WalkSessionStorage.endSession(applicationContext)
      stopSelf()
    }
  }

  override fun onDestroy() {
    if (runningInstance === this) {
      runningInstance = null
    }
    stopTracking()
    super.onDestroy()
  }

  private fun startTracking() {
    createNotificationChannel()
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        WalkTrackingContracts.NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
      )
    } else {
      startForeground(WalkTrackingContracts.NOTIFICATION_ID, notification)
    }

    val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
      .setMinUpdateDistanceMeters(distanceIntervalMeters)
      .setWaitForAccurateLocation(false)
      .build()

    val callback = object : LocationCallback() {
      override fun onLocationResult(locationResult: LocationResult) {
        val location = locationResult.lastLocation ?: return
        WalkSessionStorage.appendRoutePointIfNeeded(
          applicationContext,
          location.latitude,
          location.longitude,
          distanceIntervalMeters,
        )
      }
    }

    locationCallback = callback
    try {
      fusedLocationClient.requestLocationUpdates(request, callback, mainLooper)
    } catch (_: SecurityException) {
      stopSelf()
    }
  }

  private fun stopTracking() {
    if (::fusedLocationClient.isInitialized) {
      locationCallback?.let { callback ->
        fusedLocationClient.removeLocationUpdates(callback)
      }
    }
    locationCallback = null
    WalkSessionStorage.endSession(applicationContext)
    stopForeground(STOP_FOREGROUND_REMOVE)
  }

  private fun notificationBodyText(): String {
    val poopCount = WalkSessionStorage.readPoopsCount(applicationContext)
    val customCount = WalkSessionStorage.readCustomMarksCount(applicationContext)
    return "$body  $poopLabel $poopCount  •  $customIcon $customCount"
  }

  private fun updateNotification() {
    val manager = getSystemService(NotificationManager::class.java) ?: return
    manager.notify(WalkTrackingContracts.NOTIFICATION_ID, buildNotification())
  }

  private fun resolveSmallIcon(): Int = R.drawable.ic_walk_notification

  private fun buildPoopPendingIntent(): PendingIntent {
    return PendingIntent.getBroadcast(
      this,
      1,
      Intent(this, WalkActionReceiver::class.java).apply {
        action = WalkTrackingContracts.ACTION_RECORD_POOP
      },
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun buildCustomPendingIntent(): PendingIntent {
    return PendingIntent.getBroadcast(
      this,
      2,
      Intent(this, WalkActionReceiver::class.java).apply {
        action = WalkTrackingContracts.ACTION_RECORD_CUSTOM
      },
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun buildCustomRemoteViews(
    poopPendingIntent: PendingIntent,
    customPendingIntent: PendingIntent,
  ): RemoteViews {
    val remoteViews = RemoteViews(packageName, R.layout.notification_walk_custom)
    remoteViews.setTextViewText(R.id.notification_title, title)
    remoteViews.setTextViewText(R.id.notification_counts, notificationBodyText())
    remoteViews.setTextViewText(R.id.btn_poop, poopLabel)
    remoteViews.setTextViewText(R.id.btn_custom, customIcon)
    remoteViews.setOnClickPendingIntent(R.id.btn_poop, poopPendingIntent)
    remoteViews.setOnClickPendingIntent(R.id.btn_custom, customPendingIntent)
    return remoteViews
  }

  private fun buildNotification(): Notification {
    val poopPendingIntent = buildPoopPendingIntent()
    val customPendingIntent = buildCustomPendingIntent()
    val customContentView = buildCustomRemoteViews(poopPendingIntent, customPendingIntent)

    val builder = NotificationCompat.Builder(this, WalkTrackingContracts.CHANNEL_ID)
      .setSmallIcon(resolveSmallIcon())
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setStyle(NotificationCompat.DecoratedCustomViewStyle())
      .setCustomContentView(customContentView)
      .setContentTitle(title)
      .setContentText(notificationBodyText())

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    if (launchIntent != null) {
      val contentPendingIntent = PendingIntent.getActivity(
        this,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      builder.setContentIntent(contentPendingIntent)
    }

    return builder.build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val channel = NotificationChannel(
      WalkTrackingContracts.CHANNEL_ID,
      "Walk tracking",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Ongoing walk tracking with quick record actions"
      setShowBadge(false)
    }

    val manager = getSystemService(NotificationManager::class.java)
    manager?.createNotificationChannel(channel)
  }

  companion object {
    private const val TAG = "WalkTrackingFGS"

    @Volatile
    private var runningInstance: WalkTrackingForegroundService? = null

    fun start(context: Context, config: WalkTrackingStartConfig) {
      val intent = Intent(context, WalkTrackingForegroundService::class.java).apply {
        action = WalkTrackingContracts.ACTION_START
        putExtra(WalkTrackingContracts.EXTRA_TITLE, config.title)
        putExtra(WalkTrackingContracts.EXTRA_BODY, config.body)
        putExtra(WalkTrackingContracts.EXTRA_POOP_LABEL, config.poopLabel)
        putExtra(WalkTrackingContracts.EXTRA_CUSTOM_LABEL, config.customLabel)
        putExtra(WalkTrackingContracts.EXTRA_CUSTOM_BUTTON_ID, config.customButtonId)
        putExtra(WalkTrackingContracts.EXTRA_CUSTOM_ICON, config.customIcon)
        putExtra(WalkTrackingContracts.EXTRA_DISTANCE_INTERVAL_METERS, config.distanceIntervalMeters)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      val intent = Intent(context, WalkTrackingForegroundService::class.java).apply {
        action = WalkTrackingContracts.ACTION_STOP
      }
      context.startService(intent)
    }

    fun refreshNotification(_context: Context) {
      runningInstance?.updateNotification()
    }
  }
}

data class WalkTrackingStartConfig(
  val title: String,
  val body: String,
  val poopLabel: String,
  val customLabel: String,
  val customButtonId: String,
  val customIcon: String,
  val distanceIntervalMeters: Float,
)
