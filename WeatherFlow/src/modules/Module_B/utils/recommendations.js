/**
 * Mapea los datos del clima a los tipos de condición usados en la base de datos
 * para el motor de recomendaciones.
 */
export const getConditionType = (weatherData) => {
    if (!weatherData) return 'templado';
  
    const temp = weatherData.main?.temp;
    const isRaining = weatherData.rain || (weatherData.weather && weatherData.weather[0].main === 'Rain');
  
    if (isRaining) return 'lluvia';
    if (temp > 34) return 'calor';
    if (temp < 15) return 'frio';
    if (temp >= 20 && temp <= 28) return 'templado';
    
    return 'templado'; // Default
  };
