import { useCart } from "@/context/CartContext";
import { ProductCardProps } from "@/types/product";
import { Link } from "react-router-dom";

export default function ProductCard({ product }: ProductCardProps) {

  const { addToCart } = useCart();

  const imageUrl = product.images && product.images.length > 0
    ? `http://localhost:3000${product.images[0].url}`
    : 'https://via.placeholder.com/300';


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm h-10 overflow-hidden line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold text-ecommerce-primary">
            ${product.price.toLocaleString()}
          </span>
          <Link
            to={`/producto/${product.id}`}
            className="bg-blue-50 text-ecommerce-primary px-3 py-1 rounded-lg text-sm font-semibold hover:bg-ecommerce-primary hover:text-white transition-colors"
          >
            Ver detalle
          </Link>
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-50 text-ecommerce-primary px-3 py-1 rounded-lg text-sm font-semibold hover:bg-ecommerce-primary hover:text-white transition-colors hover:"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}