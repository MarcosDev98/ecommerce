import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as schema from './entities/products.schema';
import { DRIZZLE } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const [newProduct] = await this.db
      .insert(schema.productsTable)
      .values({
        ...createProductDto,
        price: createProductDto.price.toString(),
      })
      .returning();

    return newProduct;
  }

  async findAll() {
    return await this.db.query.productsTable.findMany();
  }

  async findOne(id: number) {
    return await this.db.query.productsTable.findFirst({
      where: eq(schema.productsTable.id, id),
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.db
      .update(schema.productsTable)
      .set({
        ...updateProductDto,
        price: updateProductDto.price?.toString(),
      })
      .where(eq(schema.productsTable.id, id))
      .returning();
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (product && product.image) {
      const filePath = join(process.cwd(), product.image);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
    }
    return await this.db.delete(schema.productsTable).where(eq(schema.productsTable.id, id));
  }
}
