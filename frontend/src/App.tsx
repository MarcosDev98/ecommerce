import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/api/auth.context';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Navbar from '@/components/Navbar';
import CreateProduct from './pages/CreateProduct';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

// Páginas de ejemplo
const Perfil = () => <h1 className="text-2xl font-bold">Tu Perfil Privado</h1>;
const Carrito = () => <h1 className="text-2xl font-bold">Tu Carrito de Compras</h1>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* 2. Colocamos el Drawer aquí. 
            Al estar fuera de <Routes>, no se desmonta al cambiar de página.
          */}
          <CartDrawer />

          <Navbar />

          <main className="container mx-auto p-4">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/producto/:id" element={<ProductDetail />} />

              {/* Rutas Protegidas */}
              <Route
                path='/nuevo-producto'
                element={
                  <ProtectedRoute>
                    <CreateProduct />
                  </ProtectedRoute>
                }
              />
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
      </CartProvider>
    </AuthProvider>
  );
}

export default App;