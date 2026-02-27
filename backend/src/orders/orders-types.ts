import {
  productsTable,
  productImagesTable,
} from 'src/products/entities/products.schema';
import { ordersTable, orderItemsTable } from './entities/order.schema';

export interface OrderQueryResult {
  order: typeof ordersTable.$inferSelect;
  item: typeof orderItemsTable.$inferSelect | null;
  product: typeof productsTable.$inferSelect | null;
  image: typeof productImagesTable.$inferSelect | null;
}

export interface GroupedOrder {
  id: number;
  total: string;
  items: any[];
}

export interface OrderAccumulator {
  id: number;
  total: string;
  createdAt: Date;
  status: string;
  items: Map<
    number,
    {
      id: number;
      quantity: number;
      priceAtPurchase: string;
      productName: string;
      images: Set<string>;
    }
  >;
}
