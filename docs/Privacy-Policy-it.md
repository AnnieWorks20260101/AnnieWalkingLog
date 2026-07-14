# Informativa sulla privacy — Registro passeggiate di Annie

**Ultimo aggiornamento: 16 giugno 2026**

Annie Works (“noi”, “ci” o “lo Sviluppatore”) stabilisce la presente Informativa sulla privacy (“Informativa”) in merito al trattamento delle informazioni personali e dei dati degli utenti nell’applicazione Registro passeggiate di Annie (“l’App”).

---

## 1. Titolare del trattamento

| Voce | Dettagli |
|------|----------|
| Denominazione commerciale | Annie Works |
| Rappresentante | Toshiya Karimata |
| Attività | Pianificazione, sviluppo e gestione di applicazioni |
| Indirizzo | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contatto | support@annie-works.com |

L’attività sopra indicata è il titolare del trattamento dei dati personali trattati nell’App.

Per richieste relative alla presente Informativa o per richieste di accesso, rettifica o cancellazione dei dati personali, contattateci all’indirizzo e-mail sopra indicato. Non accettiamo richieste telefoniche. Accettiamo richieste per posta o e-mail.

### 1.1 Questioni attualmente non applicabili

Quanto segue non si applica al funzionamento attuale dell’App:

| Argomento | Dettagli |
|-----------|----------|
| Decisioni automatizzate / profilazione | Non adottiamo decisioni automatizzate che producano effetti giuridici o effetti significativi simili sugli utenti |
| Servizi per minori | L’App non è destinata a utenti di età inferiore ai 16 anni |
| Rappresentante UE (GDPR articolo 27) | In qualità di attività con sede in Giappone, al momento non abbiamo nominato un rappresentante UE. Le richieste dei residenti UE sono gestite tramite il contatto e-mail sopra indicato |
| Responsabile della protezione dei dati (DPO) | Non abbiamo nominato un DPO, poiché il trattamento rientra attualmente in attività di piccola scala |

### 1.2 Consenso

Quando iniziate a utilizzare l’App (utilizzo come ospite, registrazione come membro o login), accettate la presente Informativa. Se modifichiamo la presente Informativa (salvo correzioni tipografiche), potremmo chiedervi di accettare nuovamente all’avvio dell’app o al login. Se non accettate, potete disconnettervi e cessare l’utilizzo dell’App.

I permessi per posizione, fotocamera, notifiche e funzionalità simili vengono richiesti separatamente tramite le finestre di dialogo dei permessi del sistema operativo quando utilizzate ciascuna funzionalità. Potete disattivare le notifiche in qualsiasi momento nelle impostazioni del dispositivo.

Registriamo la data e l’ora del consenso alla presente Informativa e la versione dell’Informativa sul vostro dispositivo e nel cloud (Firebase).

---

## 2. Informazioni che raccogliamo e finalità del trattamento

L’App raccoglie e utilizza le informazioni di seguito per gestire i registri delle passeggiate, condividere dati all’interno delle famiglie, eseguire il backup dei dati nel cloud e migliorare la qualità del servizio. Salvo quando necessario per le nostre operazioni, non esaminiamo individualmente i contenuti registrati dagli utenti.

### 2.1 Informazioni inserite dall’utente

**Informazioni raccolte**

- **Informazioni sull’account**: Nome visualizzato, indirizzo e-mail (in caso di registrazione), metodo di autenticazione (ospite / e-mail)
- **Informazioni sull’animale domestico**: Nome, razza/tipo, sesso, data di nascita, giorno di adozione, data di addio (facoltativa), nome del gruppo (facoltativo), foto del profilo
- **Registri delle passeggiate**: Ora di inizio/fine, distanza, durata, percorso GPS (coordinate latitudine/longitudine), animali domestici presenti nella passeggiata, posizioni di feci/segni personalizzati, memo, foto scattate durante le passeggiate, istantanea meteo all’inizio della passeggiata (temperatura, icona meteo, ecc.)
- **Codice famiglia**: Identificatore per unirsi e condividere un gruppo familiare (family ID in Firestore)

**Finalità del trattamento**

Creare, archiviare e visualizzare i registri delle passeggiate degli animali domestici, condividere i registri all’interno delle famiglie ed eseguire in modo sicuro il backup dei dati nel cloud.

**Trattamento**

I dati inseriti vengono archiviati su Google Firebase (Cloud Firestore, Cloud Storage) utilizzando comunicazioni crittografate (HTTPS). Solo i membri della famiglia che condividono lo stesso codice famiglia e dispongono di un accesso legittimo possono visualizzarli.

**Base giuridica (riferimento per utenti nell’UE)**

Il trattamento si basa sull’esecuzione di un contratto necessario per fornire il Servizio e sul vostro consenso (inclusi i permessi del dispositivo per posizione, fotocamera, notifiche, ecc.).

---

### 2.2 Fotocamera e foto

**Informazioni raccolte**

Raccolte solo quando concedete il permesso e utilizzate la fotocamera del dispositivo o la libreria foto.

**Finalità del trattamento**

- Registrare le foto del profilo degli animali domestici
- Scattare e archiviare foto delle passeggiate durante o dopo le passeggiate nel cloud
- Salvare facoltativamente le foto nella libreria foto del dispositivo (in base alle impostazioni)

**Trattamento**

Le immagini vengono archiviate in Firebase Cloud Storage e possono essere visualizzate solo dagli utenti dello stesso gruppo familiare. Non acquisiamo immagini in background né raccogliamo immagini per finalità non correlate.

---

### 2.3 Informazioni sulla posizione

**Informazioni raccolte**

Con il vostro permesso, raccogliamo la posizione del dispositivo (GPS) mentre utilizzate la funzionalità passeggiata. Se la posizione in background è abilitata, possiamo raccogliere la posizione mentre l’app è chiusa o mentre utilizzate altre app al fine di registrare il percorso della passeggiata.

Per mostrare il meteo all’inizio di una passeggiata, possiamo inviare temporaneamente latitudine e longitudine a OpenWeatherMap e allegare i dati meteo risultanti al registro della passeggiata.

**Finalità del trattamento**

- Registrare l’inizio e la fine della passeggiata
- Calcolare la distanza percorsa
- Visualizzare i percorsi su una mappa
- Mostrare e registrare il meteo all’inizio della passeggiata

**Trattamento**

I dati di posizione e percorso vengono archiviati in Cloud Firestore e possono essere visualizzati solo dagli utenti dello stesso gruppo familiare. Non raccogliamo la posizione per finalità non correlate quando non utilizzate la funzionalità passeggiata. L’accuratezza può variare in base alle impostazioni del dispositivo e alle condizioni del segnale.

Sul dispositivo, possiamo utilizzare l’archiviazione locale (AsyncStorage) solo durante una passeggiata attiva per archiviare temporaneamente il percorso. Viene rimosso quando la passeggiata viene salvata o eliminata.

---

### 2.4 Notifiche push

**Informazioni raccolte**

Con il vostro permesso, accediamo alla funzionalità di notifica del dispositivo e otteniamo un token del dispositivo (Expo Push Token) necessario per inviare notifiche push.

**Finalità del trattamento**

- Notificare i membri della famiglia quando una passeggiata termina
- Inviare avvisi e messaggi relativi al servizio dall’App

**Trattamento**

I token vengono archiviati in Cloud Firestore collegati al vostro account. Il contenuto delle notifiche è limitato a quanto necessario per gestire l’App. Non utilizziamo le notifiche per pubblicità di terzi.

Potete disattivare le notifiche in qualsiasi momento nelle impostazioni di notifica del dispositivo o del sistema operativo.

---

### 2.5 Autenticazione e account

**Informazioni raccolte**

- Identificatore utente anonimo emesso per il login ospite (anonimo)
- Informazioni sull’account in caso di registrazione o login con e-mail e password
- Identificatori, indirizzo e-mail, nome visualizzato, ecc. ricevuti tramite Google e Firebase Authentication in caso di accesso con Google (varia in base alle impostazioni e al consenso Google)
- Identificatori, indirizzo e-mail (o indirizzo relay privato Apple), nome visualizzato, ecc. ricevuti tramite Apple e Firebase Authentication in caso di accesso con Apple (varia in base alle impostazioni e al consenso Apple)
- Continuità dello stesso identificatore utente in caso di upgrade da account ospite a registrazione come membro

**Finalità del trattamento**

Autenticazione degli utenti, protezione e trasferimento dei dati e gestione della partecipazione ai gruppi familiari.

**Trattamento**

I dati di autenticazione sono gestiti da Firebase Authentication. Non visualizziamo né archiviamo direttamente le password; sono gestite in modo sicuro dalla piattaforma di autenticazione. Le informazioni ricevute dall’accesso con Google o Apple sono utilizzate solo per creare account, effettuare il login o collegarsi ad account esistenti.

---

### 2.6 Funzionalità Premium e fatturazione

**Informazioni raccolte**

- Stato Premium per l’unità familiare (scadenza, ecc., incluso `premiumExpiresAt` in Cloud Firestore)
- Informazioni relative ad acquisti, ripristino e stato dell’abbonamento tramite Apple App Store / Google Play
- Per la fatturazione, family ID (utilizzato come App User ID), metadati delle transazioni di acquisto, ecc. possono essere inviati a piattaforme di fatturazione come RevenueCat (RevenueCat, Inc.)

**Finalità del trattamento**

- Fornire le funzionalità Premium
- Gestire lo stato affinché **un abbonamento per famiglia abiliti il Premium per tutti i membri che condividono lo stesso codice famiglia**
- Ripristinare gli acquisti, prevenire usi impropri e fornire assistenza

**Trattamento**

- L’elaborazione dei pagamenti (numeri di carta di credito, ecc.) è gestita da **Apple / Google**. Non archiviamo informazioni sulle carte di pagamento.
- Fatturazione, cancellazione, rimborsi e rinnovo automatico seguono i termini e le procedure di ciascuno store.

---

## 3. Periodo di conservazione

| Tipo di dato | Periodo di conservazione |
|--------------|--------------------------|
| Dati di account, famiglia, animali domestici e passeggiate | Fino all’eliminazione del vostro account, o fino a quando l’ultimo membro di un gruppo familiare elimina il proprio account |
| Dati dell’account ospite | Eliminati quando eseguite “Disconnetti (elimina dati)” mentre siete ancora ospiti |
| Token delle notifiche push | Sovrascritti o eliminati quando l’account viene eliminato o il dispositivo viene registrato nuovamente |
| Percorso temporaneo sul dispositivo durante una passeggiata | Eliminato quando la passeggiata viene salvata o eliminata |

Salvo quando la conservazione è richiesta dalla legge, non conserviamo i dati oltre i periodi sopra indicati per finalità non correlate.

---

## 4. Cancellazione dei dati

Potete eliminare i dati nell’App come segue.

### 4.1 Eliminazione di un account membro

Da Impostazioni → “Elimina account”, potete eliminare il vostro account membro con cui avete effettuato il login.

- Le vostre informazioni utente e la vostra voce nell’elenco dei membri della famiglia vengono eliminate.
- Se siete l’**ultimo membro** di un gruppo familiare, vengono eliminati anche tutti gli animali domestici, i registri delle passeggiate e le foto (inclusi i file in Cloud Storage) collegati a quella famiglia.
- Se **rimangono altri membri della famiglia**, gli animali domestici condivisi e i registri delle passeggiate restano; viene eliminata solo la vostra informazione sull’account.

Per motivi di sicurezza, può essere richiesto un nuovo login recente. In tal caso, disconnettetevi, effettuate nuovamente il login e riprovate l’eliminazione.

### 4.2 “Disconnetti (elimina dati)” per ospiti

Se vi disconnettete come ospite e scegliete “Disconnetti (elimina dati)”, i registri nel cloud (passeggiate, animali domestici, foto, ecc.) e l’account anonimo vengono eliminati e non possono essere ripristinati.

Per conservare i vostri dati, utilizzate la registrazione gratuita come membro (collegare un account e-mail). Se effettuate l’upgrade da ospite a membro, i registri esistenti vengono trasferiti allo stesso account.

### 4.3 Disconnessione membro

Se un membro si disconnette normalmente, i dati nel cloud non vengono eliminati. Potete accedervi nuovamente al login successivo.

### 4.4 Cancellazione su richiesta

Se non potete utilizzare quanto sopra o desiderate eliminare altri dati personali, contattateci all’indirizzo indicato alla fine della presente Informativa. Risponderemo entro un periodo ragionevole.

---

## 5. Servizi di terzi e trasferimenti di dati

L’App utilizza i servizi di terzi di seguito per archiviazione, autenticazione, mappe, meteo, notifiche e funzionalità dell’app. I dati possono essere inviati come richiesto dall’informativa sulla privacy di ciascun servizio. Non vendiamo né forniamo a terzi i contenuti registrati dagli utenti per finalità pubblicitarie.

### 5.1 Piattaforma dell’app e archiviazione

| Voce | Dettagli |
|------|----------|
| Servizio | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Dati inviati | Informazioni sull’account, dati su animali domestici e passeggiate, immagini, posizione, token push |
| Finalità | Autenticazione, archiviazione cloud, condivisione all’interno delle famiglie |
| Informativa sulla privacy | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

I dati possono essere archiviati sull’infrastruttura cloud di Google e **trasferiti al di fuori dello Spazio economico europeo (SEE)** (ad es. Giappone, Stati Uniti).

Ci basiamo sui termini di trattamento dei dati di Google (incluse le disposizioni sulla protezione dei dati) e sulle **Clausole contrattuali standard (SCC)** e altre garanzie appropriate quando utilizziamo Firebase.

### 5.2 Invio di notifiche push

| Voce | Dettagli |
|------|----------|
| Servizio | Expo (Expo Push Notification Service) e infrastruttura di notifica Apple / Google |
| Dati inviati | Token del dispositivo e metadati necessari per l’invio |
| Finalità | Inviare notifiche push |
| Informativa sulla privacy | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Mappe

L’App utilizza `react-native-maps` per visualizzare i percorsi delle passeggiate. **Il fornitore della mappa dipende dal sistema operativo del vostro dispositivo.**

#### 5.3.1 Android

| Voce | Dettagli |
|------|----------|
| Servizio | Google Maps Platform |
| Dati inviati | Dati di richiesta necessari per visualizzare le mappe (comunicazione dal dispositivo a Google) |
| Finalità | Visualizzare i percorsi delle passeggiate su una mappa |
| Informativa sulla privacy | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Voce | Dettagli |
|------|----------|
| Servizio | Apple Maps (MapKit) |
| Dati inviati | Dati di richiesta necessari per recuperare le tile della mappa (comunicazione dal dispositivo ad Apple) |
| Finalità | Visualizzare i percorsi delle passeggiate su una mappa |
| Informativa sulla privacy | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Meteo (all’inizio della passeggiata)

| Voce | Dettagli |
|------|----------|
| Servizio | OpenWeatherMap |
| Dati inviati | Latitudine e longitudine all’inizio della passeggiata |
| Finalità | Mostrare il meteo all’inizio della passeggiata e allegarlo al registro |
| Informativa sulla privacy | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 Acquisti in-app (abbonamenti Premium)

| Voce | Dettagli |
|------|----------|
| Servizio | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Dati inviati | Family ID (App User ID per la fatturazione), informazioni sulle transazioni per acquisto/ripristino, metadati del dispositivo e dello store |
| Finalità | Acquistare e ripristinare abbonamenti Premium, gestire lo stato attivo, condividere funzionalità all’interno di una famiglia |
| Informativa sulla privacy | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Comunicazione a terzi

Adottiamo misure di sicurezza necessarie e appropriate per le informazioni che trattiamo. Salvo quando richiesto dalla legge o per proteggere la vita, l’integrità fisica o i beni, non forniamo informazioni personali a terzi senza il consenso dell’utente.

Tra i membri che condividono un codice famiglia, le informazioni sugli animali domestici e i registri delle passeggiate sono reciprocamente visibili per progettazione. Gli utenti sono responsabili della gestione dei codici famiglia.

---

## 7. I vostri diritti (inclusi gli utenti nell’UE)

Laddove la legge applicabile lo consenta, potreste avere i seguenti diritti:

- **Diritto di accesso**: Richiedere la comunicazione dei dati personali che conserviamo su di voi
- **Diritto di rettifica**: Richiedere la correzione di dati personali inesatti
- **Diritto alla cancellazione**: Richiedere la cancellazione dei dati personali (tramite eliminazione nell’app o il nostro indirizzo di contatto)
- **Diritto di limitazione o opposizione**: In determinate condizioni, limitare il trattamento o opporsi al trattamento
- **Diritto alla portabilità dei dati**: Richiedere l’esportazione in un formato strutturato (JSON) tramite Impostazioni → “Esporta dati” (versione riepilogativa o completa; le foto sono incluse come URL Storage nel JSON)

Gli utenti residenti nell’UE possono avere il diritto di presentare reclamo a un’autorità di controllo nel proprio paese di residenza.

---

## 8. Esclusione di responsabilità

L’App è destinata ad aiutare a registrare le passeggiate degli animali domestici e a condividere informazioni all’interno delle famiglie. Distanza registrata, percorsi, meteo e dati simili dipendono dal dispositivo, dall’ambiente e dalle impostazioni e potrebbero non corrispondere esattamente alle passeggiate effettive. Non siamo responsabili per problemi o danni derivanti dall’utilizzo dell’App.

L’App non sostituisce la diagnosi o il trattamento da parte di un veterinario. Se il vostro animale domestico presenta problemi di salute, consultate un veterinario o un altro professionista qualificato.

---

## 9. Contatti

Per domande sulla presente Informativa, richieste relative ai dati personali o assistenza per l’App, contattate:

| Voce | Dettagli |
|------|----------|
| Denominazione commerciale | Annie Works |
| Rappresentante | Toshiya Karimata |
| Attività | Pianificazione, sviluppo e gestione di applicazioni per smartphone |
| Indirizzo | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contatto | support@annie-works.com |

---

## 10. Modifiche alla presente Informativa

Possiamo modificare la presente Informativa quando cambiano le leggi o il Servizio. L’Informativa modificata entra in vigore quando viene pubblicata su questo sito web o su canali simili. Per modifiche importanti, potremmo informarvi nell’App o sul sito web.

---

*Pubblicato su: https://www.annie-works.com/it/AnnieWalkingLog/Privacy-Policy*
