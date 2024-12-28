import { IsString, IsNumber } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}
