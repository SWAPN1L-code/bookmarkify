import { IsOptional, IsInt, Min, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryBookmarksDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 50;

    @IsOptional()
    @IsUUID()
    folderId?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isFavorite?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isArchived?: boolean;

    @IsOptional()
    @IsString()
    tags?: string; // Comma-separated tag names
}
