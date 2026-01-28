import { useEffect, useState } from "react";
import { getProducts, Product } from "./api/products.service";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error al conectar con el backend: ', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-10 text-ecommerce-primary">Cargando productos...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-ecommerce-dark mb-8">Nuestro Catálogo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
            <p className="text-ecommerce-primary font-bold mt-2">${product.price}</p>
            <p className="text-gray-500 text-sm mt-1 font-medium">Stock: {product.stock}</p>
            <button className="w-full mt-4 bg-ecommerce-primary text-white py-2 rounded-lg hover:opacity-90 transition-opacity">
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;