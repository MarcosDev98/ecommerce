import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/api/auth.context';

export default function Navbar() {
  const navigate = useNavigate();
  // Extraemos el estado y la función de cierre de sesión del contexto
  const { isAuthenticated, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser(); // El contexto se encarga de limpiar el localStorage y actualizar el estado
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">

        {/* Logo / Nombre de la tienda */}
        <Link
          to="/"
          className="text-2xl font-bold text-ecommerce-primary hover:opacity-80 transition-opacity"
        >
          🛒 MiTienda
        </Link>

        {/* Enlaces de navegación */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-ecommerce-primary font-medium transition-colors"
          >
            Catálogo
          </Link>

          {/* Renderizado condicional basado en la autenticación */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/perfil"
                className="text-gray-600 hover:text-ecommerce-primary font-medium"
              >
                Mi Perfil
              </Link>
              <Link
                to="/carrito"
                className="text-gray-600 hover:text-ecommerce-primary font-medium"
              >
                Mi Carrito
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold border border-red-100 hover:bg-red-600 hover:text-white transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-ecommerce-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}