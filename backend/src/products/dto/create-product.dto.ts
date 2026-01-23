import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado Gamer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Teclado mecánico RGB', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 39.59 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ required: false, example: '/uploads/products/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;
}