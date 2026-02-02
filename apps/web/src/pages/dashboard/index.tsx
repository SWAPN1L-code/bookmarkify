import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBookmarks } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Search, Trash2, MoreVertical, Globe, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AddBookmarkDialog } from '@/components/bookmarks/add-bookmark-dialog';

interface DashboardPageProps {
    filter?: 'favorites' | 'archive';
}

export function DashboardPage({ filter }: DashboardPageProps) {
    const { folderId } = useParams();

    const [search, setSearch] = useState('');

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useBookmarks({
        page: 1,
        limit: 50,
        folderId,
        search: debouncedSearch,
        isFavorite: filter === 'favorites' ? true : undefined,
        isArchived: filter === 'archive' ? true : undefined,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {filter === 'favorites' ? 'Favorites' :
                            filter === 'archive' ? 'Archive' :
                                folderId ? 'Folder View' : 'All Bookmarks'}
                    </h1>
                    <p className="text-muted-foreground">
                        {data?.meta?.total || 0} items
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookmarks..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <AddBookmarkDialog />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-40 rounded-xl border bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : data?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-muted/10 text-center border-dashed">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No bookmarks found</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-4">
                        {search ? "Try adjusting your search terms." : "Get started by adding your first bookmark."}
                    </p>
                    {!search && <AddBookmarkDialog />}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data?.data?.map((bookmark: any) => (
                        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                </div>
            )}
        </div>
    );
}

function BookmarkCard({ bookmark }: { bookmark: any }) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-all group border-muted/60 hover:border-primary/50">
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {bookmark.faviconUrl ? (
                            <img src={bookmark.faviconUrl} alt="" className="w-4 h-4 rounded-sm" />
                        ) : (
                            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {bookmark.domain?.[0]?.toUpperCase() || 'B'}
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground truncate" title={bookmark.domain}>
                            {bookmark.domain}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
                    </Button>
                </div>
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary line-clamp-2 leading-tight block group-hover:underline decoration-primary/50 underline-offset-2"
                >
                    {bookmark.title}
                </a>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                {bookmark.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                        {bookmark.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {bookmark.tags?.map((tag: any) => (
                        <Badge key={tag.id} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground bg-muted hover:bg-muted/80 border-transparent">
                            #{tag.name}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-3 bg-muted/5 text-xs text-muted-foreground flex justify-between items-center mt-auto border-t">
                <span className="flex items-center gap-1.5 opacity-70">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                </span>
                {!bookmark.isArchived && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1">
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
