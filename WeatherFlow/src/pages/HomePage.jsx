import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, Map as MapIcon, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
    const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' or 'night'

    useEffect(() => {
        const hour = new Date().getHours();
        // Day: 6 AM to 6 PM (18:00)
        if (hour >= 6 && hour < 18) {
            setTimeOfDay('day');
        } else {
            setTimeOfDay('night');
        }
    }, []);

    const isDay = timeOfDay === 'day';

    // Background gradients based on time of day
    const bgGradients = isDay 
        ? "bg-amber-500/20 blur-[150px]" 
        : "bg-blue-600/20 blur-[150px]";
    
    const bgGradientsSecondary = isDay 
        ? "bg-sky-400/20 blur-[150px]" 
        : "bg-purple-600/20 blur-[150px]";

    return (
        <div className="min-h-screen p-6 md:p-10 flex flex-col items-center justify-center max-w-5xl mx-auto relative overflow-hidden">
            {/* Dynamic Background decorations */}
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-0 left-0 w-full h-full pointer-events-none -z-20 ${
                    isDay ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-900' : 'bg-gradient-to-br from-black via-slate-950 to-indigo-950'
                } opacity-50`} 
            />
            <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full transition-colors duration-1000 -z-10 ${bgGradients}`} />
            <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full transition-colors duration-1000 -z-10 ${bgGradientsSecondary}`} />

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16 relative z-10"
            >
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl">
                    Weather<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Flow</span>
                </h1>
                <p className="text-xl md:text-2xl text-premium-200 max-w-2xl mx-auto font-light leading-relaxed">
                    Arquitectura modular para analítica y pronóstico del clima.
                </p>
            </motion.div>

            {/* Quick Stats Marquee */}
            <div className="w-full max-w-4xl mb-12 overflow-hidden relative z-10 glass-card rounded-full border-white/5 py-3 px-6 shadow-2xl">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap items-center gap-12"
                >
                    <div className="flex items-center gap-2 text-premium-200">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span><strong>Tendencia:</strong> Mérida es la ciudad más buscada hoy</span>
                    </div>
                    <div className="flex items-center gap-2 text-premium-200">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span><strong>Temperatura Global:</strong> +1.2°C sobre el promedio</span>
                    </div>
                    <div className="flex items-center gap-2 text-premium-200">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span><strong>Clima Severo:</strong> Alertas activas en la costa sureste</span>
                    </div>
                    {/* Duplicate for seamless infinite scroll */}
                    <div className="flex items-center gap-2 text-premium-200">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span><strong>Tendencia:</strong> Mérida es la ciudad más buscada hoy</span>
                    </div>
                </motion.div>
                {/* Gradient Fades for Marquee */}
                <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
                {/* Módulo A Card */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Link
                        to="/module-a"
                        className="glass-card group relative overflow-hidden flex flex-col p-10 text-left border border-white/10 hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-300 backdrop-blur-xl h-full"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80" />
                        
                        <motion.div 
                            className="absolute -right-10 -top-10 opacity-30 blur-2xl pointer-events-none"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="w-40 h-40 bg-blue-500/50 rounded-full" />
                        </motion.div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="p-5 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors duration-500 border border-blue-500/20 shadow-inner">
                                <CloudRain className="w-12 h-12 text-blue-400" />
                            </div>
                            <ChevronRight className="w-8 h-8 text-premium-400 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 relative z-10 tracking-tight">Consultar Clima</h2>
                        <p className="text-premium-300 text-lg relative z-10 leading-relaxed">
                            Módulo Forecast. Consulta el clima actual, visualiza previsiones y registra datos del comportamiento atmosférico.
                        </p>
                    </Link>
                </motion.div>

                {/* Módulo B Card */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Link
                        to="/module-b"
                        className="glass-card group relative overflow-hidden flex flex-col p-10 text-left border border-white/10 hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300 backdrop-blur-xl h-full"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-80" />
                        
                        <motion.div 
                            className="absolute -right-10 -top-10 opacity-30 blur-2xl pointer-events-none"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="w-40 h-40 bg-purple-500/50 rounded-full" />
                        </motion.div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="p-5 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors duration-500 border border-purple-500/20 shadow-inner">
                                <MapIcon className="w-12 h-12 text-purple-400" />
                            </div>
                            <ChevronRight className="w-8 h-8 text-premium-400 group-hover:text-purple-400 group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 relative z-10 tracking-tight">Estadísticas</h2>
                        <p className="text-premium-300 text-lg relative z-10 leading-relaxed">
                            Módulo Stats. Visualiza historiales detallados y analíticas globales en una interfaz avanzada.
                        </p>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
