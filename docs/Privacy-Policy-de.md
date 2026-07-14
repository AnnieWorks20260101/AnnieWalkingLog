# Datenschutzerklärung — Annies Gassi-Tagebuch

**Letzte Aktualisierung: 16. Juni 2026**

Annie Works („wir“, „uns“ oder „der Entwickler“) legt in dieser Datenschutzerklärung („Erklärung“) die Handhabung personenbezogener Informationen und Nutzerdaten in der Anwendung Annies Gassi-Tagebuch („die App“) fest.

---

## 1. Verantwortlicher

| Punkt | Details |
|------|---------|
| Handelsname | Annie Works |
| Vertreter | Toshiya Karimata |
| Geschäftstätigkeit | Planung, Entwicklung und Betrieb von Anwendungen |
| Adresse | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Kontakt | support@annie-works.com |

Das oben genannte Unternehmen ist der Verantwortliche für die in der App verarbeiteten personenbezogenen Daten.

Bei Fragen zu dieser Erklärung oder Anträgen auf Auskunft, Berichtigung oder Löschung personenbezogener Daten wenden Sie sich bitte an die oben genannte E-Mail-Adresse. Wir nehmen keine Anfragen telefonisch entgegen. Anfragen per Post oder E-Mail sind möglich.

### 1.1 Derzeit nicht anwendbare Punkte

Folgende Punkte gelten für den aktuellen Betrieb der App nicht:

| Thema | Details |
|-------|---------|
| Automatisierte Entscheidungsfindung / Profiling | Wir treffen keine automatisierten Entscheidungen, die rechtliche oder ähnlich erhebliche Auswirkungen auf Nutzer haben |
| Dienste für Kinder | Die App ist nicht für Nutzer unter 16 Jahren bestimmt |
| EU-Vertreter (GDPR Artikel 27) | Als in Japan ansässiges Unternehmen haben wir derzeit keinen EU-Vertreter ernannt. Anfragen von EU-Bewohnern werden über die oben genannte E-Mail-Adresse bearbeitet |
| Datenschutzbeauftragter (DPO) | Wir haben keinen DPO ernannt, da die Verarbeitung derzeit als klein angelegt gilt |

### 1.2 Einwilligung

Wenn Sie die App nutzen (Gastnutzung, Mitgliedsregistrierung oder Anmeldung), stimmen Sie dieser Erklärung zu. Wenn wir diese Erklärung überarbeiten (mit Ausnahme von Tippfehlerkorrekturen), können wir Sie beim Start der App oder bei der Anmeldung bitten, erneut zuzustimmen. Wenn Sie nicht zustimmen, können Sie sich abmelden und die Nutzung der App beenden.

Berechtigungen für Standort, Kamera, Benachrichtigungen und ähnliche Funktionen werden separat über die OS-Berechtigungsdialoge angefordert, wenn Sie die jeweilige Funktion nutzen. Sie können Benachrichtigungen jederzeit in den Geräteeinstellungen deaktivieren.

Wir erfassen Datum und Uhrzeit der Einwilligung zu dieser Erklärung sowie die Version der Erklärung auf Ihrem Gerät und in der Cloud (Firebase).

---

## 2. Von uns erfasste Informationen und Verwendungszwecke

Die App erfasst und nutzt die nachstehenden Informationen, um Spaziergangsprotokolle zu verwalten, Daten innerhalb von Familien zu teilen, Daten in der Cloud zu sichern und die Servicequalität zu verbessern. Soweit für unseren Betrieb nicht erforderlich, prüfen wir die von Nutzern aufgezeichneten Inhalte nicht einzeln.

### 2.1 Von Ihnen eingegebene Informationen

**Erfasste Informationen**

- **Kontoinformationen**: Anzeigename, E-Mail-Adresse (bei Registrierung), Authentifizierungsmethode (Gast / E-Mail)
- **Haustierinformationen**: Name, Rasse/Typ, Geschlecht, Geburtstag, Adoptiertag, Abschiedsdatum (optional), Gruppenname (optional), Profilfoto
- **Spaziergangsprotokolle**: Start-/Endzeit, Entfernung, Dauer, GPS-Route (Breiten-/Längengradkoordinaten), mitgehende Haustiere, Kot-/benutzerdefinierte Markierungsorte, Notizen, während Spaziergängen aufgenommene Fotos, Wetter-Snapshot zu Spaziergangsbeginn (Temperatur, Wettersymbol usw.)
- **Familiencode**: Kennung zum Beitritt und Teilen einer Familiengruppe (Familien-ID in Firestore)

**Verwendungszweck**

Erstellung, Speicherung und Anzeige von Haustierspaziergangsprotokollen, Teilen von Protokollen innerhalb von Familien und sichere Sicherung von Daten in der Cloud.

**Handhabung**

Von Ihnen eingegebene Daten werden auf Google Firebase (Cloud Firestore, Cloud Storage) unter Verwendung verschlüsselter Kommunikation (HTTPS) gespeichert. Nur Familienmitglieder, die denselben Familiencode teilen und berechtigten Zugriff haben, können diese einsehen.

**Rechtsgrundlage (Referenz für Nutzer in der EU)**

Die Verarbeitung basiert auf der Vertragserfüllung, die für die Bereitstellung des Dienstes erforderlich ist, und auf Ihrer Einwilligung (einschließlich Geräteberechtigungen für Standort, Kamera, Benachrichtigungen usw.).

---

### 2.2 Kamera und Fotos

**Erfasste Informationen**

Nur erfasst, wenn Sie die Berechtigung erteilen und die Gerätekamera oder Fotobibliothek nutzen.

**Verwendungszweck**

- Registrierung von Haustierprofilfotos
- Aufnahme und Speicherung von Spaziergangsfotos während oder nach Spaziergängen in der Cloud
- Optionales Speichern von Fotos in der Gerätefotobibliothek (basierend auf Einstellungen)

**Handhabung**

Bilder werden in Firebase Cloud Storage gespeichert und können nur von Nutzern in derselben Familiengruppe eingesehen werden. Wir erfassen keine Bilder im Hintergrund und sammeln keine Bilder für nicht damit zusammenhängende Zwecke.

---

### 2.3 Standortinformationen

**Erfasste Informationen**

Mit Ihrer Berechtigung erfassen wir den Gerätestandort (GPS), während Sie die Spaziergang-Funktion nutzen. Wenn Hintergrundstandort aktiviert ist, können wir den Standort erfassen, während die App geschlossen ist oder während Sie andere Apps nutzen, um Ihre Spaziergangsroute aufzuzeichnen.

Um Wetter beim Spaziergangsbeginn anzuzeigen, können wir vorübergehend Breiten- und Längengrad an OpenWeatherMap senden und die resultierenden Wetterdaten dem Spaziergangsprotokoll zuordnen.

**Verwendungszweck**

- Aufzeichnung von Spaziergangsbeginn und -ende
- Berechnung der zurückgelegten Entfernung
- Anzeige von Routen auf einer Karte
- Anzeige und Aufzeichnung des Wetters zu Spaziergangsbeginn

**Handhabung**

Standort- und Routendaten werden in Cloud Firestore gespeichert und können nur von Nutzern in derselben Familiengruppe eingesehen werden. Wir erfassen keinen Standort für nicht damit zusammenhängende Zwecke, wenn Sie die Spaziergang-Funktion nicht nutzen. Die Genauigkeit kann je nach Geräteeinstellungen und Signalbedingungen variieren.

Auf dem Gerät können wir während eines aktiven Spaziergangs lokalen Speicher (AsyncStorage) nutzen, um die Route vorübergehend zu speichern. Dies wird entfernt, wenn der Spaziergang gespeichert oder verworfen wird.

---

### 2.4 Push-Benachrichtigungen

**Erfasste Informationen**

Mit Ihrer Berechtigung greifen wir auf die Benachrichtigungsfunktion des Geräts zu und erhalten ein Gerätetoken (Expo Push Token), das für die Zustellung von Push-Benachrichtigungen erforderlich ist.

**Verwendungszweck**

- Benachrichtigung von Familienmitgliedern, wenn ein Spaziergang endet
- Zustellung von Hinweisen und dienstbezogenen Nachrichten der App

**Handhabung**

Tokens werden in Cloud Firestore mit Ihrem Konto verknüpft gespeichert. Der Inhalt von Benachrichtigungen ist auf das für den Betrieb der App Erforderliche beschränkt. Wir nutzen Benachrichtigungen nicht für Werbung Dritter.

Sie können Benachrichtigungen jederzeit in den Geräte- oder OS-Benachrichtigungseinstellungen deaktivieren.

---

### 2.5 Authentifizierung und Konten

**Erfasste Informationen**

- Anonyme Nutzerkennung, die für Gast- (anonyme) Anmeldung ausgegeben wird
- Kontoinformationen bei Registrierung oder Anmeldung mit E-Mail und Passwort
- Kennungen, E-Mail-Adresse, Anzeigename usw., die über Google und Firebase Authentication bei Anmeldung mit Google empfangen werden (variiert je nach Google-Einstellungen und Einwilligung)
- Kennungen, E-Mail-Adresse (oder Apple Private Relay-Adresse), Anzeigename usw., die über Apple und Firebase Authentication bei Anmeldung mit Apple empfangen werden (variiert je nach Apple-Einstellungen und Einwilligung)
- Fortführung derselben Nutzerkennung beim Upgrade von einem Gastkonto zur Mitgliedsregistrierung

**Verwendungszweck**

Nutzerauthentifizierung, Schutz und Übertragung von Daten sowie Verwaltung der Teilnahme an Familiengruppen.

**Handhabung**

Authentifizierungsdaten werden von Firebase Authentication verwaltet. Wir sehen Passwörter nicht direkt ein und speichern sie nicht; sie werden sicher von der Authentifizierungsplattform verarbeitet. Von Google- oder Apple-Anmeldung empfangene Informationen werden nur zur Erstellung von Konten, Anmeldung oder Verknüpfung mit bestehenden Konten verwendet.

---

### 2.6 Premium-Funktionen und Abrechnung

**Erfasste Informationen**

- Premium-Status für die Familieneinheit (Ablaufdatum usw., einschließlich `premiumExpiresAt` in Cloud Firestore)
- Informationen zu Käufen, Wiederherstellung und Abonnementstatus über Apple App Store / Google Play
- Für die Abrechnung können Familien-ID (als App User ID verwendet), Kauftransaktions-Metadaten usw. an Abrechnungsplattformen wie RevenueCat (RevenueCat, Inc.) gesendet werden

**Verwendungszweck**

- Bereitstellung von Premium-Funktionen
- Verwaltung des Status, sodass **ein Abonnement pro Familie Premium für alle Mitglieder aktiviert, die denselben Familiencode teilen**
- Wiederherstellung von Käufen, Missbrauchsprävention und Support

**Handhabung**

- Die Zahlungsabwicklung (Kreditkartennummern usw.) wird von **Apple / Google** durchgeführt. Wir speichern keine Zahlungskarteninformationen.
- Abrechnung, Kündigung, Erstattungen und automatische Verlängerung folgen den Bedingungen und Verfahren des jeweiligen Stores.

---

## 3. Aufbewahrungsdauer

| Datentyp | Aufbewahrungsdauer |
|-----------|------------------|
| Konto-, Familien-, Haustier- und Spaziergangsdaten | Bis Sie Ihr Konto löschen oder bis das letzte Mitglied einer Familiengruppe sein Konto löscht |
| Gastkontodaten | Gelöscht, wenn Sie als Gast „Abmelden (Daten verwerfen)“ wählen |
| Push-Benachrichtigungstokens | Überschrieben oder gelöscht, wenn das Konto gelöscht wird oder das Gerät neu registriert wird |
| Vorübergehende Route auf dem Gerät während eines Spaziergangs | Gelöscht, wenn der Spaziergang gespeichert oder verworfen wird |

Soweit die Aufbewahrung nicht gesetzlich vorgeschrieben ist, bewahren wir Daten über die oben genannten Zeiträume hinaus nicht für nicht damit zusammenhängende Zwecke auf.

---

## 4. Löschung von Daten

Sie können Daten in der App wie folgt löschen.

### 4.1 Löschung eines Mitgliedskontos

Unter Einstellungen → „Konto löschen“ können Sie Ihr angemeldetes Mitgliedskonto löschen.

- Ihre Nutzerinformationen und Ihr Eintrag in der Familienmitgliederliste werden gelöscht.
- Wenn Sie das **letzte Mitglied** einer Familiengruppe sind, werden auch alle Haustiere, Spaziergangsprotokolle und Fotos (einschließlich Dateien in Cloud Storage), die mit dieser Familie verknüpft sind, gelöscht.
- Wenn **andere Familienmitglieder verbleiben**, bleiben gemeinsame Haustiere und Spaziergangsprotokolle erhalten; nur Ihre Kontoinformationen werden gelöscht.

Aus Sicherheitsgründen kann eine kürzliche erneute Anmeldung erforderlich sein. Melden Sie sich in diesem Fall ab, melden Sie sich erneut an und versuchen Sie die Löschung erneut.

### 4.2 Gast „Abmelden (Daten verwerfen)“

Wenn Sie sich als Gast abmelden und „Abmelden (Daten verwerfen)“ wählen, werden Cloud-Aufzeichnungen (Spaziergänge, Haustiere, Fotos usw.) und das anonyme Konto gelöscht und können nicht wiederhergestellt werden.

Um Ihre Daten zu behalten, nutzen Sie die kostenlose Mitgliedsregistrierung (Verknüpfung mit einem E-Mail-Konto). Wenn Sie von Gast zu Mitglied upgraden, werden bestehende Aufzeichnungen auf dasselbe Konto übertragen.

### 4.3 Abmeldung als Mitglied

Wenn sich ein Mitglied normal abmeldet, werden Cloud-Daten nicht gelöscht. Sie können bei der nächsten Anmeldung wieder darauf zugreifen.

### 4.4 Löschung auf Anfrage

Wenn Sie die oben genannten Methoden nicht nutzen können oder andere personenbezogene Daten löschen möchten, wenden Sie sich an die Adresse am Ende dieser Erklärung. Wir werden innerhalb einer angemessenen Frist antworten.

---

## 5. Drittanbieterdienste und Datenübermittlungen

Die App nutzt die nachstehenden Drittanbieterdienste für Speicherung, Authentifizierung, Karten, Wetter, Benachrichtigungen und App-Funktionalität. Daten können gemäß der Datenschutzerklärung jedes Dienstes gesendet werden. Wir verkaufen oder stellen die von Nutzern aufgezeichneten Inhalte nicht Dritten zu Werbezwecken zur Verfügung.

### 5.1 App-Plattform und Speicherung

| Punkt | Details |
|------|---------|
| Dienst | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Gesendete Daten | Kontoinformationen, Haustier- und Spaziergangsdaten, Bilder, Standort, Push-Tokens |
| Zweck | Authentifizierung, Cloud-Speicherung, Teilen innerhalb von Familien |
| Datenschutzerklärung | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Daten können auf Googles Cloud-Infrastruktur gespeichert und **außerhalb des Europäischen Wirtschaftsraums (EEA)** übermittelt werden (z. B. Japan, Vereinigte Staaten).

Wir stützen uns auf Googles Datenverarbeitungsbedingungen (einschließlich Datenschutzbestimmungen) und **Standard Contractual Clauses (SCC)** sowie andere angemessene Schutzmaßnahmen bei der Nutzung von Firebase.

### 5.2 Zustellung von Push-Benachrichtigungen

| Punkt | Details |
|------|---------|
| Dienst | Expo (Expo Push Notification Service) und Apple / Google Benachrichtigungsinfrastruktur |
| Gesendete Daten | Gerätetokens und Metadaten, die für die Zustellung erforderlich sind |
| Zweck | Zustellung von Push-Benachrichtigungen |
| Datenschutzerklärung | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Karten

Die App nutzt `react-native-maps`, um Spaziergangsrouten anzuzeigen. **Der Kartenanbieter hängt von Ihrem Geräte-OS ab.**

#### 5.3.1 Android

| Punkt | Details |
|------|---------|
| Dienst | Google Maps Platform |
| Gesendete Daten | Anfragedaten, die zur Anzeige von Karten erforderlich sind (Kommunikation vom Gerät zu Google) |
| Zweck | Anzeige von Spaziergangsrouten auf einer Karte |
| Datenschutzerklärung | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Punkt | Details |
|------|---------|
| Dienst | Apple Maps (MapKit) |
| Gesendete Daten | Anfragedaten, die zum Abrufen von Kartenkacheln erforderlich sind (Kommunikation vom Gerät zu Apple) |
| Zweck | Anzeige von Spaziergangsrouten auf einer Karte |
| Datenschutzerklärung | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Wetter (zu Spaziergangsbeginn)

| Punkt | Details |
|------|---------|
| Dienst | OpenWeatherMap |
| Gesendete Daten | Breiten- und Längengrad zu Spaziergangsbeginn |
| Zweck | Anzeige des Wetters zu Spaziergangsbeginn und Zuordnung zum Protokoll |
| Datenschutzerklärung | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 In-App-Käufe (Premium-Abonnements)

| Punkt | Details |
|------|---------|
| Dienst | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Gesendete Daten | Familien-ID (App User ID für Abrechnung), Transaktionsinformationen für Kauf/Wiederherstellung, Geräte- und Store-Metadaten |
| Zweck | Kauf und Wiederherstellung von Premium-Abonnements, Verwaltung des aktiven Status, Teilen von Funktionen innerhalb einer Familie |
| Datenschutzerklärung | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Weitergabe an Dritte

Wir ergreifen erforderliche und angemessene Sicherheitsmaßnahmen für die von uns verarbeiteten Informationen. Soweit nicht gesetzlich vorgeschrieben oder zum Schutz von Leben, Körper oder Eigentum erforderlich, geben wir personenbezogene Informationen ohne Einwilligung des Nutzers nicht an Dritte weiter.

Unter Mitgliedern, die einen Familiencode teilen, sind Haustierinformationen und Spaziergangsprotokolle by Design gegenseitig sichtbar. Nutzer sind für die Verwaltung von Familiencodes verantwortlich.

---

## 7. Ihre Rechte (einschließlich Nutzer in der EU)

Soweit das anwendbare Recht dies zulässt, können Ihnen folgende Rechte zustehen:

- **Auskunftsrecht**: Antrag auf Offenlegung der von uns über Sie gespeicherten personenbezogenen Daten
- **Recht auf Berichtigung**: Antrag auf Korrektur unrichtiger personenbezogener Daten
- **Recht auf Löschung**: Antrag auf Löschung personenbezogener Daten (über In-App-Löschung oder unsere Kontaktadresse)
- **Recht auf Einschränkung oder Widerspruch**: Unter bestimmten Bedingungen Einschränkung der Verarbeitung oder Widerspruch gegen die Verarbeitung
- **Recht auf Datenübertragbarkeit**: Antrag auf Export in einem strukturierten Format (JSON) über Einstellungen → „Daten exportieren“ (Zusammenfassung oder Vollversion; Fotos sind als Storage-URLs im JSON enthalten)

Nutzer mit Wohnsitz in der EU können das Recht haben, bei einer Aufsichtsbehörde in ihrem Wohnsitzland Beschwerde einzulegen.

---

## 8. Haftungsausschluss

Die App dient dazu, Haustierspaziergänge aufzuzeichnen und Informationen innerhalb von Familien zu teilen. Aufgezeichnete Entfernungen, Routen, Wetter und ähnliche Daten hängen vom Gerät, der Umgebung und den Einstellungen ab und entsprechen möglicherweise nicht exakt den tatsächlichen Spaziergängen. Wir haften nicht für Probleme oder Schäden, die aus der Nutzung der App entstehen.

Die App ersetzt keine Diagnose oder Behandlung durch einen Tierarzt. Wenn Ihr Haustier gesundheitliche Probleme hat, konsultieren Sie einen Tierarzt oder andere qualifizierte Fachkräfte.

---

## 9. Kontakt

Bei Fragen zu dieser Erklärung, Anträgen bezüglich personenbezogener Daten oder Support für die App wenden Sie sich an:

| Punkt | Details |
|------|---------|
| Handelsname | Annie Works |
| Vertreter | Toshiya Karimata |
| Geschäftstätigkeit | Planung, Entwicklung und Betrieb von Smartphone-Anwendungen |
| Adresse | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Kontakt | support@annie-works.com |

---

## 10. Änderungen dieser Erklärung

Wir können diese Erklärung überarbeiten, wenn sich Gesetze oder der Dienst ändern. Die überarbeitete Erklärung tritt in Kraft, wenn sie auf dieser Website oder ähnlichen Kanälen veröffentlicht wird. Bei wichtigen Änderungen können wir Sie in der App oder auf der Website informieren.

---

*Veröffentlicht unter: https://peppered-marigold-b52.notion.site/Annie-s-Walking-Log-Privacy-Policy-39daf1786c2780838a54e9b60efa0807*
