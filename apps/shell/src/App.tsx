import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';
import RemoteBoundary from './RemoteBoundary';
import AppLayout from './layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PokemonDetailPage from './pages/PokemonDetailPage';

// `createBrowserRouter` (the "data router") instead of the classic `<BrowserRouter>` — the
// latter doesn't wire navigation through `document.startViewTransition` at all (see
// docs/adr/018), it's exclusive to the data router. `createRoutesFromElements` keeps the routes
// declared as JSX below, same as before, just handed to the data router instead of rendered
// directly.
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
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
    </>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
