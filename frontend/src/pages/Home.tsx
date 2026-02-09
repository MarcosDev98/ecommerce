import { useEffect, useState } from "react"
import { getProducts } from "@/api/products.service";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-20">Cargando catálogo</div>

  return (
    <div className="py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Descubre lo nuevo</h1>
        <p className="text-gray-500 mt-2">Los mejores productos seleccionados para ti</p>
      </header>

      {/* Grid Responsivo: 1 columna en móvil, 2 en tablet, 4 en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-400 py-10">No hay productos disponibles por ahora.</p>
      )}
    </div>
  );
}