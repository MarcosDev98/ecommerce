import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  @IsEnum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status: string;
}