import { Link } from 'react-router-dom';
import { CloudRain, Map as MapIcon, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function HomePage() {
    const [timeOfDay, setTimeOfDay] = useState('day');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
            setTimeOfDay('night');
        } else {
            setTimeOfDay('day');
        }
    }, []);

    const bgStyles = timeOfDay === 'night'
        ? "from-indigo-900 via-purple-900 to-black"
        : "from-blue-600 via-cyan-500 to-indigo-800";

    const blob1 = timeOfDay === 'night' ? "bg-purple-600/30" : "bg-cyan-300/30";
    const blob2 = timeOfDay === 'night' ? "bg-indigo-600/30" : "bg-amber-300/30";

    return (
        <div className={`min-h-screen p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${bgStyles}`}>
            {/* Background decorations */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] -z-10 ${blob1}`}
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className={`absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full blur-[120px] -z-10 ${blob2}`}
            />

            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                {/* Quick Stats Marquee */}
                <div className="w-full max-w-3xl overflow-hidden mb-12 py-2 relative rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg">
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="flex whitespace-nowrap items-center text-sm md:text-base font-medium text-white/90"
                    >
                        <span className="mx-8 flex items-center gap-2">🔥 Tendencia: Campeche 35°C</span>
                        <span className="mx-8 flex items-center gap-2">📍 Ciudad más buscada hoy: Mérida</span>
                        <span className="mx-8 flex items-center gap-2">❄️ Frente frío aproximándose por el Norte</span>
                        <span className="mx-8 flex items-center gap-2">🌧️ Probabilidad de lluvia: Escárcega 80%</span>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 relative z-10"
                >
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl text-white">
                        Weather<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">Flow</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
                        Arquitectura modular para analítica y pronóstico del clima.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
                    {/* Módulo A Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            to="/module-a"
                            className="h-full bg-white/10 backdrop-blur-xl group relative overflow-hidden flex flex-col p-8 md:p-10 text-left border border-white/20 hover:border-cyan-400/50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-80" />
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-inner">
                                    <CloudRain className="w-12 h-12 text-cyan-300" />
                                </div>
                                <motion.div
                                    className="p-3 bg-white/5 rounded-full backdrop-blur-sm"
                                    whileHover={{ x: 5 }}
                                >
                                    <ChevronRight className="w-8 h-8 text-white/50 group-hover:text-cyan-300 transition-colors" />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Consultar Clima</h2>
                            <p className="text-white/70 text-lg leading-relaxed">Consulta las condiciones actuales, índice de confort y registra datos históricos.</p>

                            {/* Decorative background icon */}
                            <CloudRain className="absolute -bottom-6 -right-6 w-48 h-48 text-cyan-400/10 blur-xl group-hover:text-cyan-400/20 transition-colors duration-500" />
                        </Link>
                    </motion.div>

                    {/* Módulo B Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link
                            to="/module-b"
                            className="h-full bg-white/10 backdrop-blur-xl group relative overflow-hidden flex flex-col p-8 md:p-10 text-left border border-white/20 hover:border-purple-400/50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 opacity-80" />
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-inner">
                                    <Activity className="w-12 h-12 text-purple-300" />
                                </div>
                                <motion.div
                                    className="p-3 bg-white/5 rounded-full backdrop-blur-sm"
                                    whileHover={{ x: 5 }}
                                >
                                    <ChevronRight className="w-8 h-8 text-white/50 group-hover:text-purple-300 transition-colors" />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Estadísticas</h2>
                            <p className="text-white/70 text-lg leading-relaxed">Visualiza mapas, historiales profundos y analíticas globales del sistema.</p>

                            {/* Decorative background icon */}
                            <MapIcon className="absolute -bottom-6 -right-6 w-48 h-48 text-purple-400/10 blur-xl group-hover:text-purple-400/20 transition-colors duration-500" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
