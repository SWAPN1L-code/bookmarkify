import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
    controllers: [FoldersController],
    providers: [FoldersService],
    exports: [FoldersService],
})
export class FoldersModule { }
