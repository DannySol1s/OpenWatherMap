<div align="center">
  <h1>🌦️ SkyWatch (WeatherLink Duo)</h1>
  <p><strong>Una aplicación meteorológica moderna, modular y multiplataforma con integración de Inteligencia Artificial.</strong></p>
</div>

---

## 📖 Descripción del Proyecto

**SkyWatch** (también conocido como *WeatherLink Duo*) es una aplicación web y móvil avanzada diseñada para proporcionar información meteorológica precisa en tiempo real, análisis históricos y resúmenes generados por Inteligencia Artificial. 

Desarrollada con las últimas tecnologías web, la aplicación destaca por su arquitectura **modular** que facilita el mantenimiento, una interfaz de usuario **Responsive** construida bajo el patrón de diseño *Glassmorphism*, y una robusta comunicación en tiempo real respaldada por **Supabase**. Está preparada para ser compilada de forma nativa como aplicación móvil (.APK) mediante **Capacitor**.

## ✨ Características Principales

*   🧩 **Arquitectura Modular (`src/modules/`)**: Cada funcionalidad (como Consultar Clima, Estadísticas, Pronósticos) está estructurada de forma independiente utilizando `ModuleTemplate`, lo que asegura uniformidad visual y facilita el desarrollo por separado.
*   🧠 **Reportes de IA Integrados**: Analiza automáticamente la temperatura, humedad, viento y pronósticos de 5 días para generar **resúmenes meteorológicos en lenguaje natural (Español)** usando algoritmos de IA locales (`generateAIWeatherReport`).
*   ⚡ **Base de Datos y Tiempo Real (Supabase)**: Utilización de la tabla `weather_logs` configurada para soportar columnas `JSONB` con un índice GIN, permitiendo un filtrado del lado del servidor extremadamente rápido y sin sobrecarga de datos. Las actualizaciones ocurren en tiempo real.
*   📱 **Multiplataforma y Responsivo**: Diseño impecable tanto para dispositivos móviles como para computadoras de escritorio. Integra **Capacitor** para un empaquetado directo como aplicación nativa Android (APK).
*   🎨 **Diseño Glassmorphism Premium**: Interfaz moderna, elegante y fluida con fondos desenfocados, animaciones sutiles (Framer Motion) e iconografía intuitiva (Lucide React).
*   🗺️ **Mapas Interactivos y Gráficos**: Visualización de ubicaciones de consultas con `Leaflet/React-Leaflet` y tendencias de clima usando `Recharts`.
*   🤖 **Automatización Backend**: Alimentación constante de datos desde la API de **OpenWeatherMap** mediante un script de automatización (`main.py`) cada 5 minutos hacia Supabase.

## 🛠️ Tecnologías y Stack

**Frontend:**
*   **React 19** + **Vite**
*   **Tailwind CSS v4** (Estilos y Diseño Glassmorphism)
*   **Framer Motion** (Animaciones fluidas y estados de carga)
*   **React Router v7** (Navegación entre módulos)
*   **React Leaflet** (Mapas) & **Recharts** (Gráficos)
*   **Lucide React** (Iconografía)

**Backend & Datos:**
*   **Supabase** (Postgres, Realtime, JSONB)
*   **OpenWeatherMap API** (Fuente de datos meteorológicos)
*   **Python** (Scripts de ingesta y automatización)

**Móvil:**
*   **Capacitor** (iOS/Android Native Shell)

## 📁 Estructura del Proyecto

El código fuente principal está en la carpeta `WeatherFlow`, separado para mantener el backend y frontend organizados:

```text
D:\SkyWatch\
├── main.py                     # Script Python de automatización e ingesta de datos
└── WeatherFlow/                # Aplicación Frontend / Aplicación Móvil
    ├── android/                # Proyecto nativo de Android (generado por Capacitor)
    ├── src/
    │   ├── assets/             # Recursos estáticos
    │   ├── components/         # Componentes compartidos y UI global
    │   ├── context/            # Manejo del estado global de React
    │   ├── lib/                # Utilidades, configuración de Supabase
    │   ├── modules/            # Módulos clave separados (Cápsulas de funcionalidades)
    │   │   ├── ModuleTemplate  # Plantilla base para asegurar diseño uniforme
    │   │   ├── ConsultarClima  # Módulo principal de búsqueda y reporte IA
    │   │   ├── StatsModule     # Módulo de gráficas e historial
    │   │   └── ForecastModule  # Módulo de pronósticos a 5 días
    │   ├── pages/              # Páginas principales (HomePage, etc.)
    │   └── ...
    ├── package.json            # Dependencias del proyecto
    └── capacitor.config.json   # Configuración de compilación móvil
```

## 🚀 Cómo Comenzar (Desarrollo)

### Prerrequisitos
- Node.js (v18 o superior)
- Cuenta configurada en Supabase (Con la tabla `weather_logs` estructurada)
- Clave de API de OpenWeatherMap

### Instalación

1.  **Clonar y configurar el entorno:**
    Navega a la carpeta principal y luego al directorio frontend.
    ```bash
    cd SkyWatch/WeatherFlow
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz de `WeatherFlow` con tus credenciales:
    ```env
    VITE_SUPABASE_URL=tu_supabase_url
    VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
    VITE_OPENWEATHER_API_KEY=tu_openweather_api_key
    ```

4.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación se ejecutará localmente y recargará los cambios de forma automática.

### Compilar para Android (APK)

```bash
npm run build
npx cap sync android
npx cap open android
```
Esto abrirá Android Studio permitiendo compilar el archivo `.apk` final.

---
*Desarrollado para ofrecer precisión, belleza y una inmejorable experiencia de usuario en la visualización del clima mundial.*

### Autores del Proyecto

*   **Ángel Daniel Solís Pérez** - [GitHub](https://github.com/DannySol1s) | [LinkedIn](https://www.linkedin.com/in/angel-daniel-solis-perez-69a3b124b/)
*   **Mayra Guadalupe Tun Huicab** - [GitHub](https://github.com/mayratunhuicab)