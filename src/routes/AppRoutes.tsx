import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SeancePage from '../pages/SeancePage';
import ConfigPage from '../pages/ConfigPage';
import StatistiquesPage from '../pages/StatistiquesPage';
import JoueursTypesPage from '../pages/JoueursTypesPage';
import DonneesPage from '../pages/DonneesPage';
import CampagnesSeancesPage from '../pages/CampagnesSeancesPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/statistiques" element={<StatistiquesPage />} />
      
      {/* Routes protégées (admin seulement) */}
      <Route path="/seance" element={<ProtectedRoute><SeancePage /></ProtectedRoute>} />
      <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
      <Route path="/joueurs-types" element={<ProtectedRoute><JoueursTypesPage /></ProtectedRoute>} />
      <Route path="/campagnes-seances" element={<ProtectedRoute><CampagnesSeancesPage /></ProtectedRoute>} />
      <Route path="/donnees" element={<ProtectedRoute><DonneesPage /></ProtectedRoute>} />
      
      {/* Route par défaut - redirige vers statistiques */}
      <Route path="*" element={<Navigate to="/statistiques" replace />} />
    </Routes>
  );
} 