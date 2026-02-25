import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isOpen, toggleCart, removeFromCart, addToCart, decreaseQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleGoToCheckout = () => {
    toggleCart();
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay oscuro de fondo */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggleCart}
      />

      {/* El Panel del Carrito */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wider">Carrito de Compras</h2>
            <button onClick={toggleCart} className="text-2xl">✕</button>
          </div>

          {/* Lista de Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <img
                  src={`http://localhost:3000${item.images[0]?.url}`}
                  className="w-20 h-24 object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="text-sm font-bold mt-1">${Number(item.price).toLocaleString()}</p>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-3 mt-2 border w-max px-2 py-1">
                    <button className="text-lg" onClick={() => {decreaseQuantity(item.id)}}>-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button className="text-lg" onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
              </div>
            ))}
          </div>

          {/* Footer del Carrito */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Subtotal:</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total:</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <button onClick={handleGoToCheckout} className="w-full bg-black text-white py-4 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors">
              Iniciar Compra
            </button>
            <button onClick={toggleCart} className="w-full text-center mt-4 text-xs underline uppercase tracking-tighter">
              Ver más productos
            </button>
          </div>
        </div>
      </div>
    </>
  );
}