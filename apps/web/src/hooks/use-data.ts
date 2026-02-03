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

export function useCreateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newFolder: any) => {
            const { data } = await api.post('/folders', newFolder);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/folders/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useUpdateBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
            const { data } = await api.put(`/bookmarks/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['folders'] });
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

export function useToggleFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(`/bookmarks/${id}/favorite`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}

export function useToggleArchive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(`/bookmarks/${id}/archive`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    });
}


