'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  genre: z.string().min(1, 'At least one genre is required'),
  language: z.string().min(1, 'Language is required'),
  duration: z.coerce.number().min(1, 'Duration must be greater than 0'),
  releaseDate: z.string().min(1, 'Release date is required'),
  status: z.enum(['now_showing', 'coming_soon']),
  cast: z.array(z.object({
    name: z.string(),
    profileUrl: z.string().optional().nullable(),
  })).default([]),
  rating: z.coerce.number().min(0, 'Rating cannot be negative').max(10, 'Rating cannot exceed 10').optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

type MovieFormValues = z.infer<typeof movieSchema>;

export default function MovieModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const editId = searchParams.get('edit');
  const isOpen = action === 'new' || !!editId;

  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      language: '',
      duration: 120,
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'coming_soon',
      cast: [],
      rating: '',
      featured: false,
    },
  });

  const [actorSearch, setActorSearch] = useState('');
  const [actorResults, setActorResults] = useState<{ name: string; profileUrl?: string }[]>([]);
  const [searchingActors, setSearchingActors] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      if (!editId) return;
      try {
        const res = await fetch(`/api/proxy/movies/${editId}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            title: data.title || '',
            description: data.description || '',
            genre: (data.genre || []).join(', '),
            language: data.language || '',
            duration: data.duration || 120,
            releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : '',
            status: data.status || 'coming_soon',
            cast: ((data.cast || []) as any[]).map(item => 
              typeof item === 'string' ? { name: item } : item
            ),
            rating: data.rating || '',
            featured: data.featured || false,
          });
          setPosterUrl(data.posterUrl || '');
        }
      } catch (err) {
        console.error('Failed to fetch movie', err);
      }
    }
    if (editId && isOpen) {
      fetchMovie();
    } else if (action === 'new') {
      form.reset({
        title: '',
        description: '',
        genre: '',
        language: '',
        duration: 120,
        releaseDate: new Date().toISOString().split('T')[0],
        status: 'coming_soon',
        cast: [],
        rating: '',
        featured: false,
      });
      setPosterUrl('');
      setPosterFile(null);
    }
  }, [editId, action, isOpen, form]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (actorSearch.length >= 2) {
        setSearchingActors(true);
        fetch(`/api/proxy/movies/actor-search?q=${encodeURIComponent(actorSearch)}`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) {
              setActorResults(data);
            } else {
              setActorResults([]);
            }
          })
          .catch(() => setActorResults([]))
          .finally(() => setSearchingActors(false));
      } else {
        setActorResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [actorSearch]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/admin/movies');
    }
  };

  const uploadPoster = async (): Promise<string> => {
    if (!posterFile) return posterUrl;
    const fd = new FormData();
    fd.append('file', posterFile);
    const res = await fetch('/api/proxy/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Poster upload failed');
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (values: MovieFormValues) => {
    setLoading(true);
    try {
      const uploadedPosterUrl = await uploadPoster();
      const payload = {
        ...values,
        genre: values.genre.split(',').map((s) => s.trim()).filter(Boolean),
        cast: values.cast,
        posterUrl: uploadedPosterUrl,
        rating: values.rating !== '' ? Number(values.rating) : undefined,
        featured: values.featured,
      };

      const url = editId ? `/api/proxy/movies/${editId}` : '/api/proxy/movies';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save movie');
      }

      toast.success(editId ? 'Movie updated successfully' : 'Movie added successfully');
      router.push('/admin/movies');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editId ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
          <DialogDescription>
            {editId 
              ? 'Make changes to the movie catalog entry here. Click save when you are done.' 
              : 'Add a new movie to the catalog. Fill out all required fields.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Inception" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A thief who steals corporate secrets..." 
                      className="resize-none" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Action, Sci-Fi" {...field} />
                    </FormControl>
                    <FormDescription>Comma separated</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min) *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" max="10" placeholder="8.8" {...field} />
                    </FormControl>
                    <FormDescription>0.0 to 10.0</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="now_showing">Now Showing</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cast"
              render={() => (
                <FormItem>
                  <FormLabel>Cast (Search & Add Actors) *</FormLabel>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input 
                        placeholder="Search actor name (e.g. Brad Pitt)..." 
                        value={actorSearch}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => setActorSearch(e.target.value)}
                      />
                      {searchingActors && <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">Searching...</div>}
                      
                      {actorResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                          {actorResults.map((actor, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                const current = form.getValues('cast') || [];
                                if (!current.some(a => a.name === actor.name)) {
                                  form.setValue('cast', [...current, actor]);
                                }
                                setActorSearch('');
                                setActorResults([]);
                              }}
                              className="w-full flex items-center gap-3 p-2 hover:bg-accent transition-colors text-left"
                            >
                              {actor.profileUrl ? (
                                <img src={actor.profileUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px]">?</div>
                              )}
                              <span className="text-sm font-medium">{actor.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(form.watch('cast') || []).map((actor, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary/50 border px-2 py-1.5 rounded-lg">
                          {actor.profileUrl && (
                            <img src={actor.profileUrl} alt="" className="w-6 h-6 rounded-md object-cover" />
                          )}
                          <span className="text-sm">{actor.name}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              const current = form.getValues('cast') || [];
                              form.setValue('cast', current.filter(a => a.name !== actor.name));
                            }}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Poster Image</label>
              {posterUrl && !posterFile && (
                <div className="mb-4">
                  <img src={posterUrl} alt="Poster preview" className="w-24 h-36 object-cover rounded-md border" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-[0.8rem] text-muted-foreground">Upload a movie poster (optional)</p>
            </div>

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-base">Featured Movie</FormLabel>
                      {field.value && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] uppercase tracking-wider">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <FormDescription>
                      Feature this movie on the home screen carousel. Only a few movies should be featured at a time.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Movie' : 'Add Movie'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
