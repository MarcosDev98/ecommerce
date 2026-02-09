import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productsTable, productImagesTable } from '../products/entities/products.schema';
import { DRIZZLE } from 'src/database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { eq, and, isNull } from 'drizzle-orm';
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
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB
  ) { }

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
        images: images || []
      };
    });

  }

  async findAll(): Promise<ProductWithImages[]> {
    const rows = await this.db.query.productsTable.findMany({
      where: (products, { isNull }) => isNull(products.deletedAt),
      with: {
        product_images: {
          columns: { id: true, url: true }
        },
      },
    });

    // Mapeamos para que 'product_images' se llame 'images'
    return rows.map(p => ({
      ...p,
      images: p.product_images
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
      images: product_images
    } as ProductWithImages;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto;

    // Ahora TS sabe que existingProduct es ProductWithImages | null
    const existingProduct = await this.findOne(id);

    if (!existingProduct) {
      throw new NotFoundException(`No existe un producto con ID: ${id}`);
    }

    return await this.db.transaction(async (tx) => {
      // 1. Actualizar datos básicos del producto
      if (Object.keys(productData).length > 0) {
        const updatePayload: any = { ...productData };
        if (productData.price) updatePayload.price = productData.price.toString();

        await tx.update(productsTable)
          .set(updatePayload)
          .where(eq(productsTable.id, id));
      }

      // 2. Gestionar imágenes si vienen en el DTO
      if (images !== undefined) {
        // images es string[] (nuevas URLs) 
        // existingProduct.images es {id, url}[] (URLs actuales en DB)

        const imagesToDelete = existingProduct.images.filter(
          (oldImg) => !images.includes(oldImg.url)
        );

        // Borrar archivos físicos del servidor
        imagesToDelete.forEach((img) => {
          const relativePath = img.url.startsWith('/') ? img.url.substring(1) : img.url;
          const filePath = join(process.cwd(), relativePath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.error(`No se pudo borrar el archivo: ${filePath}`, e);
            }
          }
        });

        // Sincronizar tabla de imágenes: Borramos todas y re-insertamos las actuales
        await tx.delete(productImagesTable)
          .where(eq(productImagesTable.productId, id));

        if (images.length > 0) {
          const newImageRecords = images.map((url) => ({
            url,
            productId: id,
          }));
          await tx.insert(productImagesTable)
            .values(newImageRecords);
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
      await tx.update(productsTable)
        .set({ deletedAt: now })
        .where(eq(productsTable.id, id));

      // 3. Borrado lógico de todas sus imágenes en la DB
      await tx.update(productImagesTable)
        .set({ deletedAt: now })
        .where(eq(productImagesTable.productId, id));

      return {
        message: `Fueron borrados el producto #${id} y sus imágenes.`,
        deletedAt: now
      };
    });
  }
}
