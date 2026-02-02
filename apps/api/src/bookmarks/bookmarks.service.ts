import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { QueryBookmarksDto } from './dto/query-bookmarks.dto';
import * as crypto from 'crypto';

@Injectable()
export class BookmarksService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, organizationId: string, createBookmarkDto: CreateBookmarkDto) {
        const { url, tags, ...rest } = createBookmarkDto;

        // Generate URL hash for duplicate detection
        const urlHash = this.generateUrlHash(url);

        // Check for duplicate
        const existingBookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId_urlHash: { userId, urlHash },
            },
        });

        if (existingBookmark && !existingBookmark.deletedAt) {
            throw new ConflictException('Bookmark with this URL already exists');
        }

        // Extract domain from URL
        const domain = this.extractDomain(url);

        // Handle tags: find or create
        let tagConnections: { tagId: string }[] = [];
        if (tags && tags.length > 0) {
            tagConnections = await this.getOrCreateTags(userId, organizationId, tags);
        }

        return this.prisma.bookmark.create({
            data: {
                ...rest,
                url,
                urlHash,
                domain,
                userId,
                organizationId,
                tags: {
                    create: tagConnections.map(t => ({ tagId: t.tagId })),
                },
            },
            include: {
                folder: { select: { id: true, name: true, color: true } },
                tags: {
                    include: { tag: { select: { id: true, name: true, color: true } } },
                },
            },
        });
    }

    async findAll(userId: string, query: QueryBookmarksDto) {
        const { page = 1, limit = 50, folderId, search, isFavorite, isArchived, tags } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            userId,
            deletedAt: null,
        };

        if (folderId) {
            where.folderId = folderId;
        }

        if (isFavorite !== undefined) {
            where.isFavorite = isFavorite;
        }

        if (isArchived !== undefined) {
            where.isArchived = isArchived;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (tags) {
            const tagNames = tags.split(',').map(t => t.trim());
            where.tags = {
                some: {
                    tag: {
                        name: { in: tagNames },
                    },
                },
            };
        }

        const [bookmarks, total] = await Promise.all([
            this.prisma.bookmark.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    folder: { select: { id: true, name: true, color: true } },
                    tags: {
                        include: { tag: { select: { id: true, name: true, color: true } } },
                    },
                },
            }),
            this.prisma.bookmark.count({ where }),
        ]);

        return {
            data: bookmarks.map(this.transformBookmark),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, userId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
            include: {
                folder: { select: { id: true, name: true, color: true } },
                tags: {
                    include: { tag: { select: { id: true, name: true, color: true } } },
                },
            },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        return this.transformBookmark(bookmark);
    }

    async update(id: string, userId: string, organizationId: string, updateBookmarkDto: UpdateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        const { url, tags, ...rest } = updateBookmarkDto;
        const updateData: any = { ...rest };

        // If URL is being updated, regenerate hash and domain
        if (url && url !== bookmark.url) {
            const urlHash = this.generateUrlHash(url);

            // Check for duplicate with new URL
            const existingBookmark = await this.prisma.bookmark.findFirst({
                where: {
                    userId,
                    urlHash,
                    NOT: { id },
                    deletedAt: null,
                },
            });

            if (existingBookmark) {
                throw new ConflictException('Bookmark with this URL already exists');
            }

            updateData.url = url;
            updateData.urlHash = urlHash;
            updateData.domain = this.extractDomain(url);
        }

        // Handle tags update
        if (tags !== undefined) {
            // Delete existing tag connections
            await this.prisma.bookmarkTag.deleteMany({
                where: { bookmarkId: id },
            });

            // Create new tag connections
            if (tags.length > 0) {
                const tagConnections = await this.getOrCreateTags(userId, organizationId, tags);
                await this.prisma.bookmarkTag.createMany({
                    data: tagConnections.map(t => ({
                        bookmarkId: id,
                        tagId: t.tagId,
                    })),
                });
            }
        }

        return this.prisma.bookmark.update({
            where: { id },
            data: updateData,
            include: {
                folder: { select: { id: true, name: true, color: true } },
                tags: {
                    include: { tag: { select: { id: true, name: true, color: true } } },
                },
            },
        }).then(this.transformBookmark);
    }

    async remove(id: string, userId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        // Soft delete
        await this.prisma.bookmark.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Bookmark deleted successfully' };
    }

    async toggleFavorite(id: string, userId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        return this.prisma.bookmark.update({
            where: { id },
            data: { isFavorite: !bookmark.isFavorite },
            include: {
                folder: { select: { id: true, name: true, color: true } },
                tags: {
                    include: { tag: { select: { id: true, name: true, color: true } } },
                },
            },
        }).then(this.transformBookmark);
    }

    async toggleArchive(id: string, userId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        return this.prisma.bookmark.update({
            where: { id },
            data: { isArchived: !bookmark.isArchived },
            include: {
                folder: { select: { id: true, name: true, color: true } },
                tags: {
                    include: { tag: { select: { id: true, name: true, color: true } } },
                },
            },
        }).then(this.transformBookmark);
    }

    async incrementVisitCount(id: string, userId: string) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        return this.prisma.bookmark.update({
            where: { id },
            data: {
                visitCount: { increment: 1 },
                lastVisitedAt: new Date(),
            },
        });
    }

    private generateUrlHash(url: string): string {
        // Normalize URL before hashing
        const normalizedUrl = this.normalizeUrl(url);
        return crypto.createHash('md5').update(normalizedUrl).digest('hex');
    }

    private normalizeUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            // Remove common tracking parameters
            const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid', 'gclid'];
            trackingParams.forEach(param => urlObj.searchParams.delete(param));
            // Remove www. prefix
            urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
            // Remove trailing slash
            return urlObj.toString().replace(/\/$/, '');
        } catch {
            return url;
        }
    }

    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    }

    private async getOrCreateTags(
        userId: string,
        organizationId: string,
        tagNames: string[],
    ): Promise<{ tagId: string }[]> {
        const result: { tagId: string }[] = [];

        for (const name of tagNames) {
            const trimmedName = name.trim();
            if (!trimmedName) continue;

            let tag = await this.prisma.tag.findUnique({
                where: { userId_name: { userId, name: trimmedName } },
            });

            if (!tag) {
                tag = await this.prisma.tag.create({
                    data: { name: trimmedName, userId, organizationId },
                });
            }

            result.push({ tagId: tag.id });
        }

        return result;
    }

    private transformBookmark(bookmark: any) {
        return {
            ...bookmark,
            tags: bookmark.tags?.map((bt: any) => bt.tag) || [],
        };
    }
}
