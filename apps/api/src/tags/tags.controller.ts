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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    create(@CurrentUser() user: any, @Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(user.id, user.organizationId, createTagDto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.tagsService.findAll(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.tagsService.findOne(id, user.id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.update(id, user.id, updateTagDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.tagsService.remove(id, user.id);
    }
}
