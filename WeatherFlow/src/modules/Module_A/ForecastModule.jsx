import { useState } from 'react';
import { Search, Loader2, Thermometer, Wind, Droplets, Gauge, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ModuleTemplate from '../../components/ModuleTemplate';
import { fetchAndStoreWeather } from '../../lib/weatherApi';
import { supabase } from '../../lib/supabase';

// Utility para juntar clases
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Cálculo del Heat Index (Índice de Confort) aproximado
const getComfortIndex = (tempC, humidity) => {
    if (tempC < 20) return { label: 'Fresco', color: 'text-cyan-300' };
    if (tempC > 27 && humidity > 60) return { label: 'Abochornado', color: 'text-amber-400' };
    if (tempC > 35) return { label: 'Caluroso', color: 'text-red-400' };
    return { label: 'Confortable', color: 'text-green-300' };
};

export default function ForecastModule() {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [isCelsius, setIsCelsius] = useState(true);

    const MODULE_OWNER = 'ModuleForecast';

    const handleSearch = async (e, searchCity = city) => {
        if (e) e.preventDefault();
        if (!searchCity.trim()) return;

        setCity(searchCity);
        setLoading(true);
        setError('');

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

    const formatTemp = (tempC) => {
        if (isCelsius) return `${Math.round(tempC)}°`;
        return `${Math.round((tempC * 9 / 5) + 32)}°`;
    };

    return (
        <ModuleTemplate title="Forecast" moduleColor="bg-cyan-500/10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 relative z-10 p-4 md:p-0">

                {/* Panel Principal */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSearch}
                        className="relative group w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Buscar ciudad (Ej. Mérida, Campeche...)"
                            className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl py-5 pl-8 pr-20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all font-medium shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-lg"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-3 bottom-3 aspect-square flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white rounded-2xl transition-all shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                        </button>
                    </motion.form>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/20 border border-red-500/50 backdrop-blur-md text-red-200 p-4 rounded-2xl text-center shadow-lg"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Skeletons Loader */}
                    {loading && !weather && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-pulse"
                        >
                            <div className="h-12 bg-white/10 rounded-full w-1/3 mb-4" />
                            <div className="h-6 bg-white/10 rounded-full w-1/4 mb-12" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-32 bg-white/10 rounded-2xl" />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Main Weather Card */}
                    <AnimatePresence>
                        {weather && !loading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                                className="relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                            >
                                {/* Glowing ambient background */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                                    <div>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center gap-3 mb-2"
                                        >
                                            <MapPin className="w-8 h-8 text-cyan-400" />
                                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">{weather.name}</h2>
                                        </motion.div>
                                        <motion.p
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-cyan-200 capitalize text-xl md:text-2xl font-light tracking-wide ml-11"
                                        >
                                            {weather.weather[0].description}
                                        </motion.p>
                                    </div>

                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", delay: 0.4 }}
                                        className="flex flex-col items-end"
                                    >
                                        <h3 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 tracking-tighter drop-shadow-lg">
                                            {formatTemp(weather.main.temp)}
                                        </h3>

                                        {/* Toggle Component */}
                                        <div className="mt-4 flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                                            <button
                                                onClick={() => setIsCelsius(true)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                                                    isCelsius ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
                                                )}
                                            >
                                                °C
                                            </button>
                                            <button
                                                onClick={() => setIsCelsius(false)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                                                    !isCelsius ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
                                                )}
                                            >
                                                °F
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Comfort Index */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-sm"
                                >
                                    <span className="text-white/70 font-medium">Índice de Confort</span>
                                    {(() => {
                                        const comfort = getComfortIndex(weather.main.temp, weather.main.humidity);
                                        return (
                                            <span className={cn("px-4 py-1 rounded-full bg-black/40 font-semibold border border-white/5", comfort.color)}>
                                                {comfort.label}
                                            </span>
                                        );
                                    })()}
                                </motion.div>

                                {/* Highlights Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                                    {[
                                        { icon: Thermometer, label: 'Sensación', value: formatTemp(weather.main.feels_like), color: 'text-orange-400' },
                                        { icon: Droplets, label: 'Humedad', value: `${weather.main.humidity}%`, color: 'text-cyan-400' },
                                        { icon: Wind, label: 'Viento', value: `${weather.wind.speed} m/s`, color: 'text-teal-400' },
                                        { icon: Gauge, label: 'Presión', value: `${weather.main.pressure} hPa`, color: 'text-purple-400' },
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + (idx * 0.1) }}
                                            whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
                                            className="bg-white/5 backdrop-blur-md rounded-2xl p-5 text-center border border-white/10 flex flex-col items-center justify-center transition-colors duration-300"
                                        >
                                            <item.icon className={cn("w-8 h-8 mb-3", item.color)} />
                                            <p className="text-sm text-white/60 mb-1 font-medium">{item.label}</p>
                                            <p className="font-bold text-xl text-white">{item.value}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Historial */}
                <div className="lg:col-span-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/30 backdrop-blur-xl h-[600px] lg:h-full flex flex-col border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                    >
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Búsquedas Recientes
                            </h3>
                            <p className="text-sm text-white/50 mt-1">Sincronizado con Supabase</p>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                                {history.length > 0 ? (
                                    <div className="space-y-3">
                                        {history.map((record, idx) => {
                                            const content = record.content;
                                            const dateObj = new Date(record.created_at);
                                            return (
                                                <motion.button
                                                    key={`${record.created_at}-${idx}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSearch(null, content.name)}
                                                    className="w-full text-left bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 min-w-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                                                            <MapPin className="w-5 h-5 text-cyan-400" />
                                                        </div>
                                                        <div className="truncate pr-2">
                                                            <p className="font-semibold text-white/90 group-hover:text-cyan-300 transition-colors truncate">{content.name}</p>
                                                            <p className="text-xs text-white/40 mt-0.5">
                                                                {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right pl-2">
                                                        <span className="text-lg font-bold text-white/80">{formatTemp(content.main.temp)}</span>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40"
                                    >
                                        <Search className="w-12 h-12 mb-4 opacity-20" />
                                        <p>{!weather ? "Busca una ciudad para comenzar a guardar el historial." : "No hay registros antiguos."}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

            </div>
        </ModuleTemplate>
    );
}
