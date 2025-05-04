import { IsEmail, IsNotEmpty,  IsString } from 'class-validator';

export class CreatedUserDto {
  @IsNotEmpty({ message: 'Nome requerido' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email requerido' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Senha requerida' })
  @IsString()
  password: string;
}