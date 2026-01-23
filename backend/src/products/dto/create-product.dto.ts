import { IsString, IsNumber, IsOptional, Min, IsArray } from 'class-validator';
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

  @ApiProperty({ 
    required: false, 
    example: '/uploads/products/image1.jpg, /upload/products/image2.png',
    description: 'Arreglo de URLs de las imágenes ya subidas'
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}