# Car Parking System API

A RESTful API for an automated car parking system built with NestJS and TypeScript.

## Features

- Initialize a parking lot with a specified number of slots
- Expand parking lot capacity
- Park a car in the nearest available slot
- Free a parking slot by slot number or car registration number
- Get all cars of a specific color
- Find slot number by car registration number
- Find slots occupied by cars of a specific color
- View status of all occupied slots

## Design Highlights

- **Efficient Data Structures**: 
  - Custom Min-heap implementation for optimal nearest-slot allocation (O(log n))
  - Maps for O(1) lookups by car registration and color

- **Clean Architecture**:
  - Separation of concerns with Models, DTOs, Service, and Controller
  - Well-defined interfaces and validation

- **Error Handling**:
  - Comprehensive validation with specific error messages
  - Proper HTTP status codes for different error scenarios

## Installation

```bash
# Clone the repository
git clone https://github.com/mudit404/car-parking-system

# Navigate to the project directory
cd car-parking-system

# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Running with Docker

```bash
# Build the Docker image
docker build -t car-parking-system .

# Run the container
docker run -p 3000:3000 car-parking-system
```

## Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov
```

## API Documentation

### 1. Initialize Parking Lot
```
POST /parking_lot
```
Request Body:
```json
{
  "no_of_slot": 6
}
```
Response:
```json
{
  "total_slot": 6
}
```

### 2. Expand Parking Lot
```
PATCH /parking_lot
```
Request Body:
```json
{
  "increment_slot": 3
}
```
Response:
```json
{
  "total_slot": 9
}
```

### 3. Park a Car
```
POST /park
```
Request Body:
```json
{
  "car_reg_no": "KA-01-AB-2211",
  "car_color": "white"
}
```
Response:
```json
{
  "allocated_slot_number": 1
}
```

### 4. Get Registration Numbers by Color
```
GET /registration_numbers/:color
```
Response:
```json
[
  "KA-01-HH-1234",
  "KA-02-AB-9999",
  "KA-03-PK-2211"
]
```

### 5. Get Slot Numbers by Color
```
GET /slot_numbers/:color
```
Response:
```json
[
  "1",
  "5",
  "12"
]
```

### 6. Free a Parking Slot
```
POST /clear
```
Request Body (by slot number):
```json
{
  "slot_number": 1
}
```
Or (by car registration number):
```json
{
  "car_registration_no": "KA-01-AB-2211"
}
```
Response:
```json
{
  "freed_slot_number": 1
}
```

### 7. Get Status of Occupied Slots
```
GET /status
```
Response:
```json
[
  {
    "slot_no": 1,
    "registration_no": "KA-01-HH-1234",
    "color": "red"
  },
  {
    "slot_no": 2,
    "registration_no": "KA-01-HH-1235",
    "color": "blue"
  }
]
```

### 8. Get Slot by Registration Number
```
GET /slot/:registration_no
```
Response:
```json
{
  "slot_number": 1
}
```

## Time Complexity Analysis

- **Initializing Parking Lot**: O(n) - where n is the number of slots
- **Parking a Car**: O(log n) - Extracting minimum from min-heap
- **Freeing a Slot**: O(log n) - Adding to min-heap
- **Finding a Car by Registration**: O(1) - Map lookup
- **Finding Cars by Color**: O(k) - where k is the number of cars with that color
- **Getting All Occupied Slots**: O(n) - Linear scan of all slots

## Design Decisions and Assumptions

1. **Case Insensitivity for Colors**:
   - Colors are stored in lowercase to enable case-insensitive lookups

2. **Validation**:
   - Comprehensive request validation using NestJS pipes and class-validator
   - Proper error messages for invalid inputs

3. **Nearest Slot Allocation**:
   - Using a min-heap ensures that the nearest slot (lowest slot number) is always allocated first

4. **Initialization Requirement**:
   - Most operations require the parking lot to be initialized first
   - Proper error messages guide the user flow

5. **Error Handling**:
   - Custom error messages for every possible error scenario
   - Appropriate HTTP status codes (400 for bad requests, 404 for not found)
