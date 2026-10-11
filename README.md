# Codi — aprende a programar

App Android para aprender programación con lecciones cortas, al estilo de un juego: eliges un lenguaje y un nivel, avanzas por una ruta de lecciones, ganas XP, cuidas tus vidas y mantienes tu racha diaria.

> "Codi" es un nombre provisional.

## Descargar

**[⬇ Descargar la última versión (APK)](https://github.com/Sebazzz88/ruta-de-aprendizaje-/releases/latest/download/ruta-de-aprendizaje.apk)**

Todas las versiones: [Releases](https://github.com/Sebazzz88/ruta-de-aprendizaje-/releases)

### Cómo instalarla

1. Abre el enlace de descarga desde tu teléfono Android.
2. Abre el archivo `ruta-de-aprendizaje.apk`.
3. Si Android lo pide, permite **instalar apps de fuentes desconocidas** para tu navegador o gestor de archivos.
4. Pulsa **Instalar**.

Requiere Android 5.1 o superior. Funciona sin conexión; solo usa internet para **Ajustes → Buscar actualizaciones**.

## Qué incluye

- **10 lenguajes:** Python, JavaScript, Java, C, C++, Ruby, Assembly (x86-64), PowerShell, HTML y Perl.
- **5 niveles de inicio:** Regular, Medio, Intermedio, Avanzado y Pro. El nivel define en qué unidad empiezas y la dificultad:

  | Nivel | Empiezas en | Vidas | XP | Errores |
  |---|---|---|---|---|
  | Regular | Unidad 1 | 5 | ×1 | Se repiten al final |
  | Medio | Unidad 2 | 5 | ×1.25 | Se repiten al final |
  | Intermedio | Unidad 3 | 4 | ×1.5 | Se repiten al final |
  | Avanzado | Unidad 4 | 3 | ×1.75 | No se repiten |
  | Pro | Unidad 5 | 3 | ×2 | No se repiten |

  Las unidades anteriores al nivel elegido quedan abiertas para repasar.
- **Ruta de lecciones** que se desbloquean en orden.
- **4 tipos de ejercicio:** opción múltiple, completar el código, ordenar líneas y predecir la salida.
- **Feedback inmediato** con la respuesta correcta y una explicación breve.
- **Vidas** (se recupera 1 cada 30 minutos), **XP**, **racha diaria** y **meta diaria**.
- **Progreso por lenguaje:** al cambiar de lenguaje puedes guardar el progreso. Al volver a uno guardado, la app pregunta si quieres borrarlo y empezar de cero o continuar donde lo dejaste.
- **Perfil** con racha, XP, lecciones, precisión y avance de cada lenguaje.
- **Ajustes:** nombre, tema claro/oscuro/sistema, meta diaria, sonidos, ver el tutorial, buscar actualizaciones y borrar el progreso.
- **Tutorial** al abrir la app por primera vez.
- **Buscar actualizaciones:** consulta la última versión publicada en GitHub y dice si ya tienes la última o si hay una pendiente. No abre el navegador.

## Tecnología

- [Capacitor 6](https://capacitorjs.com/) + HTML, CSS y JavaScript (módulos ES, sin frameworks).
- Sin backend: el contenido está en archivos JSON y el progreso se guarda en `localStorage` del teléfono.
- Diseño propio (colores, tipografía Nunito / Nunito Sans, espaciados y componentes), con modo oscuro.

## Estructura

```
├── capacitor.config.json      appId y appName
├── package.json
├── www/                       la app (lo que va dentro del APK)
│   ├── index.html
│   ├── css/                   tokens.css, base.css, components.css, screens.css
│   ├── fonts/                 Nunito y Nunito Sans (licencia OFL)
│   ├── js/
│   │   ├── config.js          nombre, versión, niveles y reglas del juego
│   │   ├── app.js             arranque y rutas
│   │   ├── router.js          navegación (incluye el botón "atrás" de Android)
│   │   ├── storage.js         progreso en localStorage
│   │   ├── game.js            vidas, XP, racha y desbloqueo de lecciones
│   │   ├── update.js          búsqueda de actualizaciones (GitHub Releases)
│   │   ├── screens/           pantallas
│   │   └── exercises/         tipos de ejercicio
│   └── data/
│       ├── languages.json     lista de lenguajes
│       └── courses/           un JSON por lenguaje con sus unidades y lecciones
└── android/                   proyecto nativo generado por Capacitor
```

## Agregar o editar lecciones

Cada lenguaje está en `www/data/courses/<lenguaje>.json`. Tiene 5 unidades, una por nivel y en orden (`regular`, `medio`, `intermedio`, `avanzado`, `pro`). Cada lección lleva de 5 a 10 ejercicios:

```json
{
  "id": "py-1-3",
  "title": "Mi lección nueva",
  "exercises": [
    { "type": "choice", "prompt": "¿Pregunta?", "options": ["Correcta", "Otra", "Otra más"], "answer": 0, "explanation": "Por qué." },
    { "type": "output", "code": "print(1 + 1)", "options": ["2", "11"], "answer": 0, "explanation": "Suma." },
    { "type": "fill", "prompt": "Completa", "code": "___(\"Hola\")", "options": ["print", "say"], "answer": ["print"], "explanation": "..." },
    { "type": "order", "prompt": "Ordena", "lines": ["a = 1", "print(a)"], "explanation": "..." }
  ]
}
```

- `answer` es el índice de la opción correcta; la app desordena las opciones al mostrarlas.
- En `fill`, cada `___` del código es un hueco, y `answer` lleva una respuesta por hueco, en orden.
- En `order`, `lines` va en el orden correcto; la app las desordena. Evita líneas que puedan intercambiarse sin cambiar el resultado.
- El `id` de cada lección debe ser único: el progreso se guarda con ese id.

Para agregar un lenguaje nuevo, añádelo a `www/data/languages.json` y crea su archivo en `courses/`.

## Cambiar el nombre de la app

1. `www/js/config.js` → `APP_NAME`
2. `capacitor.config.json` → `appName`
3. `npx cap sync android`

## Generar el APK

Requisitos: Node.js 18 o superior, JDK 17 y el SDK de Android (con `ANDROID_HOME` configurado o la ruta del SDK en `android/local.properties`).

```bash
npm install
npx cap sync android
cd android
./gradlew assembleDebug        # en Windows: gradlew.bat assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Publicar una actualización

1. Sube la versión en `www/js/config.js` (`APP_VERSION`, p. ej. `1.1.0`) y en `android/app/build.gradle` (`versionName "1.1.0"` y `versionCode` +1).
2. Genera el APK (pasos de arriba) y renómbralo a `ruta-de-aprendizaje.apk`.
3. Crea un release en GitHub con el tag `v1.1.0` y adjunta el APK:
   ```bash
   gh release create v1.1.0 ruta-de-aprendizaje.apk --title "v1.1.0" --notes "Cambios..."
   ```

El enlace de descarga de arriba siempre apunta al último release, y la opción **Buscar actualizaciones** de la app compara su versión con ese tag.

> El APK se firma con la clave de depuración del equipo que lo compila. Para instalar una versión nueva encima de la anterior sin desinstalar, compila siempre en el mismo equipo o configura una clave de firma propia.

## Licencias

- Fuentes Nunito y Nunito Sans: SIL Open Font License 1.1 (`www/fonts/OFL.txt`).
