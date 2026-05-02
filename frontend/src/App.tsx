import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import './App.css'
import IngestionPage from './components/IngestionPage';
import AdminLogin from './components/AdminLogin';
import Admin from './components/Admin';
import Gratitude from './components/Gratitude';

function App() {

  return (
    <>
      <BrowserRouter basename='/realestate'>
        <Routes>
                <>
                    <Route path="/" element={<Navigate to="/service" />} />
                    <Route path="/:serviceParam" element={<IngestionPage />} />
                    <Route path="/gratitude" element={<Gratitude />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<Admin />} />
                </>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
