import { supabase } from './supabase';

const API_KEY = '9881114244119304be93da42d1185931';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Consulta el clima actual para una ciudad y guarda el resultado en Supabase
 * @param {string} city - Nombre de la ciudad
 * @param {string} moduleOwner - Identificador del módulo ('ModuleForecast' o 'ModuleStats')
 * @returns {Promise<Object>} Datos del clima (JSON puro de la API)
 */
export const fetchAndStoreWeather = async (city, moduleOwner) => {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const weatherData = await response.json();

        // Almacenando en Supabase usando la columna JSONB 'content'
        const { error } = await supabase
            .from('weather_history')
            .insert([
                {
                    module_owner: moduleOwner,
                    content: weatherData
                }
            ]);

        if (error) {
            console.error("Error insertando en Supabase:", error);
        }

        return weatherData;
    } catch (error) {
        console.error("Error en WeatherAPI:", error);
        throw error;
    }
};

/**
 * Consulta el clima actual por coordenadas (latitud y longitud) y guarda el resultado
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @param {string} moduleOwner - Identificador del módulo
 * @returns {Promise<Object>} Datos del clima
 */
export const fetchWeatherByCoords = async (lat, lon, moduleOwner) => {
    try {
        const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`);
        const weatherData = await response.json();
        
        // Guardar en Supabase para mantener el historial
        await supabase.from('weather_history').insert([{
            module_owner: moduleOwner,
            content: weatherData
        }]);

        return weatherData;
    } catch (error) {
        console.error("Error en WeatherAPI por Coords:", error);
        throw error;
    }
};

/**
 * Consulta el pronóstico de 5 días (cada 3 horas)
 * @param {string} query - Nombre de la ciudad (o string lat,lon si es por coordenadas pero manejado distinto)
 * @param {boolean} isCoords - Indica si el query son coordenadas en formato "lat,lon"
 * @returns {Promise<Object>} Datos del pronóstico extendido
 */
export const fetch5DayForecast = async (query, isCoords = false) => {
    try {
        let url = `${BASE_URL}/forecast?appid=${API_KEY}&units=metric&lang=es`;
        
        if (isCoords) {
            const [lat, lon] = query.split(',');
            url += `&lat=${lat}&lon=${lon}`;
        } else {
            url += `&q=${query}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error en la solicitud Forecast: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en Fetch 5-Day Forecast:", error);
        throw error;
    }
};
