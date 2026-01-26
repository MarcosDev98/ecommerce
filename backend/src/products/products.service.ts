import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productsTable, productImagesTable } from '../products/entities/products.schema';
import { DRIZZLE } from 'src/database/database.module';
import type { DrizzleDB } from '../database/database.module';
import { eq, and, isNull } from 'drizzle-orm';
import * as fs from 'fs';
import { join } from 'path';


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

  async findAll() {
    return await this.db
      .select()
      .from(productsTable)
      .where(isNull(productsTable.deletedAt));
  }

  async findOne(id: number) {
    const rows = await this.db
      .select()
      .from(productsTable)
      .leftJoin(productImagesTable, eq(productsTable.id, productImagesTable.productId))
      .where(
        and(
          eq(productsTable.id, id),
          isNull(productsTable.deletedAt) // Filtro para el producto
        )
      );

    if (rows.length === 0) return null;

    const product = {
      ...rows[0].products,
      images: rows
        .map(r => r.product_images)
        .filter(i => i !== null)
    };
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { images, ...productData } = updateProductDto;

    const existingProduct = await this.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException(`No existe un producto con ID: ${id}`)
    }

    return await this.db.transaction(async (tx) => {
      if (Object.keys(productData).length > 0) {
        const updatePayload: any = { ...productData };
        if (productData.price) updatePayload.price = productData.price.toString();

        await tx.update(productsTable)
          .set(updatePayload)
          .where(eq(productsTable.id, id));
      }

      if (images !== undefined) {
        const imagesToDelete = existingProduct.images.filter(
          (oldImg) => !images.includes(oldImg.url)
        );

        imagesToDelete.forEach((img) => {
          const relativePath = img.url.startsWith('/') ? img.url.substring(1) : img.url;
          const filePath = join(process.cwd(), relativePath);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { console.error(`No se pudo borrar el archivo: ${filePath}`, e); }
          }
        });

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
