import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ModuleTemplate({ title, children, moduleColor = 'bg-blue-500/10' }) {
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10 max-w-7xl mx-auto flex flex-col w-full overflow-x-hidden">
            <header className="flex items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
                <Link
                    to="/"
                    className="p-2 sm:p-3 rounded-full glass-card hover:bg-white/10 transition-colors flex-shrink-0"
                    title="Regresar al Inicio"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm truncate">{title}</h1>
            </header>

            <main className={`flex-1 glass-panel border-t border-l border-white/20 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 min-h-[60vh] md:min-h-[70vh] shadow-2xl relative overflow-hidden`}>
                {/* Decorative background glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20 ${moduleColor.replace('bg-', 'bg-').split('/')[0]}`} />

                <div className="relative z-10 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
