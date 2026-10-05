// TODO: Add validation decorators (@IsNotEmpty for required fields, @Min(0) @Max(5) for rating)
export class CreateHotelDto {
  name: string;

  location: string;

  city: string;

  country: string;

  rating: number;

  description?: string;
}
