import { IsNotEmpty, IsString } from 'class-validator';

export class ParkCarDto {
  @IsNotEmpty()
  @IsString()
  car_reg_no: string;

  @IsNotEmpty()
  @IsString()
  car_color: string;
}