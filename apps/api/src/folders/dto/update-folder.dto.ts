import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderDto } from './create-folder.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateFolderDto extends PartialType(CreateFolderDto) {
    @IsInt()
    @IsOptional()
    position?: number;
}
