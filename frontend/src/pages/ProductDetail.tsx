import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '@/api/products.service';
import { Product } from '@/types/product';


export default function ProductDetail() {

  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProductById(id)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className='text-center py-20'>Cargando producto...</div>
  if (!product) return <div className='text-center py-20'>Producto no existe</div>

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden border">
            <img
              src={`http://localhost:3000${product.images[0].url}`}
              className="w-full h-full object-cover"
              alt={product.name}
            />
          </div>
          {/* Miniaturas */}
          <div className="flex gap-2">
            {product.images.map((img) => (
              <img
                key={img.id} // Usamos el ID de la base de datos
                src={`http://localhost:3000${img.url}`}
                className="w-20 h-20 object-cover rounded-md border"
              />
            ))}
          </div>
        </div>

        {/* Información */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl text-ecommerce-primary font-bold mt-4">
            ${Number(product.price).toLocaleString()}
          </p>
          <p className="text-gray-600 mt-6 leading-relaxed">
            {product.description || 'Sin descripción disponible.'}
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-500">Stock disponible: {product.stock}</p>
            <button className="w-full bg-ecommerce-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors">
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}