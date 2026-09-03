# Puntos por Voz

Contador de puntos de vida para dos jugadores (Verde / Rojo), 100% offline,
con control por voz. Construido con el mismo stack y estética que
[ojamatching](https://github.com/gogolcien/ojamatching): Expo + expo-router,
sin backend, historial guardado solo en memoria mientras la app está activa.

## Pantalla principal

- **Verde** (izquierda) y **Rojo** (derecha), hasta 5 dígitos, inician en 8000.
- **Barra central**: botón de historial arriba, botón de micrófono al centro.
- **Historial** (modal): registro cronológico desde 8000/8000, pérdidas en
  rojo, ganancias en verde, por jugador. Se borra al cerrar la app del todo.

## Comandos de voz

Con el micrófono activado, gramática de dos niveles:

| Nivel 1 | Nivel 2 (tras rojo/verde) | Efecto |
|---|---|---|
| `volver` | — | Deshace el último cambio |
| `reiniciar` (x2) | — | Primera vez: pide confirmación (6s). Repetirlo, o tocar el banner, reinicia ambos a 8000 |
| `rojo` / `verde` | *(número)* — ej. `verde 500` | Resta esa cantidad |
| `rojo` / `verde` | `gana` *(número)* — ej. `rojo gana 1000` | Suma esa cantidad |
| `rojo` / `verde` | `mitad` | Aplica mitad (redondeo hacia arriba, piso en 1) |

`reiniciar` es de dos pasos a propósito: es el único comando que borra
información, así que una palabra mal reconocida por el motor offline no
puede resetear la partida sola. Ver `components/ResetConfirmBanner.js`.

El reconocimiento se hace **en el dispositivo** (`requiresOnDeviceRecognition:
true` en `expo-speech-recognition`), sin enviar audio a internet. En Android,
el paquete de idioma español debe estar descargado para uso offline
(Ajustes → Sistema → Idiomas → Reconocimiento de voz). El motor y el idioma
exacto disponible offline dependen del fabricante del teléfono.

## Reglas de negocio

Ver `lib/lifeRules.js`:

- Rango: 0 a 99,975 (5 dígitos).
- Los valores siempre terminan en 0/25/50/75; "mitad" redondea hacia arriba
  a esa grilla y no baja de 1.

## Generar el APK instalable

Igual que en ojamatching: **no hace falta cuenta de Expo ni ningún token.**
El workflow de GitHub Actions (`.github/workflows/android-build.yml`) genera
el proyecto nativo con `expo prebuild` y compila el APK directamente en el
runner con Gradle, firmado con el `debug.keystore` fijo que está en la raíz
del repo (evita el típico error de "firma distinta" al reinstalar sobre una
versión anterior).

1. Sube tus cambios a `main` (o entra a la pestaña **Actions** → "Build
   Android APK" → **Run workflow** para lanzarlo a mano sin hacer commit).
2. Espera a que termine (unos minutos).
3. Entra a la ejecución del workflow y descarga el artifact
   **puntos-por-voz-release-apk** — ahí está el `.apk` listo para compartir
   e instalar (activando "instalar de fuentes desconocidas" en Android).

También puedes compilarlo en tu propia máquina si tienes Android SDK/JDK 17
instalados:

```
npm install
npx expo prebuild --platform android
mkdir -p ~/.android && cp debug.keystore ~/.android/debug.keystore
cd android && ./gradlew assembleRelease
```

El `.apk` queda en `android/app/build/outputs/apk/release/app-release.apk`.

> Nota: como el APK queda firmado con la clave de debug, cada vez que
> generes una nueva versión sobrescribe la instalación anterior sin
> conflicto de firma — pero no es apta para publicarse en Google Play tal
> cual (para eso se necesita una keystore de release propia).

## Desarrollo

```
npm install
npx expo start
```

> Nota: `expo-speech-recognition` requiere un módulo nativo, por lo que no
> funciona en Expo Go — usa un development build (`eas build --profile
> development`) o el build de preview para probar el micrófono.

## Estructura

```
app/
  _layout.js   → provee el estado global y la pila de pantallas
  index.js     → pantalla principal (verde/rojo + barra central)
  history.js   → pantalla de historial (modal)

lib/
  theme.js              → colores y espaciados (mismo patrón que ojamatching)
  lifeRules.js           → límites, redondeo de "mitad"
  voiceCommands.js       → parser puro de la gramática de voz
  useLifeCounter.js       → estado de vida + historial + deshacer
  useVoiceCommand.js      → conecta el micrófono con el parser
  LifeCounterContext.js  → contexto compartido entre pantallas

components/
  PlayerSide.js, DividerBar.js, HistoryList.js, ui.js
```
