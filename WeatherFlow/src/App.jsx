import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForecastModule from './modules/Module_A/ForecastModule';
import StatsModule from './modules/Module_B/StatsModule';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/module-a" element={<ForecastModule />} />
            <Route path="/module-b" element={<StatsModule />} />
          </Routes>
        </main>

        <footer className="w-full py-4 text-center text-premium-300 text-sm backdrop-blur-sm bg-black/10 border-t border-white/5 relative z-50 transition-colors duration-300 hover:text-premium-200">
          <p>
            Desarrollado por <span className="font-medium text-blue-400">Ángel Solís y Mayra Huicab</span> | ISC 2026
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
