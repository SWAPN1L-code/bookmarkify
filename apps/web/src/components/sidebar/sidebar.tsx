import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    LayoutGrid,
    Star,
    Archive,
    Hash,
    Folder,
    Plus,
    ChevronRight,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useFolders, useTags } from '@/hooks/use-data';

export function Sidebar() {
    const location = useLocation();
    const { data: folders, isLoading: foldersLoading } = useFolders();
    const { data: tags, isLoading: tagsLoading } = useTags();

    return (
        <div className="pb-12 w-64 border-r h-screen hidden md:block bg-background flex-shrink-0">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Library
                    </h2>
                    <div className="space-y-1">
                        <Link to="/">
                            <Button
                                variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                All Bookmarks
                            </Button>
                        </Link>
                        <Link to="/favorites">
                            <Button
                                variant={location.pathname === '/favorites' ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                            >
                                <Star className="mr-2 h-4 w-4" />
                                Favorites
                            </Button>
                        </Link>
                        <Link to="/archive">
                            <Button
                                variant={location.pathname === '/archive' ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between px-4 mb-2">
                        <h2 className="text-lg font-semibold tracking-tight">
                            Collections
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[250px] px-1">
                        <div className="space-y-1">
                            {foldersLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                folders?.map((folder: any) => (
                                    <FolderItem key={folder.id} folder={folder} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Tags
                    </h2>
                    <ScrollArea className="h-[200px] px-1">
                        <div className="space-y-1">
                            {tagsLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                tags?.map((tag: any) => (
                                    <Button key={tag.id} variant="ghost" className="w-full justify-start text-sm h-8" size="sm">
                                        <Hash className="mr-2 h-3 w-3 text-muted-foreground" />
                                        {tag.name}
                                        <span className="ml-auto text-xs text-muted-foreground">{tag._count.bookmarks}</span>
                                    </Button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

function FolderItem({ folder, level = 0 }: { folder: any; level?: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = folder.children && folder.children.length > 0;
    const location = useLocation();
    const isActive = location.pathname === `/folder/${folder.id}`;

    return (
        <div>
            <div className="flex items-center">
                {hasChildren && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-6 p-0 hover:bg-transparent"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                    >
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                )}
                <Link to={`/folder/${folder.id}`} className="flex-1">
                    <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-start h-9", !hasChildren && "pl-8")}
                    >
                        <Folder className={cn("mr-2 h-4 w-4", isActive ? "fill-current" : "")} />
                        <span className="truncate">{folder.name}</span>
                    </Button>
                </Link>
            </div>
            {isOpen && hasChildren && (
                <div className="ml-4 border-l pl-2">
                    {folder.children.map((child: any) => (
                        <FolderItem key={child.id} folder={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
