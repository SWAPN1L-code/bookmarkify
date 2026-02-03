import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateFolder } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FolderPlus } from 'lucide-react';

interface CreateFolderForm {
    name: string;
}

export function CreateFolderDialog() {
    const [open, setOpen] = useState(false);
    const { mutate: createFolder, isPending } = useCreateFolder();
    const { register, handleSubmit, reset } = useForm<CreateFolderForm>();

    const onSubmit = (data: CreateFolderForm) => {
        createFolder(
            { name: data.name },
            {
                onSuccess: () => {
                    toast.success('Collection created');
                    setOpen(false);
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create collection');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <FolderPlus className="h-4 w-4" />
                    <span>Create Collection</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Collection</DialogTitle>
                    <DialogDescription>
                        Create a new collection to organize your bookmarks.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="My Collection"
                                {...register('name', { required: true })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
