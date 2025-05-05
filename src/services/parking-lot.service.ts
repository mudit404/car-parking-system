import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Car } from '../models/car.model';
import { ParkingSlot } from '../models/parking-slot.model';


class MinHeap {
  private heap: number[] = [];

  push(value: number): void {
    this.heap.push(value);
    let currentIndex = this.heap.length - 1;
    let parentIndex = Math.floor((currentIndex - 1) / 2);
    
    while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
      [this.heap[currentIndex], this.heap[parentIndex]] = 
        [this.heap[parentIndex], this.heap[currentIndex]];
      
      currentIndex = parentIndex;
      parentIndex = Math.floor((currentIndex - 1) / 2);
    }
  }

  pop(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    
    if (this.heap.length === 1) {
      return this.heap.pop();
    }
    
    const min = this.heap[0];
    
    this.heap[0] = this.heap.pop()!;
    
    let currentIndex = 0;
    let leftChildIndex = 2 * currentIndex + 1;
    let rightChildIndex = 2 * currentIndex + 2;
    let smallestChildIndex = this.getSmallestChildIndex(currentIndex);
    
    while (smallestChildIndex !== -1 && this.heap[currentIndex] > this.heap[smallestChildIndex]) {
      [this.heap[currentIndex], this.heap[smallestChildIndex]] = 
        [this.heap[smallestChildIndex], this.heap[currentIndex]];
      
      currentIndex = smallestChildIndex;
      smallestChildIndex = this.getSmallestChildIndex(currentIndex);
    }
    
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private getSmallestChildIndex(parentIndex: number): number {
    const leftChildIndex = 2 * parentIndex + 1;
    const rightChildIndex = 2 * parentIndex + 2;
    
    if (leftChildIndex >= this.heap.length) {
      return -1;
    }
    
    if (rightChildIndex >= this.heap.length) {
      return leftChildIndex;
    }
    
    return this.heap[leftChildIndex] <= this.heap[rightChildIndex] 
      ? leftChildIndex 
      : rightChildIndex;
  }
}

@Injectable()
export class ParkingLotService {
  private slots: ParkingSlot[] = [];
  private availableSlots: MinHeap = new MinHeap();
  private carToSlotMap: Map<string, number> = new Map();
  private colorToRegNoMap: Map<string, Set<string>> = new Map();

  initializeParkingLot(noOfSlots: number): { total_slot: number } {
    if (noOfSlots <= 0) {
      throw new BadRequestException('Number of slots must be positive');
    }

    this.slots = [];
    this.availableSlots = new MinHeap();
    this.carToSlotMap.clear();
    this.colorToRegNoMap.clear();

    for (let i = 1; i <= noOfSlots; i++) {
      this.slots.push(new ParkingSlot(i));
      this.availableSlots.push(i); 
    }

    return { total_slot: noOfSlots };
  }

  expandParkingLot(incrementSlot: number): { total_slot: number } {
    if (incrementSlot <= 0) {
      throw new BadRequestException('Increment slots must be positive');
    }

    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }

    const currentSize = this.slots.length;
    
    for (let i = currentSize + 1; i <= currentSize + incrementSlot; i++) {
      this.slots.push(new ParkingSlot(i));
      this.availableSlots.push(i); 
    }

    return { total_slot: currentSize + incrementSlot };
  }

  parkCar(regNo: string, color: string): { allocated_slot_number: number } {
    if (!regNo || !color) {
      throw new BadRequestException('Car registration number and color are required');
    }

    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }

    if (this.carToSlotMap.has(regNo)) {
      throw new BadRequestException(`Car with registration number ${regNo} is already parked`);
    }

    if (this.availableSlots.isEmpty()) {
      throw new BadRequestException('Parking lot is full');
    }

    const slotNumber = this.availableSlots.pop();
    if (slotNumber === undefined) {
      throw new BadRequestException('No available slots found');
    }
    
    const slotIndex = slotNumber - 1; 

    const car = new Car(regNo, color.toLowerCase());
    this.slots[slotIndex].parkCar(car);
    
    this.carToSlotMap.set(regNo, slotNumber);
    
    const lowerColor = color.toLowerCase();
    if (!this.colorToRegNoMap.has(lowerColor)) {
      this.colorToRegNoMap.set(lowerColor, new Set<string>());
    }
    
    const colorSet = this.colorToRegNoMap.get(lowerColor);
    if (colorSet) {
      colorSet.add(regNo);
    }

    return { allocated_slot_number: slotNumber };
  }

  freeSlot(slotNumber?: number, regNo?: string): { freed_slot_number: number } {
    if (!slotNumber && !regNo) {
      throw new BadRequestException('Either slot number or car registration number is required');
    }

    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }

    let slotToFree: number;

    if (slotNumber) {
      if (slotNumber <= 0 || slotNumber > this.slots.length) {
        throw new NotFoundException(`Slot number ${slotNumber} does not exist`);
      }
      
      slotToFree = slotNumber;
      if (!this.slots[slotToFree - 1].isOccupied) {
        throw new BadRequestException(`Slot number ${slotNumber} is already free`);
      }
    } else if (regNo) {
      const foundSlot = this.carToSlotMap.get(regNo);
      if (!foundSlot) {
        throw new NotFoundException(`Car with registration number ${regNo} not found`);
      }
      slotToFree = foundSlot;
    } else {
      throw new BadRequestException('Either slot number or car registration number is required');
    }

    const car = this.slots[slotToFree - 1].car;
    if (!car) {
      throw new BadRequestException(`No car found in slot ${slotToFree}`);
    }
    
    this.slots[slotToFree - 1].removeCar();
    
    this.availableSlots.push(slotToFree);
    this.carToSlotMap.delete(car.registrationNumber);
    
    const colorSet = this.colorToRegNoMap.get(car.color);
    if (colorSet) {
      colorSet.delete(car.registrationNumber);
      if (colorSet.size === 0) {
        this.colorToRegNoMap.delete(car.color);
      }
    }

    return { freed_slot_number: slotToFree };
  }

  getRegistrationNumbersByColor(color: string): string[] {
    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }
    
    const lowerColor = color.toLowerCase();
    const regNos = this.colorToRegNoMap.get(lowerColor);
    
    if (!regNos || regNos.size === 0) {
      return [];
    }
    
    return Array.from(regNos);
  }

  getSlotByRegistrationNumber(regNo: string): number {
    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }
    
    const slotNumber = this.carToSlotMap.get(regNo);
    
    if (!slotNumber) {
      throw new NotFoundException(`Car with registration number ${regNo} not found`);
    }
    
    return slotNumber;
  }

  getSlotNumbersByColor(color: string): string[] {
    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }
    
    const lowerColor = color.toLowerCase();
    const regNos = this.colorToRegNoMap.get(lowerColor);
    
    if (!regNos || regNos.size === 0) {
      return [];
    }
    
    const slotNumbers: string[] = [];
    
    for (const regNo of regNos) {
      const slotNumber = this.carToSlotMap.get(regNo);
      if (slotNumber) {
        slotNumbers.push(String(slotNumber));
      }
    }
    
    return slotNumbers;
  }

  getStatus(): Array<{ slot_no: number; registration_no: string; color: string }> {
    if (this.slots.length === 0) {
      throw new BadRequestException('Parking lot not initialized. Please initialize first.');
    }
    
    const occupiedSlots = this.slots.filter(slot => slot.isOccupied && slot.car !== null);
    
    return occupiedSlots.map(slot => ({
      slot_no: slot.slotNumber,
      registration_no: slot.car!.registrationNumber,
      color: slot.car!.color
    }));
  }
}