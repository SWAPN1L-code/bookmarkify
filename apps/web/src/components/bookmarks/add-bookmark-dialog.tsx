import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateBookmark } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const bookmarkSchema = z.object({
    url: z.string().url('Invalid URL'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    tags: z.string().optional(), // simplified for now, comma separated
});

type BookmarkFormValues = z.infer<typeof bookmarkSchema>;

export function AddBookmarkDialog() {
    const [open, setOpen] = useState(false);
    const createBookmark = useCreateBookmark();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isLoading },
    } = useForm<BookmarkFormValues>({
        resolver: zodResolver(bookmarkSchema),
    });

    const onSubmit = async (data: BookmarkFormValues) => {
        try {
            // Transform tags string to array
            const tagsArray = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            await createBookmark.mutateAsync({
                ...data,
                tags: tagsArray,
            });

            toast.success('Bookmark added');
            setOpen(false);
            reset();
        } catch (error) {
            toast.error('Failed to add bookmark');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Bookmark
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Bookmark</DialogTitle>
                    <DialogDescription>
                        Save a new link to your collection.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            placeholder="https://example.com"
                            {...register('url')}
                        />
                        {errors.url && (
                            <p className="text-sm text-destructive">{errors.url.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Example Website"
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="A short description..."
                            {...register('description')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Comma separated)</Label>
                        <Input
                            id="tags"
                            placeholder="tech, design, inspiration"
                            {...register('tags')}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Benchmark'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
