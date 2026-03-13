import ModuleTemplate from '../../components/ModuleTemplate';
import WeatherRankings from './components/WeatherRankings';
import RecommendationCard from './components/RecommendationCard';

export default function StatsModule() {
    return (
        <ModuleTemplate title="Módulo Stats" moduleColor="bg-purple-500/20">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
                {/* Rankings Climáticos Globales y por País (Análisis en Tiempo Real) */}
                <WeatherRankings />
                
                {/* Motor de Recomendaciones (Basado en el último clima guardado) */}
                <RecommendationCard />
            </div>
        </ModuleTemplate>
    );
}
