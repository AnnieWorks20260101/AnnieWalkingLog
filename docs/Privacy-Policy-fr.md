# Politique de confidentialité — Le journal de balade d'Annie

**Dernière mise à jour : 16 juin 2026**

Annie Works (« nous », « notre » ou « le Développeur ») établit la présente Politique de confidentialité (la « Politique ») concernant le traitement des informations personnelles et des données utilisateur dans l'application Le journal de balade d'Annie (l'« Application »).

---

## 1. Responsable du traitement

| Élément | Détails |
|------|---------|
| Nom commercial | Annie Works |
| Représentant | Toshiya Karimata |
| Activités | Conception, développement et exploitation d'applications |
| Adresse | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

L'entreprise mentionnée ci-dessus est le responsable du traitement des données personnelles traitées dans l'Application.

Pour toute question concernant la présente Politique ou pour toute demande d'accès, de rectification ou de suppression de données personnelles, veuillez nous contacter à l'adresse e-mail ci-dessus. Nous n'acceptons pas les demandes par téléphone. Nous acceptons les demandes par courrier ou par e-mail.

### 1.1 Points non applicables actuellement

Les éléments suivants ne s'appliquent pas au fonctionnement actuel de l'Application :

| Sujet | Détails |
|-------|---------|
| Prise de décision automatisée / profilage | Nous ne prenons pas de décisions automatisées produisant des effets juridiques ou similaires significatifs sur les utilisateurs |
| Services destinés aux enfants | L'Application n'est pas destinée aux utilisateurs de moins de 16 ans |
| Représentant UE (GDPR Article 27) | En tant qu'entreprise basée au Japon, nous n'avons pas désigné de représentant UE pour le moment. Les demandes des résidents de l'UE sont traitées via l'adresse e-mail de contact ci-dessus |
| Délégué à la protection des données (DPO) | Nous n'avons pas désigné de DPO, le traitement étant considéré comme de petite envergure pour le moment |

### 1.2 Consentement

Lorsque vous commencez à utiliser l'Application (utilisation invité, inscription membre ou connexion), vous acceptez la présente Politique. Si nous révisons la présente Politique (autres que des corrections typographiques), nous pouvons vous demander d'accepter à nouveau lors du lancement de l'application ou de la connexion. Si vous n'acceptez pas, vous pouvez vous déconnecter et cesser d'utiliser l'Application.

Les autorisations pour la localisation, la caméra, les notifications et des fonctionnalités similaires sont demandées séparément via les dialogues d'autorisation du système d'exploitation lorsque vous utilisez chaque fonctionnalité. Vous pouvez désactiver les notifications à tout moment dans les paramètres de l'appareil.

Nous enregistrons la date et l'heure du consentement à la présente Politique ainsi que la version de la Politique sur votre appareil et dans le cloud (Firebase).

---

## 2. Informations que nous collectons et finalités d'utilisation

L'Application collecte et utilise les informations ci-dessous pour gérer les journaux de promenade, partager les données au sein des familles, sauvegarder les données dans le cloud et améliorer la qualité du service. Sauf lorsque nécessaire pour nos opérations, nous n'examinons pas individuellement le contenu enregistré par les utilisateurs.

### 2.1 Informations que vous saisissez

**Informations collectées**

- **Informations de compte** : Nom d'affichage, adresse e-mail (lors de l'inscription), méthode d'authentification (invité / e-mail)
- **Informations sur les animaux** : Nom, race/type, sexe, date de naissance, jour d'adoption, date d'adieu (facultatif), nom de groupe (facultatif), photo de profil
- **Journaux de promenade** : Heure de début/fin, distance, durée, itinéraire GPS (coordonnées latitude/longitude), animaux présents lors de la promenade, emplacements de déjections/marques personnalisées, mémos, photos prises pendant les promenades, instantané météo au début de la promenade (température, icône météo, etc.)
- **Code famille** : Identifiant pour rejoindre et partager un groupe familial (ID famille dans Firestore)

**Finalité d'utilisation**

Créer, stocker et consulter les journaux de promenade d'animaux, partager les journaux au sein des familles et sauvegarder les données de manière sécurisée dans le cloud.

**Traitement**

Les données que vous saisissez sont stockées sur Google Firebase (Cloud Firestore, Cloud Storage) via une communication chiffrée (HTTPS). Seuls les membres de la famille partageant le même code famille et disposant d'un accès légitime peuvent les consulter.

**Base juridique (référence pour les utilisateurs dans l'UE)**

Le traitement repose sur l'exécution d'un contrat nécessaire à la fourniture du Service et sur votre consentement (y compris les autorisations de l'appareil pour la localisation, la caméra, les notifications, etc.).

---

### 2.2 Caméra et photos

**Informations collectées**

Collectées uniquement lorsque vous accordez l'autorisation et utilisez la caméra de l'appareil ou la photothèque.

**Finalité d'utilisation**

- Enregistrer les photos de profil des animaux
- Prendre et stocker des photos de promenade pendant ou après les promenades dans le cloud
- Enregistrer éventuellement les photos dans la photothèque de l'appareil (selon les paramètres)

**Traitement**

Les images sont stockées dans Firebase Cloud Storage et ne peuvent être consultées que par les utilisateurs du même groupe familial. Nous ne capturons pas d'images en arrière-plan et ne collectons pas d'images à des fins non liées.

---

### 2.3 Informations de localisation

**Informations collectées**

Avec votre autorisation, nous collectons la localisation de l'appareil (GPS) pendant que vous utilisez la fonctionnalité de promenade. Si la localisation en arrière-plan est activée, nous pouvons collecter la localisation lorsque l'application est fermée ou lorsque vous utilisez d'autres applications afin d'enregistrer votre itinéraire de promenade.

Pour afficher la météo au début d'une promenade, nous pouvons temporairement envoyer la latitude et la longitude à OpenWeatherMap et joindre les données météorologiques résultantes à l'enregistrement de la promenade.

**Finalité d'utilisation**

- Enregistrer le début et la fin de la promenade
- Calculer la distance parcourue
- Afficher les itinéraires sur une carte
- Afficher et enregistrer la météo au début de la promenade

**Traitement**

Les données de localisation et d'itinéraire sont stockées dans Cloud Firestore et ne peuvent être consultées que par les utilisateurs du même groupe familial. Nous ne collectons pas la localisation à des fins non liées lorsque vous n'utilisez pas la fonctionnalité de promenade. La précision peut varier selon les paramètres de l'appareil et les conditions de signal.

Sur l'appareil, nous pouvons utiliser le stockage local (AsyncStorage) uniquement pendant une promenade active pour stocker temporairement l'itinéraire. Celui-ci est supprimé lorsque la promenade est enregistrée ou abandonnée.

---

### 2.4 Notifications push

**Informations collectées**

Avec votre autorisation, nous accédons à la fonctionnalité de notification de l'appareil et obtenons un jeton d'appareil (Expo Push Token) nécessaire à la livraison des notifications push.

**Finalité d'utilisation**

- Notifier les membres de la famille lorsqu'une promenade se termine
- Diffuser des avis et des messages liés au service de l'Application

**Traitement**

Les jetons sont stockés dans Cloud Firestore liés à votre compte. Le contenu des notifications se limite à ce qui est nécessaire au fonctionnement de l'Application. Nous n'utilisons pas les notifications pour la publicité de tiers.

Vous pouvez désactiver les notifications à tout moment dans les paramètres de notification de l'appareil ou du système d'exploitation.

---

### 2.5 Authentification et comptes

**Informations collectées**

- Identifiant utilisateur anonyme émis pour la connexion invité (anonyme)
- Informations de compte lors de l'inscription ou de la connexion avec e-mail et mot de passe
- Identifiants, adresse e-mail, nom d'affichage, etc. reçus via Google et Firebase Authentication lors de la connexion avec Google (varie selon vos paramètres et consentement Google)
- Identifiants, adresse e-mail (ou adresse relais privée Apple), nom d'affichage, etc. reçus via Apple et Firebase Authentication lors de la connexion avec Apple (varie selon vos paramètres et consentement Apple)
- Continuité du même identifiant utilisateur lors de la mise à niveau d'un compte invité vers une inscription membre

**Finalité d'utilisation**

Authentification des utilisateurs, protection et transfert des données, et gestion de la participation aux groupes familiaux.

**Traitement**

Les données d'authentification sont gérées par Firebase Authentication. Nous ne consultons ni ne stockons directement les mots de passe ; ils sont traités de manière sécurisée par la plateforme d'authentification. Les informations reçues via la connexion Google ou Apple sont utilisées uniquement pour créer des comptes, se connecter ou lier à des comptes existants.

---

### 2.6 Fonctionnalités Premium et facturation

**Informations collectées**

- Statut Premium pour l'unité familiale (expiration, etc., y compris `premiumExpiresAt` dans Cloud Firestore)
- Informations relatives aux achats, à la restauration et au statut d'abonnement via Apple App Store / Google Play
- Pour la facturation, l'ID famille (utilisé comme App User ID), les métadonnées de transaction d'achat, etc. peuvent être envoyés à des plateformes de facturation telles que RevenueCat (RevenueCat, Inc.)

**Finalité d'utilisation**

- Fournir les fonctionnalités Premium
- Gérer le statut afin qu'**un abonnement par famille active le Premium pour tous les membres partageant le même code famille**
- Restaurer les achats, prévenir les abus et fournir l'assistance

**Traitement**

- Le traitement des paiements (numéros de carte de crédit, etc.) est assuré par **Apple / Google**. Nous ne stockons pas les informations de carte de paiement.
- La facturation, l'annulation, les remboursements et le renouvellement automatique suivent les conditions et procédures de chaque store.

---

## 3. Durée de conservation

| Type de données | Durée de conservation |
|-----------|------------------|
| Données de compte, famille, animaux et promenades | Jusqu'à la suppression de votre compte, ou jusqu'à ce que le dernier membre d'un groupe familial supprime son compte |
| Données de compte invité | Supprimées lorsque vous choisissez « Se déconnecter (abandonner les données) » en tant qu'invité |
| Jetons de notification push | Écrasés ou supprimés lorsque le compte est supprimé ou que l'appareil est réenregistré |
| Itinéraire temporaire sur l'appareil pendant une promenade | Supprimé lorsque la promenade est enregistrée ou abandonnée |

Sauf lorsque la conservation est requise par la loi, nous ne conservons pas les données au-delà des périodes ci-dessus à des fins non liées.

---

## 4. Suppression des données

Vous pouvez supprimer les données dans l'Application comme suit.

### 4.1 Suppression d'un compte membre

Depuis Paramètres → « Supprimer le compte », vous pouvez supprimer votre compte membre connecté.

- Vos informations utilisateur et votre entrée dans la liste des membres de la famille sont supprimées.
- Si vous êtes le **dernier membre** d'un groupe familial, tous les animaux, journaux de promenade et photos (y compris les fichiers dans Cloud Storage) liés à cette famille sont également supprimés.
- Si **d'autres membres de la famille restent**, les animaux et journaux de promenade partagés sont conservés ; seules vos informations de compte sont supprimées.

Pour des raisons de sécurité, une reconnexion récente peut être requise. Dans ce cas, déconnectez-vous, reconnectez-vous et réessayez la suppression.

### 4.2 Invité « Se déconnecter (abandonner les données) »

Si vous vous déconnectez en tant qu'invité et choisissez « Se déconnecter (abandonner les données) », les enregistrements cloud (promenades, animaux, photos, etc.) et le compte anonyme sont supprimés et ne peuvent pas être restaurés.

Pour conserver vos données, utilisez l'inscription membre gratuite (associer un compte e-mail). Si vous passez d'invité à membre, les enregistrements existants sont transférés vers le même compte.

### 4.3 Déconnexion membre

Si un membre se déconnecte normalement, les données cloud ne sont pas supprimées. Vous pouvez y accéder à nouveau lors de la prochaine connexion.

### 4.4 Suppression sur demande

Si vous ne pouvez pas utiliser les méthodes ci-dessus ou souhaitez supprimer d'autres données personnelles, contactez-nous à l'adresse indiquée à la fin de la présente Politique. Nous répondrons dans un délai raisonnable.

---

## 5. Services tiers et transferts de données

L'Application utilise les services tiers ci-dessous pour le stockage, l'authentification, les cartes, la météo, les notifications et les fonctionnalités de l'application. Des données peuvent être envoyées conformément à la politique de confidentialité de chaque service. Nous ne vendons ni ne fournissons le contenu enregistré par les utilisateurs à des tiers à des fins publicitaires.

### 5.1 Plateforme de l'application et stockage

| Élément | Détails |
|------|---------|
| Service | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Données envoyées | Informations de compte, données sur les animaux et les promenades, images, localisation, jetons push |
| Finalité | Authentification, stockage cloud, partage au sein des familles |
| Politique de confidentialité | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Les données peuvent être stockées sur l'infrastructure cloud de Google et **transférées en dehors de l'Espace économique européen (EEA)** (par exemple, Japon, États-Unis).

Nous nous appuyons sur les conditions de traitement des données de Google (y compris les dispositions relatives à la protection des données) et sur les **Standard Contractual Clauses (SCC)** et autres garanties appropriées lors de l'utilisation de Firebase.

### 5.2 Livraison des notifications push

| Élément | Détails |
|------|---------|
| Service | Expo (Expo Push Notification Service) et infrastructure de notification Apple / Google |
| Données envoyées | Jetons d'appareil et métadonnées nécessaires à la livraison |
| Finalité | Livrer les notifications push |
| Politique de confidentialité | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Cartes

L'Application utilise `react-native-maps` pour afficher les itinéraires de promenade. **Le fournisseur de cartes dépend du système d'exploitation de votre appareil.**

#### 5.3.1 Android

| Élément | Détails |
|------|---------|
| Service | Google Maps Platform |
| Données envoyées | Données de requête nécessaires à l'affichage des cartes (communication de l'appareil vers Google) |
| Finalité | Afficher les itinéraires de promenade sur une carte |
| Politique de confidentialité | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Élément | Détails |
|------|---------|
| Service | Apple Maps (MapKit) |
| Données envoyées | Données de requête nécessaires à la récupération des tuiles cartographiques (communication de l'appareil vers Apple) |
| Finalité | Afficher les itinéraires de promenade sur une carte |
| Politique de confidentialité | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Météo (au début de la promenade)

| Élément | Détails |
|------|---------|
| Service | OpenWeatherMap |
| Données envoyées | Latitude et longitude au début de la promenade |
| Finalité | Afficher la météo au début de la promenade et la joindre à l'enregistrement |
| Politique de confidentialité | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 Achats intégrés (abonnements Premium)

| Élément | Détails |
|------|---------|
| Service | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Données envoyées | ID famille (App User ID pour la facturation), informations de transaction pour l'achat/la restauration, métadonnées de l'appareil et du store |
| Finalité | Acheter et restaurer les abonnements Premium, gérer le statut actif, partager les fonctionnalités au sein d'une famille |
| Politique de confidentialité | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Communication à des tiers

Nous prenons les mesures de sécurité nécessaires et appropriées pour les informations que nous traitons. Sauf lorsque la loi l'exige ou pour protéger la vie, le corps ou les biens, nous ne communiquons pas d'informations personnelles à des tiers sans le consentement de l'utilisateur.

Parmi les membres partageant un code famille, les informations sur les animaux et les journaux de promenade sont mutuellement visibles par conception. Les utilisateurs sont responsables de la gestion des codes famille.

---

## 7. Vos droits (y compris les utilisateurs dans l'UE)

Lorsque la loi applicable le permet, vous pouvez disposer des droits suivants :

- **Droit d'accès** : Demander la communication des données personnelles que nous détenons à votre sujet
- **Droit de rectification** : Demander la correction de données personnelles inexactes
- **Droit à l'effacement** : Demander la suppression de données personnelles (via la suppression dans l'application ou notre adresse de contact)
- **Droit à la limitation ou à l'opposition** : Dans certaines conditions, limiter le traitement ou s'opposer au traitement
- **Droit à la portabilité des données** : Demander un export dans un format structuré (JSON) via Paramètres → « Exporter les données » (version résumée ou complète ; les photos sont incluses sous forme d'URL Storage dans le JSON)

Les utilisateurs résidant dans l'UE peuvent avoir le droit d'introduire une réclamation auprès d'une autorité de contrôle dans leur pays de résidence.

---

## 8. Clause de non-responsabilité

L'Application vise à aider à enregistrer les promenades d'animaux et à partager des informations au sein des familles. La distance, les itinéraires, la météo et des données similaires enregistrées dépendent de l'appareil, de l'environnement et des paramètres et peuvent ne pas correspondre exactement aux promenades réelles. Nous ne sommes pas responsables des problèmes ou dommages résultant de l'utilisation de l'Application.

L'Application ne remplace pas un diagnostic ou un traitement vétérinaire. Si votre animal présente des problèmes de santé, consultez un vétérinaire ou un autre professionnel qualifié.

---

## 9. Contact

Pour toute question concernant la présente Politique, toute demande relative aux données personnelles ou toute assistance pour l'Application, contactez :

| Élément | Détails |
|------|---------|
| Nom commercial | Annie Works |
| Représentant | Toshiya Karimata |
| Activités | Conception, développement et exploitation d'applications pour smartphones |
| Adresse | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contact | support@annie-works.com |

---

## 10. Modifications de la présente Politique

Nous pouvons réviser la présente Politique lorsque les lois ou le Service changent. La Politique révisée entre en vigueur lors de sa publication sur ce site web ou sur des canaux similaires. Pour les modifications importantes, nous pouvons vous en informer dans l'Application ou sur le site web.

---

*Publié à : https://peppered-marigold-b52.notion.site/Annie-s-Walking-Log-Privacy-Policy-39daf1786c2780838a54e9b60efa0807*
