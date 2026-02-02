import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FoldersModule } from './folders/folders.module';
import { TagsModule } from './tags/tags.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        FoldersModule,
        TagsModule,
        BookmarksModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
