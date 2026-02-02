import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { QueryBookmarksDto } from './dto/query-bookmarks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) { }

    @Post()
    create(@CurrentUser() user: any, @Body() createBookmarkDto: CreateBookmarkDto) {
        return this.bookmarksService.create(user.id, user.organizationId, createBookmarkDto);
    }

    @Get()
    findAll(@CurrentUser() user: any, @Query() query: QueryBookmarksDto) {
        return this.bookmarksService.findAll(user.id, query);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.bookmarksService.findOne(id, user.id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() updateBookmarkDto: UpdateBookmarkDto,
    ) {
        return this.bookmarksService.update(id, user.id, user.organizationId, updateBookmarkDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.bookmarksService.remove(id, user.id);
    }

    @Post(':id/favorite')
    toggleFavorite(@Param('id') id: string, @CurrentUser() user: any) {
        return this.bookmarksService.toggleFavorite(id, user.id);
    }

    @Post(':id/archive')
    toggleArchive(@Param('id') id: string, @CurrentUser() user: any) {
        return this.bookmarksService.toggleArchive(id, user.id);
    }

    @Post(':id/visit')
    incrementVisit(@Param('id') id: string, @CurrentUser() user: any) {
        return this.bookmarksService.incrementVisitCount(id, user.id);
    }
}
