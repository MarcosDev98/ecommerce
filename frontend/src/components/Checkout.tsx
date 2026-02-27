import { useCart } from '@/context/cart';
import { CartItem } from '@/types/product';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { cart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-10 uppercase tracking-tighter text-center lg:text-left">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="space-y-12">
          {/* SECCIÓN ENVÍO */}
          <section>
            <h2 className="text-xl font-semibold mb-6 border-b pb-2 uppercase tracking-wide">
              1. Información de Envío
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" className="p-3 border rounded-lg focus:ring-1 focus:ring-black outline-none bg-gray-50" />
              <input type="text" placeholder="Apellido" className="p-3 border rounded-lg focus:ring-1 focus:ring-black outline-none bg-gray-50" />
              <input type="email" placeholder="Email" className="p-3 border rounded-lg col-span-1 md:col-span-2 outline-none bg-gray-50" />
              <input type="text" placeholder="Dirección completa" className="p-3 border rounded-lg col-span-1 md:col-span-2 outline-none bg-gray-50" />
            </div>
          </section>

          {/* SECCIÓN PAGO */}
          <section>
            <h2 className="text-xl font-semibold mb-6 border-b pb-2 uppercase tracking-wide">
              2. Método de Pago
            </h2>
            <div className="p-5 border-2 border-black rounded-xl flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-4 border-black"></div>
                <span className="font-medium">Tarjeta de Crédito / Débito</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] border px-1 font-bold">VISA</span>
                <span className="text-[10px] border px-1 font-bold">MASTERCARD</span>
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
        <div className="bg-gray-50 p-8 rounded-2xl h-fit sticky top-10 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 uppercase">Resumen del Pedido</h2>

          {/* LISTA DE PRODUCTOS */}
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={`http://localhost:3000${item.images[0]?.url}`}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-sm border bg-white"
                    />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase truncate max-w-[150px]">{item.name}</span>
                    <span className="text-xs text-gray-400">Precio unit: ${Number(item.price).toLocaleString()}</span>
                  </div>
                </div>
                <span className="font-bold text-sm">
                  ${(Number(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* DESGLOSE DE TOTALES */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Envío</span>
              <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Gratis</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-6 border-t border-gray-950 mt-4 uppercase">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button className="w-full bg-black text-white py-5 mt-10 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all active:scale-[0.98]">
            Pagar Ahora
          </button>

          <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest">
            Transacción segura y encriptada
          </p>
        </div>
      </div>
    </div>
  );
}