import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadImage } from '@/api/products.service';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [''],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadPromises = imageFiles.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const finalProduct = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: uploadedUrls
      };

      await createProduct(finalProduct);

      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded-md"
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              onChange={(e) => setFormData({ ...formData, stock: +e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            className="w-full p-2 border rounded-md h-32"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <input
            className=""
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>


        <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg hover:border-ecommerce-primary transition-colors">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del Producto
          </label>
          <input
            type="file"
            accept="image/*" // Solo permite archivos de imagen
            multiple
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-ecommerce-primary hover:file:bg-blue-100"
          />
          {imageFiles && (
            <p className="mt-2 text-xs text-green-600">
              Seleccionado:
            </p>
          )}
        </div>

        <button
          disabled={isUploading}
          type="submit"
          className="w-full bg-ecommerce-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
        >
          {isUploading ? 'Subiendo imágenes...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}