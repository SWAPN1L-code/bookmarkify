import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFolderDto {
    @IsString()
    name: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
