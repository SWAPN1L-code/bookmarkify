import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Post()
    create(
        @CurrentUser() user: any,
        @Body() createFolderDto: CreateFolderDto,
    ) {
        return this.foldersService.create(user.id, user.organizationId, createFolderDto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.foldersService.findAll(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.foldersService.findOne(id, user.id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() updateFolderDto: UpdateFolderDto,
    ) {
        return this.foldersService.update(id, user.id, updateFolderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.foldersService.remove(id, user.id);
    }
}
