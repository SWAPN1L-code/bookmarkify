import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    color?: string;
}
