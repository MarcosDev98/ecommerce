import { useEffect, useState } from "react"
import { getProducts } from "@/api/products.service";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { useDebounce } from "@/hooks/useDebounce";


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const term = debouncedSearchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* --- SECCIÓN DEL BUSCADOR --- */}
      <div className="mb-12 max-w-xl mx-auto">
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            🔍
          </span>
        </div>
      </div>

      {/* --- GRID DE RESULTADOS --- */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* --- ESTADO SIN RESULTADOS --- */
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🏜️</div>
          <h3 className="text-xl font-bold text-gray-800">Sin resultados</h3>
          <p className="text-gray-500 mt-2">Prueba cambiando tu búsqueda o filtros.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-6 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </div>
  );
}