# Política de Privacidad — Diario de paseos de Annie

**Última actualización: 16 de junio de 2026**

Annie Works («nosotros», «nos» o «el Desarrollador») establece esta Política de Privacidad (la «Política») respecto al tratamiento de información personal y datos de usuario en la aplicación Diario de paseos de Annie (la «App»).

---

## 1. Responsable del tratamiento

| Elemento | Detalles |
|----------|----------|
| Nombre comercial | Annie Works |
| Representante | Toshiya Karimata |
| Actividades comerciales | Planificación, desarrollo y operación de aplicaciones |
| Dirección | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contacto | support@annie-works.com |

La empresa indicada anteriormente es el responsable del tratamiento de los datos personales procesados en la App.

Para consultas sobre esta Política o solicitudes de acceso, rectificación o eliminación de datos personales, contáctenos en la dirección de correo electrónico indicada arriba. No aceptamos consultas por teléfono. Aceptamos consultas por correo postal o correo electrónico.

### 1.1 Asuntos no aplicables en la actualidad

Lo siguiente no se aplica a la operación actual de la App:

| Tema | Detalles |
|------|----------|
| Toma de decisiones automatizada / elaboración de perfiles | No tomamos decisiones automatizadas que produzcan efectos legales o de importancia similar para los usuarios |
| Servicios para menores | La App no está destinada a usuarios menores de 16 años |
| Representante en la UE (GDPR artículo 27) | Como empresa con sede en Japón, no hemos designado un representante en la UE en este momento. Las consultas de residentes en la UE se gestionan a través del contacto por correo electrónico indicado arriba |
| Delegado de Protección de Datos (DPO) | No hemos designado un DPO, ya que el tratamiento califica como de pequeña escala en este momento |

### 1.2 Consentimiento

Cuando comienza a utilizar la App (uso como invitado, registro como miembro o inicio de sesión), acepta esta Política. Si revisamos esta Política (aparte de correcciones tipográficas), podemos solicitarle que acepte de nuevo al iniciar la aplicación o al iniciar sesión. Si no acepta, puede cerrar sesión y dejar de utilizar la App.

Los permisos de ubicación, cámara, notificaciones y funciones similares se solicitan por separado mediante los diálogos de permisos del sistema operativo cuando utiliza cada función. Puede desactivar las notificaciones en cualquier momento en la configuración del dispositivo.

Registramos la fecha y hora del consentimiento a esta Política y la versión de la Política en su dispositivo y en la nube (Firebase).

---

## 2. Información que recopilamos y finalidades de uso

La App recopila y utiliza la información que se indica a continuación para gestionar registros de paseos, compartir datos dentro de las familias, hacer copias de seguridad en la nube y mejorar la calidad del servicio. Salvo cuando sea necesario para nuestras operaciones, no revisamos individualmente el contenido registrado por los usuarios.

### 2.1 Información que usted introduce

**Información recopilada**

- **Información de la cuenta**: Nombre para mostrar, dirección de correo electrónico (al registrarse), método de autenticación (invitado / correo electrónico)
- **Información de mascotas**: Nombre, raza/tipo, sexo, fecha de nacimiento, día de adopción, fecha de despedida (opcional), nombre del grupo (opcional), foto de perfil
- **Registros de paseos**: Hora de inicio/fin, distancia, duración, ruta GPS (coordenadas de latitud/longitud), mascotas en el paseo, ubicaciones de deposiciones/marcas personalizadas, notas, fotos tomadas durante los paseos, instantánea meteorológica al inicio del paseo (temperatura, icono del clima, etc.)
- **Código familiar**: Identificador para unirse y compartir un grupo familiar (ID de familia en Firestore)

**Finalidad de uso**

Crear, almacenar y visualizar registros de paseos de mascotas, compartir registros dentro de las familias y hacer copias de seguridad seguras de los datos en la nube.

**Tratamiento**

Los datos que introduce se almacenan en Google Firebase (Cloud Firestore, Cloud Storage) mediante comunicación cifrada (HTTPS). Solo los miembros de la familia que comparten el mismo código familiar y tienen acceso legítimo pueden visualizarlos.

**Base legal (referencia para usuarios en la UE)**

El tratamiento se basa en la ejecución de un contrato necesario para prestar el Servicio y en su consentimiento (incluidos los permisos del dispositivo para ubicación, cámara, notificaciones, etc.).

---

### 2.2 Cámara y fotos

**Información recopilada**

Se recopila solo cuando otorga permiso y utiliza la cámara del dispositivo o la biblioteca de fotos.

**Finalidad de uso**

- Registrar fotos de perfil de mascotas
- Tomar y almacenar fotos de paseos durante o después de los paseos en la nube
- Guardar opcionalmente fotos en la biblioteca de fotos del dispositivo (según la configuración)

**Tratamiento**

Las imágenes se almacenan en Firebase Cloud Storage y solo pueden ser visualizadas por usuarios del mismo grupo familiar. No capturamos imágenes en segundo plano ni recopilamos imágenes con fines no relacionados.

---

### 2.3 Información de ubicación

**Información recopilada**

Con su permiso, recopilamos la ubicación del dispositivo (GPS) mientras utiliza la función de paseo. Si la ubicación en segundo plano está habilitada, podemos recopilar la ubicación mientras la aplicación está cerrada o mientras utiliza otras aplicaciones para registrar su ruta de paseo.

Para mostrar el clima al iniciar un paseo, podemos enviar temporalmente la latitud y la longitud a OpenWeatherMap y adjuntar los datos meteorológicos resultantes al registro del paseo.

**Finalidad de uso**

- Registrar el inicio y el fin del paseo
- Calcular la distancia recorrida
- Mostrar rutas en un mapa
- Mostrar y registrar el clima al inicio del paseo

**Tratamiento**

Los datos de ubicación y ruta se almacenan en Cloud Firestore y solo pueden ser visualizados por usuarios del mismo grupo familiar. No recopilamos ubicación con fines no relacionados cuando no está utilizando la función de paseo. La precisión puede variar según la configuración del dispositivo y las condiciones de señal.

En el dispositivo, podemos utilizar almacenamiento local (AsyncStorage) solo durante un paseo activo para almacenar temporalmente la ruta. Esto se elimina cuando el paseo se guarda o se descarta.

---

### 2.4 Notificaciones push

**Información recopilada**

Con su permiso, accedemos a la función de notificaciones del dispositivo y obtenemos un token de dispositivo (Expo Push Token) necesario para entregar notificaciones push.

**Finalidad de uso**

- Notificar a los miembros de la familia cuando finaliza un paseo
- Entregar avisos y mensajes relacionados con el servicio de la App

**Tratamiento**

Los tokens se almacenan en Cloud Firestore vinculados a su cuenta. El contenido de las notificaciones se limita a lo necesario para operar la App. No utilizamos notificaciones para publicidad de terceros.

Puede desactivar las notificaciones en cualquier momento en la configuración de notificaciones del dispositivo o del sistema operativo.

---

### 2.5 Autenticación y cuentas

**Información recopilada**

- Identificador de usuario anónimo emitido para inicio de sesión como invitado (anónimo)
- Información de la cuenta al registrarse o iniciar sesión con correo electrónico y contraseña
- Identificadores, dirección de correo electrónico, nombre para mostrar, etc. recibidos a través de Google y Firebase Authentication al iniciar sesión con Google (varía según su configuración y consentimiento de Google)
- Identificadores, dirección de correo electrónico (o dirección de retransmisión privada de Apple), nombre para mostrar, etc. recibidos a través de Apple y Firebase Authentication al iniciar sesión con Apple (varía según su configuración y consentimiento de Apple)
- Continuidad del mismo identificador de usuario al actualizar de una cuenta de invitado a registro como miembro

**Finalidad de uso**

Autenticación de usuarios, protección y transferencia de datos, y gestión de la participación en grupos familiares.

**Tratamiento**

Los datos de autenticación son gestionados por Firebase Authentication. No visualizamos ni almacenamos directamente las contraseñas; son gestionadas de forma segura por la plataforma de autenticación. La información recibida del inicio de sesión con Google o Apple se utiliza únicamente para crear cuentas, iniciar sesión o vincularse a cuentas existentes.

---

### 2.6 Funciones Premium y facturación

**Información recopilada**

- Estado Premium de la unidad familiar (vencimiento, etc., incluido `premiumExpiresAt` en Cloud Firestore)
- Información relacionada con compras, restauración y estado de suscripción a través de Apple App Store / Google Play
- Para la facturación, el ID de familia (utilizado como App User ID), metadatos de transacciones de compra, etc. pueden enviarse a plataformas de facturación como RevenueCat (RevenueCat, Inc.)

**Finalidad de uso**

- Proporcionar funciones Premium
- Gestionar el estado para que **una suscripción por familia habilite Premium para todos los miembros que comparten el mismo código familiar**
- Restaurar compras, prevenir usos indebidos y proporcionar soporte

**Tratamiento**

- El procesamiento de pagos (números de tarjeta de crédito, etc.) es gestionado por **Apple / Google**. No almacenamos información de tarjetas de pago.
- La facturación, cancelación, reembolsos y renovación automática se rigen por los términos y procedimientos de cada tienda.

---

## 3. Período de conservación

| Tipo de dato | Período de conservación |
|--------------|-------------------------|
| Datos de cuenta, familia, mascotas y paseos | Hasta que elimine su cuenta, o hasta que el último miembro de un grupo familiar elimine su cuenta |
| Datos de cuenta de invitado | Eliminados cuando selecciona «Cerrar sesión (descartar datos)» mientras sigue siendo invitado |
| Tokens de notificaciones push | Sobrescritos o eliminados cuando se elimina la cuenta o se vuelve a registrar el dispositivo |
| Ruta temporal en el dispositivo durante un paseo | Eliminada cuando el paseo se guarda o se descarta |

Salvo cuando la ley exija la conservación, no conservamos datos más allá de los períodos indicados arriba con fines no relacionados.

---

## 4. Eliminación de datos

Puede eliminar datos en la App de la siguiente manera.

### 4.1 Eliminación de una cuenta de miembro

Desde Configuración → «Eliminar cuenta», puede eliminar su cuenta de miembro con sesión iniciada.

- Se eliminan su información de usuario y su entrada en la lista de miembros de la familia.
- Si es el **último miembro** de un grupo familiar, también se eliminan todas las mascotas, registros de paseos y fotos (incluidos los archivos en Cloud Storage) vinculados a esa familia.
- Si **quedan otros miembros de la familia**, las mascotas y registros de paseos compartidos permanecen; solo se elimina su información de cuenta.

Por seguridad, puede ser necesario un nuevo inicio de sesión reciente. Si es así, cierre sesión, vuelva a iniciar sesión e intente la eliminación de nuevo.

### 4.2 «Cerrar sesión (descartar datos)» como invitado

Si cierra sesión como invitado y elige «Cerrar sesión (descartar datos)», los registros en la nube (paseos, mascotas, fotos, etc.) y la cuenta anónima se eliminan y no pueden restaurarse.

Para conservar sus datos, utilice el registro gratuito como miembro (vincule una cuenta de correo electrónico). Si actualiza de invitado a miembro, los registros existentes se transfieren a la misma cuenta.

### 4.3 Cierre de sesión de miembro

Si un miembro cierra sesión normalmente, los datos en la nube no se eliminan. Puede volver a acceder a ellos en el próximo inicio de sesión.

### 4.4 Eliminación mediante solicitud

Si no puede utilizar lo anterior o desea eliminar otros datos personales, contáctenos en la dirección indicada al final de esta Política. Responderemos en un plazo razonable.

---

## 5. Servicios de terceros y transferencias de datos

La App utiliza los servicios de terceros que se indican a continuación para almacenamiento, autenticación, mapas, clima, notificaciones y funcionalidad de la aplicación. Los datos pueden enviarse según lo requiera la política de privacidad de cada servicio. No vendemos ni proporcionamos el contenido registrado por los usuarios a terceros con fines publicitarios.

### 5.1 Plataforma de la App y almacenamiento

| Elemento | Detalles |
|----------|----------|
| Servicio | Google Firebase (Cloud Firestore, Authentication, Cloud Storage) |
| Datos enviados | Información de cuenta, datos de mascotas y paseos, imágenes, ubicación, tokens push |
| Finalidad | Autenticación, almacenamiento en la nube, intercambio dentro de familias |
| Política de privacidad | [Google Privacy & Terms](https://policies.google.com/privacy) / [Firebase Privacy and Security](https://firebase.google.com/support/privacy) |

Los datos pueden almacenarse en la infraestructura en la nube de Google y **transferirse fuera del Espacio Económico Europeo (EEA)** (p. ej., Japón, Estados Unidos).

Nos basamos en los términos de tratamiento de datos de Google (incluidas las disposiciones de protección de datos) y en las **Cláusulas Contractuales Tipo (SCC)** y otras garantías apropiadas al utilizar Firebase.

### 5.2 Entrega de notificaciones push

| Elemento | Detalles |
|----------|----------|
| Servicio | Expo (Expo Push Notification Service) e infraestructura de notificaciones de Apple / Google |
| Datos enviados | Tokens de dispositivo y metadatos necesarios para la entrega |
| Finalidad | Entregar notificaciones push |
| Política de privacidad | [Expo Privacy Policy](https://expo.dev/privacy) |

### 5.3 Mapas

La App utiliza `react-native-maps` para mostrar rutas de paseo. **El proveedor de mapas depende del sistema operativo de su dispositivo.**

#### 5.3.1 Android

| Elemento | Detalles |
|----------|----------|
| Servicio | Google Maps Platform |
| Datos enviados | Datos de solicitud necesarios para mostrar mapas (comunicación del dispositivo con Google) |
| Finalidad | Mostrar rutas de paseo en un mapa |
| Política de privacidad | [Google Privacy & Terms](https://policies.google.com/privacy) |

#### 5.3.2 iOS

| Elemento | Detalles |
|----------|----------|
| Servicio | Apple Maps (MapKit) |
| Datos enviados | Datos de solicitud necesarios para obtener mosaicos de mapa (comunicación del dispositivo con Apple) |
| Finalidad | Mostrar rutas de paseo en un mapa |
| Política de privacidad | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |

### 5.4 Clima (al inicio del paseo)

| Elemento | Detalles |
|----------|----------|
| Servicio | OpenWeatherMap |
| Datos enviados | Latitud y longitud al inicio del paseo |
| Finalidad | Mostrar el clima al inicio del paseo y adjuntarlo al registro |
| Política de privacidad | [OpenWeatherMap Privacy Policy](https://openweathermap.org/privacy-policy) |

### 5.5 Compras dentro de la App (suscripciones Premium)

| Elemento | Detalles |
|----------|----------|
| Servicio | RevenueCat (RevenueCat, Inc.), Apple App Store, Google Play |
| Datos enviados | ID de familia (App User ID para facturación), información de transacciones de compra/restauración, metadatos del dispositivo y de la tienda |
| Finalidad | Comprar y restaurar suscripciones Premium, gestionar el estado activo, compartir funciones dentro de una familia |
| Política de privacidad | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) / [Apple Privacy Policy](https://www.apple.com/legal/privacy/) / [Google Privacy & Terms](https://policies.google.com/privacy) |

---

## 6. Divulgación a terceros

Adoptamos las medidas de seguridad necesarias y apropiadas para la información que tratamos. Salvo cuando lo exija la ley o para proteger la vida, el cuerpo o la propiedad, no proporcionamos información personal a terceros sin el consentimiento del usuario.

Entre los miembros que comparten un código familiar, la información de mascotas y los registros de paseos son mutuamente visibles por diseño. Los usuarios son responsables de gestionar los códigos familiares.

---

## 7. Sus derechos (incluidos usuarios en la UE)

Cuando la ley aplicable lo permita, puede tener los siguientes derechos:

- **Derecho de acceso**: Solicitar la divulgación de los datos personales que conservamos sobre usted
- **Derecho de rectificación**: Solicitar la corrección de datos personales inexactos
- **Derecho de supresión**: Solicitar la eliminación de datos personales (mediante eliminación en la App o nuestra dirección de contacto)
- **Derecho a la limitación u oposición**: En determinadas condiciones, limitar el tratamiento u oponerse al tratamiento
- **Derecho a la portabilidad de datos**: Solicitar la exportación en un formato estructurado (JSON) mediante Configuración → «Exportar datos» (versión resumida o completa; las fotos se incluyen como URL de Storage en JSON)

Los usuarios residentes en la UE pueden tener derecho a presentar una reclamación ante una autoridad de control en su país de residencia.

---

## 8. Exención de responsabilidad

La App está destinada a ayudar a registrar paseos de mascotas y compartir información dentro de las familias. La distancia registrada, las rutas, el clima y datos similares dependen del dispositivo, el entorno y la configuración y pueden no coincidir exactamente con los paseos reales. No somos responsables de problemas o daños derivados del uso de la App.

La App no sustituye el diagnóstico o tratamiento de un veterinario. Si su mascota presenta problemas de salud, consulte a un veterinario u otro profesional cualificado.

---

## 9. Contacto

Para preguntas sobre esta Política, solicitudes relativas a datos personales o soporte para la App, contacte con:

| Elemento | Detalles |
|----------|----------|
| Nombre comercial | Annie Works |
| Representante | Toshiya Karimata |
| Actividades comerciales | Planificación, desarrollo y operación de aplicaciones para smartphones |
| Dirección | ParkFront Hakataekimae 1-chome 5F-B, 1-23-2 Hakataekimae, Hakata-ku, Fukuoka-shi, Fukuoka 812-0011, Japan |
| Contacto | support@annie-works.com |

---

## 10. Modificaciones de esta Política

Podemos revisar esta Política cuando cambien las leyes o el Servicio. La Política revisada entra en vigor cuando se publique en este sitio web o canales similares. Para cambios importantes, podemos notificarle en la App o en el sitio web.

---

*Publicado en: https://www.annie-works.com/es/AnnieWalkingLog/Privacy-Policy*
