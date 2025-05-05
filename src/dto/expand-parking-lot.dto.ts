import { IsInt, Min } from 'class-validator';

export class ExpandParkingLotDto {
  @IsInt()
  @Min(1, { message: 'Increment slots must be at least 1' })
  increment_slot: number;
}