import { Module } from '@nestjs/common';
import { ParkingLotController } from './controllers/parking-lot.controller';
import { ParkingLotService } from './services/parking-lot.service';

@Module({
  imports: [],
  controllers: [ParkingLotController],
  providers: [ParkingLotService],
})
export class AppModule {}