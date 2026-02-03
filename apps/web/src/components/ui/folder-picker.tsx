import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { FolderPlus, Folder, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFolders } from "@/hooks/use-data"
import { Button } from "./button"

interface FolderPickerProps {
    onSelect: (folderId: string | null) => void;
    currentFolderId?: string | null;
}

export function FolderPicker({ onSelect, currentFolderId }: FolderPickerProps) {
    const { data: folders, isLoading } = useFolders();

    return (
        <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label="Add to folder"
                    title="Add to folder"
                >
                    <FolderPlus className="h-3 w-3" />
                </Button>
            </DropdownMenuPrimitive.Trigger>
            <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                    className={cn(
                        "z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    )}
                    sideOffset={5}
                    align="end"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : folders?.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No folders available
                        </div>
                    ) : (
                        <>
                            {currentFolderId && (
                                <DropdownMenuPrimitive.Item
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                        "transition-colors focus:bg-accent focus:text-accent-foreground",
                                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    )}
                                    onSelect={() => onSelect(null)}
                                >
                                    <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground italic">Remove from folder</span>
                                </DropdownMenuPrimitive.Item>
                            )}
                            {folders?.map((folder: any) => (
                                <DropdownMenuPrimitive.Item
                                    key={folder.id}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                        "transition-colors focus:bg-accent focus:text-accent-foreground",
                                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        currentFolderId === folder.id && "bg-accent"
                                    )}
                                    onSelect={() => onSelect(folder.id)}
                                >
                                    <Folder className="mr-2 h-4 w-4" style={{ color: folder.color || undefined }} />
                                    <span>{folder.name}</span>
                                </DropdownMenuPrimitive.Item>
                            ))}
                        </>
                    )}
                </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
    )
}
