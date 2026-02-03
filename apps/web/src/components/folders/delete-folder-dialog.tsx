import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteFolder } from "@/hooks/use-data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteFolderDialogProps {
    folder: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectOnDelete?: boolean;
}

export function DeleteFolderDialog({
    folder,
    open,
    onOpenChange,
    redirectOnDelete = false
}: DeleteFolderDialogProps) {
    const navigate = useNavigate();
    const { mutate: deleteFolder, isPending } = useDeleteFolder();

    const onDelete = () => {
        deleteFolder(folder.id, {
            onSuccess: () => {
                toast.success("Collection deleted");
                onOpenChange(false);
                if (redirectOnDelete) {
                    navigate("/");
                }
            },
            onError: () => {
                toast.error("Failed to delete collection");
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the <strong>{folder.name}</strong> collection.
                        All bookmarks inside this collection will <strong>not</strong> be deleted; they will be moved to your main library.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete Collection"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
