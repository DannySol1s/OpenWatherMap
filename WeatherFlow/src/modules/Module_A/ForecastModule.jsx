import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, Thermometer, Wind, Droplets, Gauge, MapPin, Globe, Sun, Cloud, CloudRain, CloudLightning, Snowflake, X, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import ModuleTemplate from '../../components/ModuleTemplate';
import { fetchAndStoreWeather, fetchWeatherByCoords, fetch5DayForecast } from '../../lib/weatherApi';
import { supabase } from '../../lib/supabase';

const GLOBAL_CITIES = ['Tokio', 'Nueva York', 'Londres', 'París', 'Madrid'];

export default function ForecastModule() {
    // === ESTADOS GLOBALES DEL MÓDULO ===
    const [city, setCity] = useState('');                 // Almacena la ciudad escrita en el buscador
    const [loading, setLoading] = useState(false);        // Estado de carga para mostrar el esqueleto (Skeleton Loader)
    const [weather, setWeather] = useState(null);         // Almacena el clima actual devuelto por la API externa
    const [forecast, setForecast] = useState(null);       // Almacena el pronóstico a futuro por 5 días (cada 3 hrs)
    const [globalHistory, setGlobalHistory] = useState([]); // Historial rápido almacenando solo el Top 3 (Para barra lateral)
    const [fullHistoryStats, setFullHistoryStats] = useState([]); // Historial completo y su tabulación/conteo para la Tabla Modal
    const [showHistoryModal, setShowHistoryModal] = useState(false); // Condicional (true/false) para ocultar/mostrar la tabla gigante
    const [cityHistory, setCityHistory] = useState([]);   // Conjunto de temperaturas registradas en el pasado (Para la Gráfica Lineal)
    const [error, setError] = useState('');               // Registro en vivo de advertencias mostradas visualmente en caso de caída de Red
    const [unit, setUnit] = useState('C');                // Unidad de medición base global configurada (Celsios 'C' o Fahrenheits 'F')
    const [aiReport, setAiReport] = useState('');         // Reporte final literario (párrafo) emitido y generado por nuestra IA Local
    const [isGeneratingAi, setIsGeneratingAi] = useState(false); // Activa el icono parpadeante "Pensando/Cargando" del bloque Inteligente

    // Identificador único de Token para no cruzar información con otros prototipos en Supabase.
    const MODULE_OWNER = 'ModuleForecast';

    // Hook Disparador (Se carga solapado en la primer pintada): Empuja las librerías a revisar en la nube historiales viejos nada mas entrar
    React.useEffect(() => {
        loadGlobalHistoryFromSupabase();
        loadFullHistoryStats();
    }, []);

    const handleSearch = async (e, searchCity = city) => {
        if (e) e.preventDefault();
        if (!searchCity.trim()) return;

        setLoading(true);
        setError('');
        setAiReport('');

        if (searchCity !== city) setCity(searchCity);

        try {
            const data = await fetchAndStoreWeather(searchCity, MODULE_OWNER);
            const forecastData = await fetch5DayForecast(searchCity);
            setWeather(data);
            setForecast(forecastData);
            loadCityHistoryFromSupabase(data.name);
            loadGlobalHistoryFromSupabase();
            loadFullHistoryStats();
            generateAIWeatherReport(data, forecastData);
        } catch (err) {
            setError('Error al obtener el clima. Por favor, revisa el nombre de la ciudad.');
            setWeather(null);
            setForecast(null);
            setAiReport('');
            setCityHistory([]);
        } finally {
            setLoading(false);
        }
    };

    // === PETICIONES DE RED Y BASES DE DATOS (SUPABASE QUERIES) ===

    // Extrae y devuelve una ráfaga a la nube rápida para anidar los últimos "3" registros dentro del panel lateral derecho.
    const loadGlobalHistoryFromSupabase = async () => {
        const { data, error } = await supabase
            .from('weather_history')
            .select('created_at, content')
            .eq('module_owner', MODULE_OWNER)
            .order('created_at', { ascending: false })
            .limit(15);

        if (data) {
            // Filtrar para mostrar solo la búsqueda más reciente por ciudad
            const unique = [];
            const filtered = data.filter(record => {
                if (!unique.includes(record.content.name)) {
                    unique.push(record.content.name);
                    return true;
                }
                return false;
            });
            // Mostrar maximo 3 en el sidebar rápido según lo solicitado
            setGlobalHistory(filtered.slice(0, 3));
        }
        if (error) console.error("Error al cargar historial global:", error);
    };

    // Invoca una cota inmensa transversal (100 filas de base de datos históricas) para tabular una sumatoria de la ciudad preferida (En el grid de Ventana Emergente)
    const loadFullHistoryStats = async () => {
        const { data, error } = await supabase
            .from('weather_history')
            .select('created_at, content')
            .eq('module_owner', MODULE_OWNER)
            .order('created_at', { ascending: false })
            .limit(100); // Traemos hasta 100 para estadísticas

        if (data) {
            const statsMap = {};
            data.forEach(record => {
                const name = record.content.name;
                if (!statsMap[name]) {
                    statsMap[name] = {
                        name,
                        count: 0,
                        lastSearched: record.created_at,
                        country: record.content.sys?.country,
                        lastTemp: record.content.main.temp
                    };
                }
                statsMap[name].count += 1;
            });
            // Convert to array and sort by most searched
            const statsArray = Object.values(statsMap).sort((a, b) => b.count - a.count);
            setFullHistoryStats(statsArray);
        }
    };

    // Filtra la nube usando sintaxis de motor "JSONB" exclusivo de Supabase. Encuentra todo lo referente a UNA ciudad particular (Requerido para el motor de la Gráfica Visual de Recharts)
    const loadCityHistoryFromSupabase = async (cityName) => {
        const { data, error } = await supabase
            .from('weather_history')
            .select('created_at, content')
            .eq('module_owner', MODULE_OWNER)
            .eq('content->>name', cityName)
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setCityHistory(data);
        if (error) console.error("Error al cargar historial por ciudad:", error);
    };

    // === FUNCIONES SENSORIALES GEOGRÁFICAS (GPS NATIVO) ===
    // Utiliza el hardware físico (Antena Wifi/GPS) para determinar en milisegundos las coordenadas de localización exacta. 
    const handleGeoLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            setError('');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const data = await fetchWeatherByCoords(latitude, longitude, MODULE_OWNER);
                        const forecastData = await fetch5DayForecast(`${latitude},${longitude}`, true);
                        setWeather(data);
                        setForecast(forecastData);
                        setCity(data.name);
                        loadCityHistoryFromSupabase(data.name);
                        loadGlobalHistoryFromSupabase();
                        loadFullHistoryStats();
                        generateAIWeatherReport(data, forecastData);
                    } catch (err) {
                        setError('Error al obtener el clima por ubicación.');
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setLoading(false);
                    setError('Permiso de geolocalización denegado o error al procesar ubicación.');
                }
            );
        } else {
            setError('Tu navegador no soporta geolocalización.');
        }
    };

    // === MÉTODOS DE MUTACIÓN, UTILIDAD Y MATEMÁTICAS (HELPERS) ===

    // Interceptor dinámico trans-matemático de Valores Centígrados/Fahrenheit asíncronos. Realiza la conversión si se presiona el botón Toggle Unit global.
    const displayTemp = (tempC) => {
        if (unit === 'F') return Math.round((tempC * 9 / 5) + 32);
        return Math.round(tempC);
    };

    const getComfortIndex = (tempC, humidity) => {
        if (tempC >= 30 && humidity >= 60) return { label: "Sofocante", color: "text-red-400 border-red-400/30 bg-red-400/10" };
        if (tempC >= 30 && humidity < 60) return { label: "Calor Seco", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" };
        if (tempC < 15) return { label: "Frío", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" };
        if (tempC >= 15 && tempC <= 28 && humidity >= 30 && humidity <= 60) return { label: "Agradable", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" };
        return { label: "Moderado", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
    };

    const toggleUnit = () => {
        setUnit(prev => prev === 'C' ? 'F' : 'C');
    };

    // === HOOKS SENSORIALES RE-CALCULADOS (MEMOIZATION PARA ALTO RENDIMIENTO) ===

    // Algoritmo Óptico: Retorna y evalúa un Color CSS con Gradiente y Blur "Neon" de acuerdo al grado de T°, así nunca parece plano el Glassmorphism.
    const dynamicModuleColor = useMemo(() => {
        if (!weather) return "bg-blue-500/20";
        const temp = weather.main.temp;
        if (temp < 15) return "bg-cyan-500/20"; // Cold
        if (temp > 28) return "bg-orange-500/20"; // Hot
        return "bg-emerald-500/20"; // Moderate
    }, [weather]);

    // Prepare chart data chronologically (oldest first)
    const chartData = useMemo(() => {
        if (!cityHistory.length) return [];
        return [...cityHistory].reverse().map(record => {
            const dateObj = new Date(record.created_at);
            return {
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: displayTemp(record.content.main.temp)
            };
        });
    }, [cityHistory, unit]);

    // Helper to pick Icon based on OWM icon code or condition
    const WeatherIcon = ({ code, className }) => {
        const id = code?.substring(0, 2);
        if (id === '01') return <Sun className={`text-yellow-400 ${className}`} />;
        if (id === '02') return <Cloud className={`text-yellow-200 ${className}`} />;
        if (['03', '04'].includes(id)) return <Cloud className={`text-slate-300 ${className}`} />;
        if (['09', '10'].includes(id)) return <CloudRain className={`text-blue-400 ${className}`} />;
        if (id === '11') return <CloudLightning className={`text-indigo-400 ${className}`} />;
        if (id === '13') return <Snowflake className={`text-cyan-300 ${className}`} />;
        return <Cloud className={`text-gray-400 ${className}`} />;
    };

    // Prepare Hourly Forecast (Next 24 hours = 8 items)
    const hourlyForecast = useMemo(() => {
        if (!forecast) return [];
        return forecast.list.slice(0, 8);
    }, [forecast]);

    // Prepare Weekly Forecast (1 reading per day ~ noon)
    const weeklyForecast = useMemo(() => {
        if (!forecast) return [];
        const daily = [];
        const seenDays = new Set();

        forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayString = date.toLocaleDateString();
            if (!seenDays.has(dayString) && (date.getHours() >= 11 || !seenDays.has(dayString))) {
                seenDays.add(dayString);
                daily.push(item);
            }
        });

        return daily.slice(1, 6);
    }, [forecast]);

    const getDayName = (timestamp) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[new Date(timestamp * 1000).getDay()];
    };

    const getShortTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // === MOTOR INTELIGENCIA ARTIFICIAL TEXTUAL DIRECTA (ON-PREMISE HEURISTICS) ===
    // Analizador Condicional Sintético de Inteligencia Artificial ("Reportero"). Evita Costos Operativos Exponenciales procesando el razonamiento matemáticamente usando reglas Big Data exactas y puristas.
    const generateAIWeatherReport = (currentWeather, forecastData) => {
        setIsGeneratingAi(true); // Engatillar parpadeo y animación de esqueleto 'Pensando/Procesando'

        // Simulating AI thinking delay for UX
        setTimeout(() => {
            if (!currentWeather) return;

            const temp = currentWeather.main.temp;
            const humidity = currentWeather.main.humidity;
            const wind = currentWeather.main.speed || currentWeather.wind?.speed || 0;
            const conditions = currentWeather.weather[0].description.toLowerCase();
            const cityName = currentWeather.name;

            // Analyze next few days for rain
            let upcomingRain = false;
            let expectedMaxTemp = -100;

            if (forecastData && forecastData.list) {
                // Check next 24-48 hours roughly
                const nearFuture = forecastData.list.slice(0, 16);
                nearFuture.forEach(item => {
                    if (item.weather[0].main.toLowerCase().includes('rain')) {
                        upcomingRain = true;
                    }
                    if (item.main.temp_max > expectedMaxTemp) {
                        expectedMaxTemp = item.main.temp_max;
                    }
                });
            }

            // Build narrative
            let report = `En ${cityName} se reportan condiciones ${conditions} con una temperatura actual de ${Math.round(temp)}°C. `;

            // Temperature logic
            if (temp < 10) {
                report += `Hace bastante frío. Te sugerimos abrigarte bien antes de salir. `;
            } else if (temp >= 10 && temp < 20) {
                report += `El clima está fresco y agradable. Una chaqueta ligera será suficiente. `;
            } else if (temp >= 20 && temp < 30) {
                report += `Tenemos una temperatura cálida y confortable, ideal para actividades al aire libre. `;
            } else {
                report += `Está haciendo mucho calor. Te recomendamos mantenerte hidratado, buscar la sombra y usar ropa fresca. `;
            }

            // Wind and Humidity logic
            if (wind > 8) {
                report += `Toma precauciones, pues se registran vientos fuertes (${wind} m/s). `;
            } else if (humidity > 80 && temp >= 25) {
                report += `La alta humedad (${humidity}%) hace que la sensación térmica sea un poco sofocante. `;
            }

            // Forecast logic
            if (upcomingRain) {
                report += `Según nuestros pronósticos, es muy probable que llueva en las próximas horas o el día de mañana. ¡No olvides tu paraguas!`;
            } else {
                if (expectedMaxTemp > temp + 3) {
                    report += `Se espera que la temperatura suba un poco más en los próximos días, alcanzando hasta ${Math.round(expectedMaxTemp)}°C.`;
                } else {
                    report += `El clima se mantendrá relativamente estable sin precipitaciones significativas a la vista.`;
                }
            }

            setAiReport(report);
            setIsGeneratingAi(false);
        }, 1500); // 1.5s simulated thinking time
    };

    // === ESQUELETO VISUAL DE CARGA DE ALTO IMPACTO (SKELETON LOADER UX) ===
    // Careta de plástico provisional dibujada y opacada durante los microsegundos donde no hay ninguna señal y la Red viaja al Extranjero (Mata el "Layout Shift" que tanto disgusta)
    const SkeletonLoader = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6 w-full"
        >
            <div className="glass-card h-64 border-white/10 animate-pulse bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                    <div className="space-y-4">
                        <div className="h-10 w-1/3 bg-white/10 rounded-lg"></div>
                        <div className="h-6 w-1/4 bg-white/10 rounded-lg"></div>
                    </div>
                    <div className="self-end h-20 w-24 bg-white/10 rounded-lg"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card h-32 border-white/10 animate-pulse bg-white/5" />
                ))}
            </div>
        </motion.div>
    );

    return (
        <ModuleTemplate title="Módulo Forecast" moduleColor={dynamicModuleColor}>
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 w-full">

                {/* Panel Principal */}
                <div className="lg:col-span-8 space-y-6 w-full min-w-0">
                    {/* Global Cities Quick Select */}
                    <div className="flex flex-wrap gap-2 items-center mb-2 z-20 relative">
                        <Globe className="w-4 h-4 text-premium-300 mr-2" />
                        <span className="text-sm font-medium text-premium-300 mr-2">Top Globales:</span>
                        {GLOBAL_CITIES.map(gCity => (
                            <button
                                key={gCity}
                                onClick={() => handleSearch(null, gCity)}
                                disabled={loading}
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors backdrop-blur-sm text-premium-200"
                            >
                                {gCity}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 relative z-20">
                        <form onSubmit={(e) => handleSearch(e)} className="relative flex-1">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Ej. Mérida, Campeche, Escárcega..."
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white placeholder-premium-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>
                        <button
                            type="button"
                            onClick={handleGeoLocation}
                            disabled={loading}
                            title="Usar mi ubicación actual"
                            className="aspect-square w-[58px] flex items-center justify-center bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-2xl border border-emerald-400/30 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 backdrop-blur-xl"
                        >
                            <MapPin className="w-6 h-6" />
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl text-center backdrop-blur-xl font-medium shadow-lg">
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <SkeletonLoader key="loader" />
                        ) : weather ? (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* 💎 PANEL MAESTRO PRINCIPAL (TARJETA TITÁN O HERO LAYER CDE REACCIÓN VISUAL DINÁMICA AL CLIMA) */}
                                <div className={`glass-card bg-gradient-to-br ${weather.main.temp < 15 ? 'from-cyan-600/30 to-blue-900/40 border-cyan-400/30' :
                                        weather.main.temp > 28 ? 'from-orange-600/30 to-red-900/40 border-orange-400/30' :
                                            'from-emerald-600/30 to-teal-900/40 border-emerald-400/30'
                                    } overflow-hidden relative shadow-[0_15px_50px_rgba(0,0,0,0.5)] group`}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                        className="absolute -right-10 -bottom-10 sm:-right-20 sm:-bottom-20 opacity-10 pointer-events-none"
                                    >
                                        <Thermometer className="w-64 h-64 sm:w-96 sm:h-96" />
                                    </motion.div>

                                    <div className="absolute top-0 right-0 p-4 sm:p-6 z-20">
                                        <button
                                            onClick={toggleUnit}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-xl transition-all shadow-lg"
                                        >
                                            °{unit === 'C' ? 'F' : 'C'}
                                        </button>
                                    </div>

                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 mt-6 sm:mt-0">
                                        <div className="w-full">
                                            {/* Location Hierarchy */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter drop-shadow-xl truncate max-w-full">{weather.name}</h2>
                                                {weather.sys?.country && (
                                                    <span className="text-xs sm:text-sm font-bold bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-white border border-white/20 backdrop-blur-md shadow-inner mb-1 flex-shrink-0">
                                                        {weather.sys.country}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-premium-100 capitalize text-lg sm:text-xl flex items-center gap-2 font-light tracking-wide mb-3 sm:mb-4">
                                                {weather.weather[0].description}
                                            </p>

                                            {/* Comfort Index Badge */}
                                            {(() => {
                                                const comfort = getComfortIndex(weather.main.temp, weather.main.humidity);
                                                return (
                                                    <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md border ${comfort.color}`}>
                                                        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
                                                            <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-current`}></span>
                                                        </span>
                                                        {comfort.label}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0 flex items-center justify-between md:block">
                                            <h3 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                                {displayTemp(weather.main.temp)}°<span className="text-3xl sm:text-4xl md:text-5xl text-white/40 ml-1">{unit}</span>
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* 🤖 VENTANA INTELIGENTE SINTÉTICA "IA REPORTERO LOCAL" (Genera Textos Explicativos a manera y Tono de Noticieros con Iconos parpadeando para efecto WOW 3D) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass-card bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border-white/10 p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                >
                                    {/* Decorative AI Glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

                                    <div className="flex gap-4 items-start relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-400/30">
                                            {isGeneratingAi ? (
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            ) : (
                                                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                Análisis IA del Clima
                                                {isGeneratingAi && <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 animate-pulse text-blue-200">Procesando</span>}
                                            </h3>

                                            <div className="min-h-[60px] flex items-center">
                                                {isGeneratingAi ? (
                                                    <div className="space-y-2 w-full">
                                                        <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
                                                        <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse"></div>
                                                        <div className="h-3 bg-white/10 rounded w-4/6 animate-pulse"></div>
                                                    </div>
                                                ) : (
                                                    <p className="text-premium-100 leading-relaxed text-sm md:text-base font-medium drop-shadow-sm">
                                                        {aiReport}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Hourly Forecast (Próximas 24 horas) */}
                                {hourlyForecast.length > 0 && (
                                    <div className="glass-card bg-black/10 border-white/5 p-4 overflow-hidden relative shadow-inner">
                                        <div className="flex overflow-x-auto gap-4 pb-2 custom-scrollbar snap-x">
                                            {hourlyForecast.map((hour, i) => (
                                                <div key={i} className="flex flex-col items-center justify-center min-w-[70px] snap-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                                                    <p className="text-xs font-semibold text-premium-200 mb-2">{getShortTime(hour.dt)}</p>
                                                    <WeatherIcon code={hour.weather[0].icon} className="w-6 h-6 mb-2" />
                                                    <p className="text-lg font-bold">{displayTemp(hour.main.temp)}°</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Details Grid - Premium Subtle Gradients */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all p-5 flex flex-col items-center justify-center text-center border-white/5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
                                        <Thermometer className="w-8 h-8 mb-3 text-blue-400 relative z-10" />
                                        <p className="text-sm text-premium-300 mb-1 relative z-10 font-medium">Sensación</p>
                                        <p className="font-bold text-2xl relative z-10 tracking-tight">{displayTemp(weather.main.feels_like)}°</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all p-5 flex flex-col items-center justify-center text-center border-white/5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-colors" />
                                        <Droplets className="w-8 h-8 mb-3 text-cyan-400 relative z-10" />
                                        <p className="text-sm text-premium-300 mb-1 relative z-10 font-medium">Humedad</p>
                                        <p className="font-bold text-2xl relative z-10 tracking-tight">{weather.main.humidity}%</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all p-5 flex flex-col items-center justify-center text-center border-white/5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-colors" />
                                        <Wind className="w-8 h-8 mb-3 text-teal-400 relative z-10" />
                                        <p className="text-sm text-premium-300 mb-1 relative z-10 font-medium">Viento</p>
                                        <p className="font-bold text-2xl relative z-10 tracking-tight">{weather.main.speed || weather.wind?.speed} m/s</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all p-5 flex flex-col items-center justify-center text-center border-white/5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors" />
                                        <Gauge className="w-8 h-8 mb-3 text-indigo-400 relative z-10" />
                                        <p className="text-sm text-premium-300 mb-1 relative z-10 font-medium">Presión</p>
                                        <p className="font-bold text-2xl relative z-10 tracking-tight">{weather.main.pressure} hPa</p>
                                    </motion.div>
                                </div>

                                {/* 📅 FILA PRONÓSTICA PARA 5 DÍAS FUTUROS LONGITUDINALES (Proyecta al horizonte ampliado en cuadros independientes extendidos) */}
                                {weeklyForecast.length > 0 && (
                                    <div className="glass-card border-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-gradient-to-b from-black/20 to-black/40">
                                        <h3 className="text-sm font-bold text-premium-200 mb-4 uppercase tracking-wider">
                                            Próximos {weeklyForecast.length} Días
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                            {weeklyForecast.map((day, idx) => (
                                                <div key={idx} className="glass-card bg-white/5 p-4 flex flex-col justify-center items-center text-center border-white/5 hover:bg-white/10 transition-colors">
                                                    <p className="text-sm font-bold text-premium-300 uppercase tracking-widest">{getDayName(day.dt)}</p>
                                                    <p className="text-[10px] text-premium-400 mt-1 mb-2">{new Date(day.dt * 1000).toLocaleDateString()}</p>
                                                    <WeatherIcon code={day.weather[0].icon} className="w-10 h-10 mb-2" />
                                                    <p className="font-black text-2xl text-white drop-shadow-md">
                                                        {displayTemp(day.main.temp)}°
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Panel Historial y Gráfica */}
                <div className="lg:col-span-4 flex flex-col gap-6 self-start w-full min-w-0">

                    {/* Map Component */}
                    <div className="glass-card w-full border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-gradient-to-b from-black/20 to-black/40">
                        <h3 className="text-sm font-bold text-premium-200 mb-4 uppercase tracking-wider flex items-center justify-between">
                            Ubicación Geográfica
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">MAP</span>
                        </h3>
                        <div className="w-full h-[200px] rounded-xl overflow-hidden bg-black/40 border border-white/10 relative flex items-center justify-center">
                            {weather && weather.coord ? (
                                <iframe
                                    title="Weather Location Map"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight="0"
                                    marginWidth="0"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.coord.lon - 0.2},${weather.coord.lat - 0.2},${weather.coord.lon + 0.2},${weather.coord.lat + 0.2}&layer=mapnik&marker=${weather.coord.lat},${weather.coord.lon}`}
                                    className="w-full h-full opacity-70 hover:opacity-100 transition-opacity filter invert-[0.9] hue-rotate-180"
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center opacity-30">
                                    <MapPin className="w-10 h-10 mb-2" />
                                    <p className="text-xs font-medium">Buscando ubicación...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recharts - Temperature Trend */}
                    {weather && chartData.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card w-full border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-gradient-to-b from-black/20 to-black/40"
                        >
                            <h3 className="text-sm font-bold text-premium-200 mb-4 uppercase tracking-wider flex items-center justify-between">
                                Tendencia (Últimos Registros)
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">GIN Index</span>
                            </h3>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={8} minTickGap={15} />
                                        <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                                            formatter={(value) => [`${value}°${unit}`, 'Temp']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="#60a5fa"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#1e293b', stroke: '#60a5fa', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}

                    {/* Historial Sidebar */}
                    <div className="glass-card w-full flex-1 flex flex-col border-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] min-h-[400px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-white">
                            Consultas Anteriores
                        </h3>

                        {loading && !globalHistory.length ? (
                            <div className="space-y-4 flex-1 w-full">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}
                            </div>
                        ) : globalHistory.length > 0 ? (
                            <div className="flex flex-col w-full h-full justify-between">
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
                                    <AnimatePresence>
                                        {globalHistory.map((record, idx) => {
                                            const content = record.content;
                                            const dateObj = new Date(record.created_at);
                                            return (
                                                <motion.div
                                                    key={`${idx}-${record.created_at}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    onClick={() => handleSearch(null, content.name)}
                                                    className="group bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 transition-all p-4 rounded-xl border border-white/5 cursor-pointer flex items-center gap-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center font-black text-white shadow-inner flex-shrink-0 group-hover:scale-110 group-hover:border-blue-400/50 transition-all duration-300">
                                                        {content.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-premium-100 truncate text-base">{content.name}</p>
                                                        <p className="text-[11px] font-medium text-premium-400 mt-0.5 truncate uppercase tracking-wider">
                                                            {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-white">{displayTemp(content.main.temp)}°</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold transition-all border border-blue-500/20"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Ver todas las consultas</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-6 text-premium-400 border border-dashed border-white/10 rounded-xl bg-black/20">
                                <Search className="w-10 h-10 mb-4 opacity-20" />
                                <p className="font-medium">{!weather ? "Busca tu primera ciudad" : "Sin historial previo"}</p>
                                <p className="text-xs opacity-60 mt-1">El historial aparecerá aquí</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* History Table Modal - Portal rendered to break out of container restrictions */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showHistoryModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-10 bg-black/60 backdrop-blur-md"
                            onClick={() => setShowHistoryModal(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="glass-card w-full max-w-4xl max-h-[85vh] flex flex-col border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-slate-900/90 to-black/95 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                        Estadísticas de Búsqueda
                                    </h2>
                                    <button
                                        onClick={() => setShowHistoryModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-premium-300 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-premium-300 text-sm uppercase tracking-wider">
                                                <th className="pb-4 font-bold">Ciudad</th>
                                                <th className="pb-4 font-bold text-center">Última Temp</th>
                                                <th className="pb-4 font-bold text-center">Búsquedas Totales</th>
                                                <th className="pb-4 font-bold text-right">Consulta Reciente</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fullHistoryStats.map((stat, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs">
                                                                {stat.country || stat.name.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-premium-100 group-hover:text-blue-400 transition-colors">{stat.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center font-medium text-white">
                                                        {displayTemp(stat.lastTemp)}°
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                            {stat.count}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right text-sm text-premium-400 font-medium">
                                                        {new Date(stat.lastSearched).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </ModuleTemplate>
    );
}
