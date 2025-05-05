import { Car } from './car.model';

export class ParkingSlot {
  constructor(
    public readonly slotNumber: number,
    private _car: Car | null = null,
  ) {}

  get car(): Car | null {
    return this._car;
  }

  get isOccupied(): boolean {
    return this._car !== null;
  }

  parkCar(car: Car): void {
    this._car = car;
  }

  removeCar(): Car | null {
    const car = this._car;
    this._car = null;
    return car;
  }
}