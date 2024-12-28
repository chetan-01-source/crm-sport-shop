import { IsNotEmpty, IsArray, IsNumber, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  customerId: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  items: { itemId: string; quantity: number }[];

  @IsNumber()
  totalAmount: number;

  @IsEnum(['pending', 'completed', 'cancelled'], { message: 'Invalid order status' })
  status: string;
}
