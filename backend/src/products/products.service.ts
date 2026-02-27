import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  productsTable,
  productImagesTable,
} from '../products/entities/products.schema';
import { DRIZZLE } from 'src/database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { eq, InferInsertModel } from 'drizzle-orm';
import * as fs from 'fs';
import { join } from 'path';

export interface ProductImage {
  id: number;
  url: string;
}

export interface ProductWithImages {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  images: ProductImage[];
  createdAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class ProductsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createProductDto: CreateProductDto) {
    const { images, ...productData } = createProductDto;

    return await this.db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(productsTable)
        .values({
          ...productData,
          price: productData.price.toString(),
        })
        .returning();

      if (images && images.length > 0) {
        const imageRecords = images.map((url) => ({
          url,
          productId: newProduct.id,
        }));
        await tx.insert(productImagesTable).values(imageRecords);
      }
      return {
        ...newProduct,
        price: parseFloat(newProduct.price), // Lo devolvemos como número para comodidad del cliente
        images: images || [],
      };
    });
  }

  async findAll(): Promise<ProductWithImages[]> {
    const rows = await this.db.query.productsTable.findMany({
      where: (products, { isNull }) => isNull(products.deletedAt),
      with: {
        product_images: {
          columns: { id: true, url: true },
        },
      },
    });

    // Mapeamos para que 'product_images' se llame 'images'
    return rows.map((p) => ({
      ...p,
      images: p.product_images,
    })) as ProductWithImages[];
  }

  async findOne(id: number): Promise<ProductWithImages | null> {
    const result = await this.db.query.productsTable.findFirst({
      where: eq(productsTable.id, id),
      with: {
        product_images: {
          columns: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!result) return null;

    // Separamos product_images para renombrarlo a 'images'
    const { product_images, ...productData } = result;

    return {
      ...productData,
      images: product_images,
    } as ProductWithImages;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto;

    const existingProduct = await this.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException(`No existe un producto con ID: ${id}`);
    }

    return await this.db.transaction(async (tx) => {
      if (Object.keys(productData).length > 0) {
        // CORRECCIÓN: Usamos el tipo parcial de inserción de la tabla
        const updatePayload: Partial<InferInsertModel<typeof productsTable>> = {
          ...productData,
          // Si productData ya trae price como number, lo convertimos aquí de forma segura
          price: productData.price?.toString(),
        };

        await tx
          .update(productsTable)
          .set(updatePayload) // Ahora Drizzle sabe que los datos coinciden con la tabla
          .where(eq(productsTable.id, id));
      }

      // 2. Gestionar imágenes (tu lógica actual está bien, solo quitemos el 'any' si lo hubiera)
      if (images !== undefined) {
        const imagesToDelete = existingProduct.images.filter(
          (oldImg) => !images.includes(oldImg.url),
        );

        imagesToDelete.forEach((img) => {
          const relativePath = img.url.startsWith('/')
            ? img.url.substring(1)
            : img.url;
          const filePath = join(process.cwd(), relativePath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (error) {
              // Cambiamos 'e' por 'error' (mejor práctica)
              console.error(`No se pudo borrar el archivo: ${filePath}`, error);
            }
          }
        });

        await tx
          .delete(productImagesTable)
          .where(eq(productImagesTable.productId, id));

        if (images.length > 0) {
          const newImageRecords = images.map((url) => ({
            url,
            productId: id,
          }));
          await tx.insert(productImagesTable).values(newImageRecords);
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: number) {
    // 1. Verificamos si existe antes de hacer nada
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return await this.db.transaction(async (tx) => {
      const now = new Date();

      // 2. Borrado lógico del producto
      await tx
        .update(productsTable)
        .set({ deletedAt: now })
        .where(eq(productsTable.id, id));

      // 3. Borrado lógico de todas sus imágenes en la DB
      await tx
        .update(productImagesTable)
        .set({ deletedAt: now })
        .where(eq(productImagesTable.productId, id));

      return {
        message: `Fueron borrados el producto #${id} y sus imágenes.`,
        deletedAt: now,
      };
    });
  }
}
