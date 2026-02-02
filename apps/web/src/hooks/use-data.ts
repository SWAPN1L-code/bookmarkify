import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useBookmarks(params: any = {}) {
    return useQuery({
        queryKey: ['bookmarks', params],
        queryFn: async () => {
            const { data } = await api.get('/bookmarks', { params });
            return data;
        },
    });
}

export function useCreateBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBookmark: any) => {
            const { data } = await api.post('/bookmarks', newBookmark);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
}

export function useDeleteBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/bookmarks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useFolders() {
    return useQuery({
        queryKey: ['folders'],
        queryFn: async () => {
            const { data } = await api.get('/folders');
            return data;
        },
    });
}

export function useTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data } = await api.get('/tags');
            return data;
        },
    });
}
