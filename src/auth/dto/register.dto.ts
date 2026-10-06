import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @MaxLength(80)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email: string;

  // 72: bcrypt walata bytes 72 ta wada wadi password hash karanna ba
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72)
  password: string;
}