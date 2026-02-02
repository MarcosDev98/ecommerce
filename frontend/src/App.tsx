import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/api/auth.context';
import ProtectedRoute from '@/components/ProtectedRoute'; // Importamos el guardia
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Navbar from '@/components/Navbar';

// Páginas de ejemplo (puedes crearlas luego)
const Perfil = () => <h1 className="text-2xl font-bold">Tu Perfil Privado</h1>;
const Carrito = () => <h1 className="text-2xl font-bold">Tu Carrito de Compras</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas Protegidas */}
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/carrito" 
              element={
                <ProtectedRoute>
                  <Carrito />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;