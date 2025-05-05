import { IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class FreeSlotDto {
  @IsOptional()
  @IsInt()
  @ValidateIf(o => !o.car_registration_no)
  slot_number?: number;

  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.slot_number)
  car_registration_no?: string;
}