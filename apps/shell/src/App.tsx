import { Navigate, Route, Routes } from 'react-router-dom';
import RemoteBoundary from './RemoteBoundary';
import AppLayout from './layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PokemonDetailPage from './pages/PokemonDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:name" element={<PokemonDetailPage />} />
          <Route
            path="/history"
            element={
              <RemoteBoundary
                label="mf2History/History"
                loader={() => import('mf2History/History')}
                componentProps={{}}
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
