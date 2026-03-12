import { useState, useEffect } from 'react';
import { Sparkles, RefreshCcw, Loader2, Thermometer, MapPin } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getConditionType } from '../utils/recommendations';

export default function RecommendationCard() {
  const [recommendation, setRecommendation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      // 1. Obtener el último clima registrado en la BD para este usuario/sistema
      const { data: historyData, error: historyError } = await supabase
        .from('weather_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (historyError) throw historyError;

      if (historyData && historyData.length > 0) {
        const lastWeather = historyData[0].content;
        setWeather(lastWeather);
        
        const condition = getConditionType(lastWeather);

        // 2. Llamar a la función RPC de Supabase para obtener una recomendación aleatoria
        const { data: recData, error: recError } = await supabase
          .rpc('get_random_recommendation', { p_condition_type: condition });

        if (recError) throw recError;

        if (recData && recData.length > 0) {
          setRecommendation(recData[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  if (loading) {
    return (
      <div className="glass-card bg-purple-500/5 border-purple-500/20 p-8 flex flex-col items-center gap-4 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-premium-400 text-sm">Escaneando condiciones actuales...</p>
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="group relative glass-card p-8 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-black/40 overflow-hidden shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl shadow-inner">
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Sugerencia Inteligente</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {recommendation.category}
                </span>
                <span className="text-[10px] text-premium-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {weather?.name || 'Clima detectado'}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={fetchRecommendation}
            className="p-2 text-premium-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xl md:text-2xl font-medium text-premium-100 leading-relaxed italic">
            "{recommendation.message}"
          </p>
          
          <div className="flex items-center gap-6 pt-4 border-t border-white/5 mx-[-1rem] px-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-premium-200">{Math.round(weather?.main?.temp)}°C</span>
            </div>
            <div className="text-xs text-premium-500 font-medium">
              Basado en las condiciones actuales registradas.
            </div>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full translate-y-16 -translate-x-16"></div>
    </div>
  );
}
