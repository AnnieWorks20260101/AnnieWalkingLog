# Privacy Policy — Annie's Walking Log

**Last updated: June 16, 2026**

Annie Works (“we”, “us”, or “the Developer”) sets forth this Privacy Policy (“Policy”) regarding the handling of personal information and user data in the application Annie's Walking Log (“the App”).

---

## 1. Data Controller

| Item | Details |
|------|---------|
| Trade name | Annie Works |
| Representative | Toshiya Karimata |
| Business activities | Planning, development, and operation of applications |
| Address | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

The business listed above is the controller of personal data processed in the App.

For inquiries about this Policy or requests for access, correction, or deletion of personal data, please contact us at the email address above. We do not accept inquiries by phone. We accept inquiries by mail or email.

### 1.1 Matters Not Applicable at Present

The following do not apply to the App’s current operation:

| Topic | Details |
|-------|---------|
| Automated decision-making / profiling | We do not make automated decisions that produce legal or similarly significant effects on users |
| Services for children | The App is not intended for users under 16 |
| EU representative (GDPR Article 27) | As a business based in Japan, we have not appointed an EU representative at this time. Inquiries from EU residents are handled via the email contact above |
| Data Protection Officer (DPO) | We have not appointed a DPO, as processing qualifies as small-scale at this time |

### 1.2 Consent

When you start using the App (guest use, member registration, or login), you agree to this Policy. If we revise this Policy (other than typographical corrections), we may ask you to agree again when you launch the app or log in. If you do not agree, you may log out and stop using the App.

Permissions for location, camera, notifications, and similar features are requested separately through the OS permission dialogs when you use each feature. You can turn off notifications at any time in device settings.

We record the date and time of consent to this Policy and the Policy version on your device and in the cloud (Firebase).

---

## 2. Information We Collect and Purposes of Use

The App collects and uses the information below to manage walk logs, share data within families, back up data to the cloud, and improve service quality. Except when necessary for our operations, we do not individually review users’ recorded content.

### 2.1 Information You Enter

**Information collected**

- **Account information**: Display name, email address (when registered), authentication method (guest / email)
- **Pet information**: Name, breed/type, sex, birthday, adoption day, farewell date (optional), group name (optional), profile photo
- **Walk logs**: Start/end time, distance, duration, GPS route (latitude/longitude coordinates), pets on the walk, poop/custom mark locations, memos, photos taken during walks, weather snapshot at walk start (temperature, weather icon, etc.)
- **Family code**: Identifier for joining and sharing a family group (family ID in Firestore)

**Purpose of use**

To create, store, and view pet walk logs, share logs within families, and securely back up data to the cloud.

**Handling**

Data you enter is stored on Google Firebase (Cloud Firestore, Cloud Storage) using encrypted communication (HTTPS). Only family members who share the same family code and have legitimate access can view it.

**Legal basis (reference for users in the EU)**

Processing is based on performance of a contract necessary to provide the Service and on your consent (including device permissions for location, camera, notifications, etc.).

---

### 2.2 Camera and Photos

**Information collected**

Collected only when you grant permission and use the device camera or photo library.

**Purpose of use**

- Register pet profile photos
- Take and store walk photos during or after walks in the cloud
- Optionally save photos to the device photo library (based on settings)

**Handling**

Images are stored in Firebase Cloud Storage and can be viewed only by users in the same family group. We do not capture images in the background or collect images for unrelated purposes.

---

### 2.3 Location Information

**Information collected**

With your permission, we collect device location (GPS) while you use the walk feature. If background location is enabled, we may collect location while the app is closed or while you use other apps in order to record your walk route.

To show weather when a walk starts, we may temporarily send latitude and longitude to OpenWeatherMap and attach the resulting weather data to the walk record.

**Purpose of use**

- Record walk start and end
- Calculate distance traveled
- Display routes on a map
- Show and record weather at walk start

**Handling**

Location and route data are stored in Cloud Firestore and can be viewed only by users in the same family group. We do not collect location for unrelated purposes when you are not using the walk feature. Accuracy may vary depending on device settings and signal conditions.

On the device, we may use local storage (AsyncStorage) only during an active walk to temporarily store the route. This is removed when the walk is saved or discarded.

---

### 2.4 Push Notifications

**Information collected**

With your permission, we access the device notification feature and obtain a device token (Expo Push Token) needed to deliver push notifications.

**Purpose of use**

- Notify family members when a walk ends
- Deliver notices and service-related messages from the App

**Handling**

Tokens are stored in Cloud Firestore linked to your account. Notification content is limited to what is necessary to operate the App. We do not use notifications for third-party advertising.

You can turn off notifications at any time in device or OS notification settings.

---

### 2.5 Authentication and Accounts

**Information collected**

- Anonymous user identifier issued for guest (anonymous) login
- Account information when registering or logging in with email and password
- Identifiers, email address, display name, etc. received via Google and Firebase Authentication when signing in with Google (varies by your Google settings and consent)
- Identifiers, email address (or Apple private relay address), display name, etc. received via Apple and Firebase Authentication when signing in with Apple (varies by your Apple settings and consent)
- Continuation of the same user identifier when upgrading from a guest account to member registration

**Purpose of use**

User authentication, protection and transfer of data, and management of participation in family groups.

**Handling**

Authentication data is managed by Firebase Authentication. We do not directly view or store passwords; they are handled securely by the authentication platform. Information received from Google or Apple sign-in is used only to create accounts, log in, or link to existing accounts.

---

### 2.6 Premium Features and Billing

**Information collected**

- Premium status for the family unit (expiration, etc., including `premiumExpiresAt` in Cloud Firestore)
- Information related to purchases, restoration, and subscription status via Apple App Store / Google Play
- For billing, family ID (used as App User ID), purchase transaction metadata, etc. may be sent to billing platforms such as RevenueCat (RevenueCat, Inc.)

**Purpose of use**

- Provide Premium features
- Manage status so **one subscription per family enables Premium for all members sharing the same family code**
- Restore purchases, prevent misuse, and provide support

**Handling**

- Payment processing (credit card numbers, etc.) is handled by **Apple / Google**. We do not store payment card information.
- Billing, cancellation, refunds, and auto-renewal follow each store’s terms and procedures.

---

## 3. Retention Period

| Data type | Retention period |
|-----------|------------------|
| Account, family, pet, and walk data | Until you delete your account, or until the last member of a family group deletes their account |
| Guest account data | Deleted when you “Log out (discard data)” while still a guest |
| Push notification tokens | Overwritten or deleted when the account is deleted or the device is re-registered |
| Temporary route on device during a walk | Deleted when the walk is saved or discarded |

Except where retention is required by law, we do not keep data beyond the periods above for unrelated purposes.

---

## 4. Deleting Data

You can delete data in the App as follows.

### 4.1 Deleting a Member Account

From Settings → “Delete account”, you can delete your logged-in member account.

- Your user information and your entry in the family member list are deleted.
- If you are the **last member** of a family group, all pets, walk logs, and photos (including files in Cloud Storage) linked to that family are also deleted.
- If **other family members remain**, shared pets and walk logs stay; only your account information is deleted.

For security, a recent re-login may be required. If so, log out, log in again, and retry deletion.

### 4.2 Guest “Log out (discard data)”

If you log out as a guest and choose “Log out (discard data)”, cloud records (walks, pets, photos, etc.) and the anonymous account are deleted and cannot be restored.

To keep your data, use free member registration (link an email account). If you upgrade from guest to member, existing records carry over to the same account.

### 4.3 Member Logout

If a member logs out normally, cloud data is not deleted. You can access it again on the next login.

### 4.4 Deletion by Request

If you cannot use the above or wish to delete other personal data, contact us at the address at the end of this Policy. We will respond within a reasonable period.

---

## 5. Third-Party Services and Data Transfers

The App uses the third-party services below for storage, authentication, maps, weather, notifications, and app functionality. Data may be sent as required by each service’s privacy policy. We do not sell or provide users’ recorded content to third parties for advertising.

### 5.1 App Platform and Storage

| Item | Details |
|------|---------|
| Service | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Data sent | Account information, pet and walk data, images, location, push tokens |
| Purpose | Authentication, cloud storage, sharing within families |
| Privacy policy | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Data may be stored on Google’s cloud infrastructure and **transferred outside the European Economic Area (EEA)** (e.g., Japan, United States).

We rely on Google’s data processing terms (including data protection provisions) and **Standard Contractual Clauses (SCC)** and other appropriate safeguards when using Firebase.

### 5.2 Push Notification Delivery

| Item | Details |
|------|---------|
| Service | Expo (Expo Push Notification Service) and Apple / Google notification infrastructure |
| Data sent | Device tokens and metadata needed for delivery |
| Purpose | Deliver push notifications |
| Privacy policy | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Maps

The App uses `react-native-maps` to display walk routes. **The map provider depends on your device OS.**

#### 5.3.1 Android

| Item | Details |
|------|---------|
| Service | Google Maps Platform |
| Data sent | Request data needed to display maps (communication from device to Google) |
| Purpose | Display walk routes on a map |
| Privacy policy | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Item | Details |
|------|---------|
| Service | Apple Maps (MapKit) |
| Data sent | Request data needed to fetch map tiles (communication from device to Apple) |
| Purpose | Display walk routes on a map |
| Privacy policy | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Weather (at Walk Start)

| Item | Details |
|------|---------|
| Service | OpenWeatherMap |
| Data sent | Latitude and longitude at walk start |
| Purpose | Show weather at walk start and attach it to the record |
| Privacy policy | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 In-App Purchases (Premium Subscriptions)

| Item | Details |
|------|---------|
| Service | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Data sent | Family ID (App User ID for billing), transaction information for purchase/restoration, device and store metadata |
| Purpose | Purchase and restore Premium subscriptions, manage active status, share features within a family |
| Privacy policy | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Disclosure to Third Parties

We take necessary and appropriate security measures for the information we handle. Except as required by law or to protect life, body, or property, we do not provide personal information to third parties without user consent.

Among members who share a family code, pet information and walk logs are mutually visible by design. Users are responsible for managing family codes.

---

## 7. Your Rights (Including Users in the EU)

Where applicable law allows, you may have the following rights:

- **Right of access**: Request disclosure of personal data we hold about you
- **Right of rectification**: Request correction of inaccurate personal data
- **Right of erasure**: Request deletion of personal data (via in-app deletion or our contact address)
- **Right to restrict or object**: Under certain conditions, restrict processing or object to processing
- **Right to data portability**: Request export in a structured format (JSON) via Settings → “Export data” (summary or full version; photos are included as Storage URLs in JSON)

Users residing in the EU may have the right to lodge a complaint with a supervisory authority in their country of residence.

---

## 8. Disclaimer

The App is intended to help record pet walks and share information within families. Recorded distance, routes, weather, and similar data depend on the device, environment, and settings and may not exactly match actual walks. We are not liable for trouble or damage arising from use of the App.

The App does not replace diagnosis or treatment by a veterinarian. If your pet has health concerns, consult a veterinarian or other qualified professional.

---

## 9. Contact

For questions about this Policy, requests regarding personal data, or support for the App, contact:

| Item | Details |
|------|---------|
| Trade name | Annie Works |
| Representative | Toshiya Karimata |
| Business activities | Planning, development, and operation of smartphone applications |
| Address | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

---

## 10. Changes to This Policy

We may revise this Policy when laws or the Service change. The revised Policy takes effect when posted on this website or similar channels. For important changes, we may notify you in the App or on the website.

---

*Published at: https://www.annie-works.com/en/AnnieWalkingLog/Privacy-Policy*
