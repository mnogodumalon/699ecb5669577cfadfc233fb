import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import ArtikelEinstellenPage from '@/pages/ArtikelEinstellenPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="artikel-einstellen" element={<ArtikelEinstellenPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}