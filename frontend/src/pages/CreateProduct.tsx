import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '@/api/products.service';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [''],
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    try {
      await createProduct(formData);
      alert('¡Producto creado con éxito!');
      navigate('/'); // Volvemos al catálogo
    } catch (error) {
      console.error(error);
      alert('Error al crear el producto. Asegúrate de estar logueado.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Cargar Nuevo Producto</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ecommerce-primary outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded-md"
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              onChange={(e) => setFormData({...formData, stock: +e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            className="w-full p-2 border rounded-md h-32"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <input
            className=""
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-ecommerce-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
        >
          Guardar Producto
        </button>
      </form>
    </div>
  );
}