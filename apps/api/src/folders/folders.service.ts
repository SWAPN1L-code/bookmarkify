import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, organizationId: string, createFolderDto: CreateFolderDto) {
        // If parentId is provided, verify it exists and belongs to user
        if (createFolderDto.parentId) {
            const parentFolder = await this.prisma.folder.findFirst({
                where: {
                    id: createFolderDto.parentId,
                    userId,
                },
            });
            if (!parentFolder) {
                throw new NotFoundException('Parent folder not found');
            }
        }

        // Get the next position
        const lastFolder = await this.prisma.folder.findFirst({
            where: {
                userId,
                parentId: createFolderDto.parentId || null,
            },
            orderBy: { position: 'desc' },
        });

        const position = lastFolder ? lastFolder.position + 1 : 0;

        return this.prisma.folder.create({
            data: {
                ...createFolderDto,
                userId,
                organizationId,
                position,
            },
            include: {
                children: true,
                _count: { select: { bookmarks: true } },
            },
        });
    }

    async findAll(userId: string) {
        // Get all folders for the user and build a tree structure
        const folders = await this.prisma.folder.findMany({
            where: { userId },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
            include: {
                _count: { select: { bookmarks: true, children: true } },
            },
        });

        // Build tree structure
        return this.buildFolderTree(folders);
    }

    async findOne(id: string, userId: string) {
        const folder = await this.prisma.folder.findFirst({
            where: { id, userId },
            include: {
                children: {
                    orderBy: { position: 'asc' },
                    include: {
                        _count: { select: { bookmarks: true } },
                    },
                },
                _count: { select: { bookmarks: true } },
            },
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        return folder;
    }

    async update(id: string, userId: string, updateFolderDto: UpdateFolderDto) {
        const folder = await this.prisma.folder.findFirst({
            where: { id, userId },
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        // If changing parent, verify new parent exists
        if (updateFolderDto.parentId && updateFolderDto.parentId !== folder.parentId) {
            // Prevent setting self as parent
            if (updateFolderDto.parentId === id) {
                throw new ForbiddenException('Cannot set folder as its own parent');
            }

            const parentFolder = await this.prisma.folder.findFirst({
                where: {
                    id: updateFolderDto.parentId,
                    userId,
                },
            });
            if (!parentFolder) {
                throw new NotFoundException('Parent folder not found');
            }
        }

        return this.prisma.folder.update({
            where: { id },
            data: updateFolderDto,
            include: {
                children: true,
                _count: { select: { bookmarks: true } },
            },
        });
    }

    async remove(id: string, userId: string) {
        const folder = await this.prisma.folder.findFirst({
            where: { id, userId },
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        // Delete folder (bookmarks will have folderId set to null due to onDelete: SetNull)
        await this.prisma.folder.delete({
            where: { id },
        });

        return { message: 'Folder deleted successfully' };
    }

    private buildFolderTree(folders: any[]) {
        const folderMap = new Map();
        const rootFolders: any[] = [];

        // First pass: create map of all folders
        folders.forEach((folder) => {
            folderMap.set(folder.id, { ...folder, children: [] });
        });

        // Second pass: build tree
        folders.forEach((folder) => {
            const folderWithChildren = folderMap.get(folder.id);
            if (folder.parentId) {
                const parent = folderMap.get(folder.parentId);
                if (parent) {
                    parent.children.push(folderWithChildren);
                } else {
                    // Parent doesn't exist, treat as root
                    rootFolders.push(folderWithChildren);
                }
            } else {
                rootFolders.push(folderWithChildren);
            }
        });

        return rootFolders;
    }
}
