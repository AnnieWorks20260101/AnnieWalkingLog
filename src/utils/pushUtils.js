/**
 * AnnieEndingNote と同じ方式: アプリから Expo Push API を直接呼ぶ
 * https://exp.host/--/api/v2/push/send
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) {
    console.log('[push] Pushトークンがないため通知をスキップしました');
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('[push] 送信APIエラー:', result);
      return;
    }

    console.log('[push] 通知を送信しました:', title);
  } catch (error) {
    console.error('[push] 通知の送信に失敗しました:', error);
  }
}
