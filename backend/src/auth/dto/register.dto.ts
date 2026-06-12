import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  lastName!: string;

  @IsString()
  @IsOptional()
  roleName?: string = "STUDENT";

  @IsString()
  @IsOptional()
  universityId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  classId?: string;
}
