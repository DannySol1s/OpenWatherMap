import { useState } from 'react';
import { Search, Loader2, Thermometer, Wind, Droplets, Gauge, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleTemplate from '../../components/ModuleTemplate';
import { fetchAndStoreWeather, fetchWeatherByCoords } from '../../lib/weatherApi';
import { supabase } from '../../lib/supabase';

export default function ForecastModule() {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [unit, setUnit] = useState('C');

    const MODULE_OWNER = 'ModuleForecast';

    const handleSearch = async (e, searchCity = city) => {
        if (e) e.preventDefault();
        if (!searchCity.trim()) return;

        setLoading(true);
        setError('');
        
        if (searchCity !== city) setCity(searchCity);

        try {
            const data = await fetchAndStoreWeather(searchCity, MODULE_OWNER);
            setWeather(data);
            loadHistoryFromSupabase(data.name);
        } catch (err) {
            setError('Error al obtener el clima. Por favor, revisa el nombre de la ciudad.');
            setWeather(null);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryFromSupabase = async (cityName) => {
        const { data, error } = await supabase
            .from('weather_history')
            .select('created_at, content')
            .eq('module_owner', MODULE_OWNER)
            .eq('content->name', cityName)
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setHistory(data);
        if (error) console.error("Error al cargar historial:", error);
    };

    const handleGeoLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            setError('');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const data = await fetchWeatherByCoords(latitude, longitude, MODULE_OWNER);
                        setWeather(data);
                        setCity(data.name);
                        loadHistoryFromSupabase(data.name);
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

    const displayTemp = (tempC) => {
        if (unit === 'F') return Math.round((tempC * 9/5) + 32);
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

    // Skeleton Loader Component
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
        <ModuleTemplate title="Módulo Forecast" moduleColor="bg-blue-500/20">
            <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8">
                
                {/* Panel Principal */}
                <div className="md:col-span-8 space-y-6">
                    <div className="flex gap-3 relative z-20">
                        <form onSubmit={(e) => handleSearch(e)} className="relative flex-1">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Ej. Mérida, Campeche, Escárcega..."
                                className="w-full bg-black/20 border border-white/20 rounded-2xl py-4 pl-6 pr-16 text-white placeholder-premium-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>
                        <button
                            type="button"
                            onClick={handleGeoLocation}
                            disabled={loading}
                            title="Usar mi ubicación actual"
                            className="aspect-square w-[58px] flex items-center justify-center bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-2xl border border-emerald-400/30 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 backdrop-blur-md"
                        >
                            <MapPin className="w-6 h-6" />
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center backdrop-blur-md">
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
                                {/* Main Card */}
                                <div className="glass-card bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border-blue-400/30 overflow-hidden relative shadow-[0_0_50px_rgba(59,130,246,0.15)] group">
                                    <motion.div 
                                        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                        className="absolute -right-20 -bottom-20 opacity-10"
                                    >
                                        <Thermometer className="w-96 h-96" />
                                    </motion.div>
                                    
                                    <div className="absolute top-0 right-0 p-6 z-20">
                                        <button 
                                            onClick={toggleUnit}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-semibold backdrop-blur-md transition-colors"
                                        >
                                            °{unit === 'C' ? 'F' : 'C'}
                                        </button>
                                    </div>

                                    <div className="relative z-10 flex justify-between items-end p-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-5xl font-black tracking-tight drop-shadow-lg">{weather.name}</h2>
                                                {weather.sys?.country && (
                                                    <span className="text-lg bg-blue-500/30 px-2 py-1 rounded-lg text-blue-100 uppercase border border-blue-400/30 backdrop-blur-sm self-end mb-1">
                                                        {weather.sys.country}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-blue-200 capitalize text-xl flex items-center gap-2 font-light">
                                                {weather.weather[0].description}
                                            </p>
                                            
                                            {/* Comfort Index Badge */}
                                            {(() => {
                                                const comfort = getComfortIndex(weather.main.temp, weather.main.humidity);
                                                return (
                                                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border font-medium ${comfort.color}`}>
                                                        <span className="relative flex h-2 w-2">
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
                                                            <span className={`relative inline-flex rounded-full h-2 w-2 bg-current`}></span>
                                                        </span>
                                                        {comfort.label}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        <div className="text-right">
                                            <h3 className="text-8xl font-black tracking-tighter drop-shadow-2xl">
                                                {displayTemp(weather.main.temp)}°<span className="text-4xl text-white/50">{unit}</span>
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <motion.div whileHover={{ y: -5 }} className="glass-card hover:bg-white/10 transition-colors p-5 flex flex-col items-center justify-center text-center border-white/5">
                                        <Thermometer className="w-8 h-8 mb-3 text-blue-400" />
                                        <p className="text-sm text-premium-300 mb-1">Sensación</p>
                                        <p className="font-semibold text-2xl">{displayTemp(weather.main.feels_like)}°</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="glass-card hover:bg-white/10 transition-colors p-5 flex flex-col items-center justify-center text-center border-white/5">
                                        <Droplets className="w-8 h-8 mb-3 text-cyan-400" />
                                        <p className="text-sm text-premium-300 mb-1">Humedad</p>
                                        <p className="font-semibold text-2xl">{weather.main.humidity}%</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="glass-card hover:bg-white/10 transition-colors p-5 flex flex-col items-center justify-center text-center border-white/5">
                                        <Wind className="w-8 h-8 mb-3 text-teal-400" />
                                        <p className="text-sm text-premium-300 mb-1">Viento</p>
                                        <p className="font-semibold text-2xl">{weather.wind.speed} m/s</p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="glass-card hover:bg-white/10 transition-colors p-5 flex flex-col items-center justify-center text-center border-white/5">
                                        <Gauge className="w-8 h-8 mb-3 text-indigo-400" />
                                        <p className="text-sm text-premium-300 mb-1">Presión</p>
                                        <p className="font-semibold text-2xl">{weather.main.pressure} hPa</p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Panel Historial */}
                <div className="md:col-span-4">
                    <div className="glass-card h-full flex flex-col border-white/10 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                            Historial Reciente
                            <span className="text-[10px] font-mono text-premium-400 bg-black/30 px-2 py-1 rounded-full border border-white/5">GIN Filtered</span>
                        </h3>

                        {loading && !history.length ? (
                            <div className="space-y-4 flex-1">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}
                            </div>
                        ) : history.length > 0 ? (
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {history.map((record, idx) => {
                                        const content = record.content;
                                        const dateObj = new Date(record.created_at);
                                        return (
                                            <motion.div 
                                                key={`${idx}-${record.created_at}`}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => handleSearch(null, content.name)}
                                                className="group bg-black/20 hover:bg-white/10 transition-all p-4 rounded-xl border border-white/5 cursor-pointer flex items-center gap-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                            >
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    {content.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white truncate">{content.name}</p>
                                                    <p className="text-xs text-premium-400 mt-0.5 truncate">
                                                        {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold">{displayTemp(content.main.temp)}°</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-premium-400 border border-dashed border-white/10 rounded-xl bg-black/10">
                                <Search className="w-8 h-8 mb-3 opacity-20" />
                                {!weather ? "Busca una ciudad para ver el historial." : "No hay más registros."}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </ModuleTemplate>
    );
}
