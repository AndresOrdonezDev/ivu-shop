import { IsString, IsNumber, Min, IsOptional, MinLength, IsNotEmpty, IsArray } from 'class-validator';

export class CreateProductDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString({each:true})
  @IsArray()
  @IsOptional()
  tags:string[]

}
