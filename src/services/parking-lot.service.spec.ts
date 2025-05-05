import { Test, TestingModule } from '@nestjs/testing';
import { ParkingLotService } from './parking-lot.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ParkingLotService', () => {
  let service: ParkingLotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingLotService],
    }).compile();

    service = module.get<ParkingLotService>(ParkingLotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeParkingLot', () => {
    it('should initialize parking lot with correct number of slots', () => {
      const result = service.initializeParkingLot(5);
      expect(result.total_slot).toBe(5);
    });

    it('should throw error when initializing with non-positive number', () => {
      expect(() => service.initializeParkingLot(0)).toThrow(BadRequestException);
      expect(() => service.initializeParkingLot(-1)).toThrow(BadRequestException);
    });
  });

  describe('expandParkingLot', () => {
    it('should expand parking lot correctly', () => {
      service.initializeParkingLot(5);
      const result = service.expandParkingLot(3);
      expect(result.total_slot).toBe(8);
    });

    it('should throw error when expanding with non-positive number', () => {
      service.initializeParkingLot(5);
      expect(() => service.expandParkingLot(0)).toThrow(BadRequestException);
      expect(() => service.expandParkingLot(-1)).toThrow(BadRequestException);
    });

    it('should throw error when expanding uninitialized parking lot', () => {
      expect(() => service.expandParkingLot(3)).toThrow(BadRequestException);
    });
  });

  describe('parkCar', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
    });

    it('should park a car successfully', () => {
      const result = service.parkCar('KA-01-HH-1234', 'White');
      expect(result.allocated_slot_number).toBe(1);
    });

    it('should allocate nearest slot', () => {
      service.parkCar('KA-01-HH-1234', 'White');
      service.parkCar('KA-01-HH-1235', 'Black');
      service.freeSlot(1);
      const result = service.parkCar('KA-01-HH-1236', 'Red');
      expect(result.allocated_slot_number).toBe(1); // Should reuse the nearest freed slot
    });

    it('should throw error when parking lot is full', () => {
      service.parkCar('KA-01-HH-1234', 'White');
      service.parkCar('KA-01-HH-1235', 'Black');
      service.parkCar('KA-01-HH-1236', 'Red');
      expect(() => service.parkCar('KA-01-HH-1237', 'Blue')).toThrow(BadRequestException);
    });

    it('should throw error when car is already parked', () => {
      service.parkCar('KA-01-HH-1234', 'White');
      expect(() => service.parkCar('KA-01-HH-1234', 'White')).toThrow(BadRequestException);
    });

    it('should throw error when car registration number is not provided', () => {
      expect(() => service.parkCar('', 'White')).toThrow(BadRequestException);
    });

    it('should throw error when car color is not provided', () => {
      expect(() => service.parkCar('KA-01-HH-1234', '')).toThrow(BadRequestException);
    });
  });

  describe('freeSlot', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar('KA-01-HH-1234', 'White');
    });

    it('should free slot by slot number', () => {
      const result = service.freeSlot(1);
      expect(result.freed_slot_number).toBe(1);
    });

    it('should free slot by registration number', () => {
      const result = service.freeSlot(undefined, 'KA-01-HH-1234');
      expect(result.freed_slot_number).toBe(1);
    });

    it('should throw error when freeing non-existent slot', () => {
      expect(() => service.freeSlot(10)).toThrow(NotFoundException);
    });

    it('should throw error when freeing already free slot', () => {
      service.freeSlot(1);
      expect(() => service.freeSlot(1)).toThrow(BadRequestException);
    });

    it('should throw error when freeing non-existent car', () => {
      expect(() => service.freeSlot(undefined, 'NON-EXISTENT')).toThrow(NotFoundException);
    });
  });

  describe('getRegistrationNumbersByColor', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar('KA-01-HH-1234', 'White');
      service.parkCar('KA-01-HH-1235', 'White');
      service.parkCar('KA-01-HH-1236', 'Black');
    });

    it('should return registration numbers for a given color', () => {
      const result = service.getRegistrationNumbersByColor('White');
      expect(result.length).toBe(2);
      expect(result).toContain('KA-01-HH-1234');
      expect(result).toContain('KA-01-HH-1235');
      expect(result).not.toContain('KA-01-HH-1236');
    });

    it('should handle case-insensitivity for color', () => {
      const result = service.getRegistrationNumbersByColor('white');
      expect(result.length).toBe(2);
    });

    it('should return empty array for color with no cars', () => {
      const result = service.getRegistrationNumbersByColor('Blue');
      expect(result).toEqual([]);
    });
  });

  describe('getSlotNumbersByColor', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar('KA-01-HH-1234', 'White');
      service.parkCar('KA-01-HH-1235', 'White');
      service.parkCar('KA-01-HH-1236', 'Black');
    });

    it('should return slot numbers for a given color', () => {
      const result = service.getSlotNumbersByColor('White');
      expect(result.length).toBe(2);
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).not.toContain('3');
    });

    it('should return empty array for color with no cars', () => {
      const result = service.getSlotNumbersByColor('Blue');
      expect(result).toEqual([]);
    });
  });

  describe('getSlotByRegistrationNumber', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar('KA-01-HH-1234', 'White');
    });

    it('should return correct slot number for a registration number', () => {
      const slotNumber = service.getSlotByRegistrationNumber('KA-01-HH-1234');
      expect(slotNumber).toBe(1);
    });

    it('should throw error for non-existent registration number', () => {
      expect(() => service.getSlotByRegistrationNumber('INVALID')).toThrow(NotFoundException);
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar('KA-01-HH-1234', 'White');
      service.parkCar('KA-01-HH-1235', 'Black');
    });

    it('should return status of occupied slots', () => {
      const result = service.getStatus();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        slot_no: 1,
        registration_no: 'KA-01-HH-1234',
        color: 'white'
      });
      expect(result[1]).toEqual({
        slot_no: 2,
        registration_no: 'KA-01-HH-1235',
        color: 'black'
      });
    });

    it('should reflect changes when slot is freed', () => {
      service.freeSlot(1);
      const result = service.getStatus();
      expect(result).toHaveLength(1);
      expect(result[0].slot_no).toBe(2);
    });
  });
});