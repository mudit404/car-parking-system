// src/controllers/parking-lot.controller.ts
import {
    Controller,
    Post,
    Patch,
    Get,
    Body,
    Param,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { ParkingLotService } from '../services/parking-lot.service';
  import { CreateParkingLotDto } from '../dto/create-parking-lot.dto';
  import { ExpandParkingLotDto } from '../dto/expand-parking-lot.dto';
  import { ParkCarDto } from '../dto/park-car.dto';
  import { FreeSlotDto } from '../dto/free-slot.dto';
  
  @Controller()
  export class ParkingLotController {
    constructor(private readonly parkingLotService: ParkingLotService) {}
  
    @Post('parking_lot')
    createParkingLot(@Body() createParkingLotDto: CreateParkingLotDto) {
      try {
        return this.parkingLotService.initializeParkingLot(createParkingLotDto.no_of_slot);
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to initialize parking lot',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Patch('parking_lot')
    expandParkingLot(@Body() expandParkingLotDto: ExpandParkingLotDto) {
      try {
        return this.parkingLotService.expandParkingLot(expandParkingLotDto.increment_slot);
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to expand parking lot',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Post('park')
    parkCar(@Body() parkCarDto: ParkCarDto) {
      try {
        return this.parkingLotService.parkCar(
          parkCarDto.car_reg_no,
          parkCarDto.car_color
        );
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to park car',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Get('registration_numbers/:color')
    getRegistrationNumbersByColor(@Param('color') color: string) {
      try {
        return this.parkingLotService.getRegistrationNumbersByColor(color);
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to get registration numbers',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Get('slot_numbers/:color')
    getSlotNumbersByColor(@Param('color') color: string) {
      try {
        return this.parkingLotService.getSlotNumbersByColor(color);
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to get slot numbers',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Post('clear')
    freeSlot(@Body() freeSlotDto: FreeSlotDto) {
      try {
        return this.parkingLotService.freeSlot(
          freeSlotDto.slot_number,
          freeSlotDto.car_registration_no
        );
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to free slot',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    @Get('status')
    getStatus() {
      try {
        return this.parkingLotService.getStatus();
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to get status',
          error.status || HttpStatus.BAD_REQUEST
        );
      }
    }
  
    // Extra endpoint to get slot by car registration number
    @Get('slot/:registration_no')
    getSlotByRegistrationNumber(@Param('registration_no') regNo: string) {
      try {
        const slotNumber = this.parkingLotService.getSlotByRegistrationNumber(regNo);
        return { slot_number: slotNumber };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to get slot',
          error.status || HttpStatus.NOT_FOUND
        );
      }
    }
  }