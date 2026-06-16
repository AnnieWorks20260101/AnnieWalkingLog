# Privacybeleid — Annie Walking Log

**Laatst bijgewerkt: 16 juni 2026**

Annie Works (“wij”, “ons” of “de Ontwikkelaar”) stelt dit Privacybeleid (“Beleid”) vast met betrekking tot de verwerking van persoonsgegevens en gebruikersgegevens in de applicatie Annie Walking Log (“de App”).

---

## 1. Verwerkingsverantwoordelijke

| Item | Details |
|------|---------|
| Handelsnaam | Annie Works |
| Vertegenwoordiger | Toshiya Karimata |
| Bedrijfsactiviteiten | Planning, ontwikkeling en exploitatie van applicaties |
| Adres | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

Het hierboven vermelde bedrijf is de verwerkingsverantwoordelijke voor persoonsgegevens die in de App worden verwerkt.

Voor vragen over dit Beleid of verzoeken om inzage, correctie of verwijdering van persoonsgegevens, neem contact met ons op via het bovenstaande e-mailadres. Wij accepteren geen vragen per telefoon. Wij accepteren vragen per post of e-mail.

### 1.1 Momenteel niet van toepassing zijnde zaken

Het volgende is niet van toepassing op de huidige werking van de App:

| Onderwerp | Details |
|-----------|---------|
| Geautomatiseerde besluitvorming / profilering | Wij nemen geen geautomatiseerde besluiten die juridische of vergelijkbare significante effecten op gebruikers hebben |
| Diensten voor kinderen | De App is niet bedoeld voor gebruikers jonger dan 16 jaar |
| EU-vertegenwoordiger (AVG artikel 27) | Als bedrijf gevestigd in Japan hebben wij op dit moment geen EU-vertegenwoordiger aangesteld. Vragen van inwoners van de EU worden afgehandeld via het bovenstaande e-mailcontact |
| Functionaris voor gegevensbescherming (FG) | Wij hebben geen FG aangesteld, omdat de verwerking op dit moment als kleinschalig kwalificeert |

### 1.2 Toestemming

Wanneer u de App start (gastgebruik, lidregistratie of login), gaat u akkoord met dit Beleid. Als wij dit Beleid wijzigen (anders dan typografische correcties), kunnen wij u vragen opnieuw akkoord te gaan wanneer u de app start of inlogt. Als u niet akkoord gaat, kunt u uitloggen en stoppen met het gebruik van de App.

Machtigingen voor locatie, camera, meldingen en vergelijkbare functies worden afzonderlijk aangevraagd via de machtigingsdialogen van het besturingssysteem wanneer u elke functie gebruikt. U kunt meldingen op elk moment uitschakelen in de apparaatinstellingen.

Wij registreren de datum en tijd van toestemming voor dit Beleid en de versie van het Beleid op uw apparaat en in de cloud (Firebase).

---

## 2. Informatie die wij verzamelen en doeleinden van gebruik

De App verzamelt en gebruikt de onderstaande informatie om wandellogs te beheren, gegevens binnen gezinnen te delen, gegevens te back-uppen naar de cloud en de servicekwaliteit te verbeteren. Tenzij noodzakelijk voor onze operaties, beoordelen wij de door gebruikers geregistreerde inhoud niet individueel.

### 2.1 Door u ingevoerde informatie

**Verzamelde informatie**

- **Accountinformatie**: Weergavenaam, e-mailadres (bij registratie), authenticatiemethode (gast / e-mail)
- **Huisdierinformatie**: Naam, ras/type, geslacht, verjaardag, adoptiedag, afscheidsdatum (optioneel), groepsnaam (optioneel), profielfoto
- **Wandellogs**: Start-/eindtijd, afstand, duur, GPS-route (breedte-/lengtegraadcoördinaten), huisdieren op de wandeling, locaties van poep/aangepaste markeringen, memo’s, foto’s genomen tijdens wandelingen, weersmomentopname bij start van de wandeling (temperatuur, weerpictogram, enz.)
- **Gezinscode**: Identificatie voor deelname aan en delen van een gezinsgroep (family ID in Firestore)

**Doel van gebruik**

Het aanmaken, opslaan en bekijken van wandellogs voor huisdieren, het delen van logs binnen gezinnen en het veilig back-uppen van gegevens naar de cloud.

**Verwerking**

Door u ingevoerde gegevens worden opgeslagen op Google Firebase (Cloud Firestore, Cloud Storage) met versleutelde communicatie (HTTPS). Alleen gezinsleden die dezelfde gezinscode delen en legitieme toegang hebben, kunnen deze bekijken.

**Rechtsgrond (referentie voor gebruikers in de EU)**

Verwerking is gebaseerd op uitvoering van een contract dat nodig is om de Dienst te leveren en op uw toestemming (inclusief apparaatmachtigingen voor locatie, camera, meldingen, enz.).

---

### 2.2 Camera en foto’s

**Verzamelde informatie**

Alleen verzameld wanneer u toestemming geeft en de apparaatcamera of fotobibliotheek gebruikt.

**Doel van gebruik**

- Profielfoto’s van huisdieren registreren
- Wandelfoto’s tijdens of na wandelingen maken en opslaan in de cloud
- Optioneel foto’s opslaan in de fotobibliotheek van het apparaat (op basis van instellingen)

**Verwerking**

Afbeeldingen worden opgeslagen in Firebase Cloud Storage en kunnen alleen worden bekeken door gebruikers in dezelfde gezinsgroep. Wij maken geen afbeeldingen op de achtergrond en verzamelen geen afbeeldingen voor niet-gerelateerde doeleinden.

---

### 2.3 Locatie-informatie

**Verzamelde informatie**

Met uw toestemming verzamelen wij apparaatlocatie (GPS) terwijl u de wandelfunctie gebruikt. Als achtergrondlocatie is ingeschakeld, kunnen wij locatie verzamelen terwijl de app is gesloten of terwijl u andere apps gebruikt om uw wandelroute te registreren.

Om weer te tonen wanneer een wandeling start, kunnen wij tijdelijk breedte- en lengtegraad naar OpenWeatherMap sturen en de resulterende weergegevens aan het wandelrecord koppelen.

**Doel van gebruik**

- Start en einde van de wandeling registreren
- Afgelegde afstand berekenen
- Routes op een kaart weergeven
- Weer bij start van de wandeling tonen en registreren

**Verwerking**

Locatie- en routgegevens worden opgeslagen in Cloud Firestore en kunnen alleen worden bekeken door gebruikers in dezelfde gezinsgroep. Wij verzamelen geen locatie voor niet-gerelateerde doeleinden wanneer u de wandelfunctie niet gebruikt. Nauwkeurigheid kan variëren afhankelijk van apparaatinstellingen en signaalomstandigheden.

Op het apparaat kunnen wij lokale opslag (AsyncStorage) alleen tijdens een actieve wandeling gebruiken om de route tijdelijk op te slaan. Dit wordt verwijderd wanneer de wandeling wordt opgeslagen of verwijderd.

---

### 2.4 Pushmeldingen

**Verzamelde informatie**

Met uw toestemming hebben wij toegang tot de meldingsfunctie van het apparaat en verkrijgen wij een apparaattoken (Expo Push Token) dat nodig is om pushmeldingen te leveren.

**Doel van gebruik**

- Gezinsleden informeren wanneer een wandeling eindigt
- Mededelingen en servicegerelateerde berichten van de App leveren

**Verwerking**

Tokens worden opgeslagen in Cloud Firestore gekoppeld aan uw account. Meldingsinhoud is beperkt tot wat nodig is om de App te bedienen. Wij gebruiken meldingen niet voor advertenties van derden.

U kunt meldingen op elk moment uitschakelen in apparaat- of OS-meldingsinstellingen.

---

### 2.5 Authenticatie en accounts

**Verzamelde informatie**

- Anonieme gebruikersidentificatie uitgegeven voor gastlogin (anoniem)
- Accountinformatie bij registratie of login met e-mail en wachtwoord
- Identificaties, e-mailadres, weergavenaam, enz. ontvangen via Google en Firebase Authentication bij inloggen met Google (varieert op basis van uw Google-instellingen en toestemming)
- Identificaties, e-mailadres (of Apple private relay-adres), weergavenaam, enz. ontvangen via Apple en Firebase Authentication bij inloggen met Apple (varieert op basis van uw Apple-instellingen en toestemming)
- Voortzetting van dezelfde gebruikersidentificatie bij upgrade van gastaccount naar lidregistratie

**Doel van gebruik**

Gebruikersauthenticatie, bescherming en overdracht van gegevens, en beheer van deelname aan gezinsgroepen.

**Verwerking**

Authenticatiegegevens worden beheerd door Firebase Authentication. Wij bekijken of slaan wachtwoorden niet direct op; deze worden veilig afgehandeld door het authenticatieplatform. Informatie ontvangen via Google- of Apple-login wordt alleen gebruikt om accounts aan te maken, in te loggen of te koppelen aan bestaande accounts.

---

### 2.6 Premium-functies en facturering

**Verzamelde informatie**

- Premium-status voor de gezinseenheid (vervaldatum, enz., inclusief `premiumExpiresAt` in Cloud Firestore)
- Informatie gerelateerd aan aankopen, herstel en abonnementsstatus via Apple App Store / Google Play
- Voor facturering kunnen family ID (gebruikt als App User ID), metadata van aankooptransacties, enz. worden verzonden naar factureringsplatforms zoals RevenueCat (RevenueCat, Inc.)

**Doel van gebruik**

- Premium-functies leveren
- Status beheren zodat **één abonnement per gezin Premium activeert voor alle leden die dezelfde gezinscode delen**
- Aankopen herstellen, misbruik voorkomen en ondersteuning bieden

**Verwerking**

- Betalingsverwerking (creditcardnummers, enz.) wordt afgehandeld door **Apple / Google**. Wij slaan geen betaalkaartinformatie op.
- Facturering, opzegging, restituties en automatische verlenging volgen de voorwaarden en procedures van elke store.

---

## 3. Bewaartermijn

| Gegevenstype | Bewaartermijn |
|--------------|---------------|
| Account-, gezins-, huisdier- en wandelgegevens | Tot u uw account verwijdert, of tot het laatste lid van een gezinsgroep zijn account verwijdert |
| Gastaccountgegevens | Verwijderd wanneer u “Uitloggen (gegevens verwijderen)” uitvoert terwijl u nog gast bent |
| Pushmeldingtokens | Overschreven of verwijderd wanneer het account wordt verwijderd of het apparaat opnieuw wordt geregistreerd |
| Tijdelijke route op apparaat tijdens een wandeling | Verwijderd wanneer de wandeling wordt opgeslagen of verwijderd |

Tenzij bewaring wettelijk vereist is, bewaren wij gegevens niet langer dan de bovenstaande perioden voor niet-gerelateerde doeleinden.

---

## 4. Gegevens verwijderen

U kunt gegevens in de App als volgt verwijderen.

### 4.1 Verwijderen van een lidaccount

Via Instellingen → “Account verwijderen” kunt u uw ingelogde lidaccount verwijderen.

- Uw gebruikersinformatie en uw vermelding in de gezinsledenlijst worden verwijderd.
- Als u het **laatste lid** van een gezinsgroep bent, worden ook alle huisdieren, wandellogs en foto’s (inclusief bestanden in Cloud Storage) gekoppeld aan dat gezin verwijderd.
- Als **andere gezinsleden blijven**, blijven gedeelde huisdieren en wandellogs behouden; alleen uw accountinformatie wordt verwijderd.

Voor de veiligheid kan een recente herlogin vereist zijn. Log in dat geval uit, log opnieuw in en probeer de verwijdering opnieuw.

### 4.2 Gast “Uitloggen (gegevens verwijderen)”

Als u als gast uitlogt en “Uitloggen (gegevens verwijderen)” kiest, worden cloudrecords (wandelingen, huisdieren, foto’s, enz.) en het anonieme account verwijderd en kunnen niet worden hersteld.

Om uw gegevens te behouden, gebruik gratis lidregistratie (koppel een e-mailaccount). Als u upgradet van gast naar lid, worden bestaande records overgezet naar hetzelfde account.

### 4.3 Uitloggen als lid

Als een lid normaal uitlogt, worden clouddata niet verwijderd. U kunt deze opnieuw openen bij de volgende login.

### 4.4 Verwijdering op verzoek

Als u het bovenstaande niet kunt gebruiken of andere persoonsgegevens wilt verwijderen, neem contact met ons op via het adres aan het einde van dit Beleid. Wij reageren binnen een redelijke termijn.

---

## 5. Diensten van derden en gegevensoverdrachten

De App gebruikt de onderstaande diensten van derden voor opslag, authenticatie, kaarten, weer, meldingen en app-functionaliteit. Gegevens kunnen worden verzonden zoals vereist door het privacybeleid van elke dienst. Wij verkopen of verstrekken door gebruikers geregistreerde inhoud niet aan derden voor advertenties.

### 5.1 App-platform en opslag

| Item | Details |
|------|---------|
| Dienst | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Verzonden gegevens | Accountinformatie, huisdier- en wandelgegevens, afbeeldingen, locatie, pushtokens |
| Doel | Authenticatie, cloudopslag, delen binnen gezinnen |
| Privacybeleid | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Gegevens kunnen worden opgeslagen op de cloudinfrastructuur van Google en **worden overgedragen buiten de Europese Economische Ruimte (EER)** (bijv. Japan, Verenigde Staten).

Wij vertrouwen op de gegevensverwerkingsvoorwaarden van Google (inclusief gegevensbeschermingsbepalingen) en **Standaard Contractuele Clausules (SCC)** en andere passende waarborgen bij gebruik van Firebase.

### 5.2 Levering van pushmeldingen

| Item | Details |
|------|---------|
| Dienst | Expo (Expo Push Notification Service) en Apple / Google meldingsinfrastructuur |
| Verzonden gegevens | Apparaattokens en metadata nodig voor levering |
| Doel | Pushmeldingen leveren |
| Privacybeleid | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Kaarten

De App gebruikt `react-native-maps` om wandelroutes weer te geven. **De kaartaanbieder hangt af van het besturingssysteem van uw apparaat.**

#### 5.3.1 Android

| Item | Details |
|------|---------|
| Dienst | Google Maps Platform |
| Verzonden gegevens | Aanvraaggegevens nodig om kaarten weer te geven (communicatie van apparaat naar Google) |
| Doel | Wandelroutes op een kaart weergeven |
| Privacybeleid | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Item | Details |
|------|---------|
| Dienst | Apple Maps (MapKit) |
| Verzonden gegevens | Aanvraaggegevens nodig om kaarttegels op te halen (communicatie van apparaat naar Apple) |
| Doel | Wandelroutes op een kaart weergeven |
| Privacybeleid | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Weer (bij start van wandeling)

| Item | Details |
|------|---------|
| Dienst | OpenWeatherMap |
| Verzonden gegevens | Breedte- en lengtegraad bij start van wandeling |
| Doel | Weer bij start van wandeling tonen en aan het record koppelen |
| Privacybeleid | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 In-app aankopen (Premium-abonnementen)

| Item | Details |
|------|---------|
| Dienst | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Verzonden gegevens | Family ID (App User ID voor facturering), transactie-informatie voor aankoop/herstel, apparaat- en store-metadata |
| Doel | Premium-abonnementen kopen en herstellen, actieve status beheren, functies binnen een gezin delen |
| Privacybeleid | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Verstrekking aan derden

Wij nemen noodzakelijke en passende beveiligingsmaatregelen voor de informatie die wij verwerken. Tenzij wettelijk vereist of om leven, lichaam of eigendom te beschermen, verstrekken wij geen persoonsgegevens aan derden zonder toestemming van de gebruiker.

Onder leden die een gezinscode delen, zijn huisdierinformatie en wandellogs onderling zichtbaar by design. Gebruikers zijn verantwoordelijk voor het beheren van gezinscodes.

---

## 7. Uw rechten (inclusief gebruikers in de EU)

Voor zover toepasselijk recht dit toestaat, kunt u de volgende rechten hebben:

- **Recht op inzage**: Verzoeken om openbaarmaking van persoonsgegevens die wij over u bewaren
- **Recht op rectificatie**: Verzoeken om correctie van onjuiste persoonsgegevens
- **Recht op verwijdering**: Verzoeken om verwijdering van persoonsgegevens (via verwijdering in de app of ons contactadres)
- **Recht op beperking of bezwaar**: Onder bepaalde voorwaarden verwerking beperken of bezwaar maken tegen verwerking
- **Recht op gegevensoverdraagbaarheid**: Export aanvragen in een gestructureerd formaat (JSON) via Instellingen → “Gegevens exporteren” (samenvatting of volledige versie; foto’s zijn opgenomen als Storage-URL’s in JSON)

Gebruikers woonachtig in de EU kunnen het recht hebben om een klacht in te dienen bij een toezichthoudende autoriteit in hun land van verblijf.

---

## 8. Disclaimer

De App is bedoeld om wandelingen met huisdieren te registreren en informatie binnen gezinnen te delen. Geregistreerde afstand, routes, weer en vergelijkbare gegevens hangen af van het apparaat, de omgeving en instellingen en komen mogelijk niet exact overeen met werkelijke wandelingen. Wij zijn niet aansprakelijk voor problemen of schade voortvloeiend uit het gebruik van de App.

De App vervangt geen diagnose of behandeling door een dierenarts. Als uw huisdier gezondheidsproblemen heeft, raadpleeg dan een dierenarts of andere gekwalificeerde professional.

---

## 9. Contact

Voor vragen over dit Beleid, verzoeken met betrekking tot persoonsgegevens of ondersteuning voor de App, neem contact op:

| Item | Details |
|------|---------|
| Handelsnaam | Annie Works |
| Vertegenwoordiger | Toshiya Karimata |
| Bedrijfsactiviteiten | Planning, ontwikkeling en exploitatie van smartphone-applicaties |
| Adres | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

---

## 10. Wijzigingen van dit Beleid

Wij kunnen dit Beleid herzien wanneer wetten of de Dienst wijzigen. Het herziene Beleid treedt in werking wanneer het op deze website of vergelijkbare kanalen wordt gepubliceerd. Voor belangrijke wijzigingen kunnen wij u informeren in de App of op de website.

---

*Gepubliceerd op: https://www.annie-works.com/nl/AnnieWalkingLog/Privacy-Policy*
