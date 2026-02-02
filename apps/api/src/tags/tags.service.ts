import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, organizationId: string, createTagDto: CreateTagDto) {
        // Check if tag with same name already exists for user
        const existingTag = await this.prisma.tag.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: createTagDto.name,
                },
            },
        });

        if (existingTag) {
            throw new ConflictException('Tag with this name already exists');
        }

        return this.prisma.tag.create({
            data: {
                ...createTagDto,
                userId,
                organizationId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.tag.findMany({
            where: { userId },
            orderBy: { usageCount: 'desc' },
            include: {
                _count: { select: { bookmarks: true } },
            },
        });
    }

    async findOne(id: string, userId: string) {
        const tag = await this.prisma.tag.findFirst({
            where: { id, userId },
            include: {
                _count: { select: { bookmarks: true } },
            },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async update(id: string, userId: string, updateTagDto: UpdateTagDto) {
        const tag = await this.prisma.tag.findFirst({
            where: { id, userId },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        // Check for name conflict
        if (updateTagDto.name && updateTagDto.name !== tag.name) {
            const existingTag = await this.prisma.tag.findUnique({
                where: {
                    userId_name: {
                        userId,
                        name: updateTagDto.name,
                    },
                },
            });

            if (existingTag) {
                throw new ConflictException('Tag with this name already exists');
            }
        }

        return this.prisma.tag.update({
            where: { id },
            data: updateTagDto,
        });
    }

    async remove(id: string, userId: string) {
        const tag = await this.prisma.tag.findFirst({
            where: { id, userId },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        await this.prisma.tag.delete({
            where: { id },
        });

        return { message: 'Tag deleted successfully' };
    }
}
