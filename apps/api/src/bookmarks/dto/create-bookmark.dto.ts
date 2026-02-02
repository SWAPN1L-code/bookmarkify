import { IsString, IsUrl, IsOptional, IsUUID, IsArray, IsBoolean } from 'class-validator';

export class CreateBookmarkDto {
    @IsUrl()
    url: string;

    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsUUID()
    @IsOptional()
    folderId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[]; // Tag names to create/attach
}
