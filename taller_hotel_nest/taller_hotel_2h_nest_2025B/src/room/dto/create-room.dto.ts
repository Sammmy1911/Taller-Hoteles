// TODO: Add validation decorators (@IsNotEmpty for required, min 0.01 for price)
export class CreateRoomDto {
  roomNumber: string;

  type: string; // 'single', 'double', 'suite'

  pricePerNight: number;

  capacity: number;

  description?: string;
}
