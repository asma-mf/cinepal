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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const showtimeSchema = z.object({
  movieId: z.string().min(1, 'Please select a movie'),
  theatreId: z.string().min(1, 'Please select a theatre'),
  hallId: z.string().min(1, 'Please select a hall'),
  schedulingType: z.enum(['single', 'range']),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  format: z.string().min(1, 'Format is required'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (data.schedulingType === 'single') {
    if (!data.date) return false;
    const d = new Date(data.date);
    return d >= today && d <= oneYearFromNow;
  }
  return true;
}, {
  message: "Date must be between today and 1 year from now",
  path: ["date"]
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (data.schedulingType === 'range') {
    if (!data.startDate || !data.endDate) return false;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start >= today && end >= start && end <= oneYearFromNow;
  }
  return true;
}, {
  message: "Invalid range: must be today or in the future (max 1 year), and end date must be after start date",
  path: ["startDate"]
});

type ShowtimeFormValues = z.infer<typeof showtimeSchema>;

interface Movie { _id: string; title: string; }
interface Theatre { _id: string; name: string; }
interface Hall { _id: string; name: string; rows: number; cols: number; }

export default function ShowtimeModal({
  movies,
  theatres,
}: {
  movies: Movie[];
  theatres: Theatre[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const editId = searchParams.get('edit');
  const isOpen = action === 'new' || !!editId;

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [halls, setHalls] = useState<Hall[]>([]);

  const form = useForm<ShowtimeFormValues>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: '',
      theatreId: '',
      hallId: '',
      schedulingType: 'single',
      date: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '',
      format: '2D',
      price: 1500,
    },
  });

  const selectedTheatreId = form.watch('theatreId');
  const schedulingType = form.watch('schedulingType');

  useEffect(() => {
    if (!selectedTheatreId) {
      setHalls([]);
      form.setValue('hallId', '');
      return;
    }
    fetch(`/api/proxy/theatres/${selectedTheatreId}`)
      .then((r) => r.json())
      .then((data) => {
        setHalls(data.halls || []);
      })
      .catch(() => setHalls([]));
  }, [selectedTheatreId, form]);

  useEffect(() => {
    async function fetchShowtime() {
      if (!editId) return;
      try {
        const res = await fetch(`/api/proxy/showtimes/${editId}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            movieId: data.movieId?._id || data.movieId || '',
            theatreId: data.theatreId?._id || data.theatreId || '',
            hallId: data.hallId?._id || data.hallId || '',
            schedulingType: 'single',
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
            startTime: data.startTime || '',
            format: data.format || '2D',
            price: data.price || 1500,
          });
        }
      } catch (err) {
        console.error('Failed to fetch showtime', err);
      }
    }

    if (editId && isOpen) {
      fetchShowtime();
    } else if (action === 'new') {
      form.reset({
        movieId: '',
        theatreId: '',
        hallId: '',
        schedulingType: 'single',
        date: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '',
        format: '2D',
        price: 1500,
      });
    }
  }, [editId, action, isOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/admin/showtimes');
    }
  };

  const onCancelSingle = async () => {
    if (!editId) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/proxy/showtimes/${editId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel showtime');
      toast.success('Showtime cancelled');
      handleOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const onCancelGlobal = async () => {
    const movieId = form.getValues('movieId');
    const fromDate = form.getValues('date') || form.getValues('startDate');
    if (!movieId) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/proxy/showtimes/cancel-future/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate }),
      });
      if (!res.ok) throw new Error('Failed to cancel future showtimes');
      const data = await res.json();
      toast.success(data.message);
      handleOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const onSubmit = async (values: ShowtimeFormValues) => {
    setLoading(true);
    try {
      const url = editId ? `/api/proxy/showtimes/${editId}` : '/api/proxy/showtimes';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save showtime');
      }

      toast.success(editId ? 'Showtime updated' : 'Showtime(s) scheduled');
      handleOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editId ? 'Manage Showtime' : 'Schedule Showtime'}</DialogTitle>
          <DialogDescription>
            {editId 
              ? 'Update or cancel this movie screening.' 
              : 'Schedule movie screenings. Choose between a single date or a date range.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editId && (
              <Tabs defaultValue="single" onValueChange={(v) => form.setValue('schedulingType', v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Date</TabsTrigger>
                  <TabsTrigger value="range">Date Range</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <FormField
              control={form.control}
              name="movieId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movie *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!editId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a movie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movies.map((m) => (
                        <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="theatreId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theatre *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theatre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {theatres.map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hallId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hall *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={halls.length === 0 || !!editId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={halls.length === 0 ? "Select theatre first" : "Select hall"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {halls.map((h) => (
                          <SelectItem key={h._id} value={h._id}>
                            {h.name} ({h.rows * h.cols} seats)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {schedulingType === 'single' ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2D">2D</SelectItem>
                        <SelectItem value="3D">3D</SelectItem>
                        <SelectItem value="IMAX">IMAX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Price (LKR) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                {editId ? (
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" size="sm" disabled={cancelling}>
                          Cancel Showtime
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark this specific showtime as cancelled. Bookings will be preserved but the show will not proceed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Go Back</AlertDialogCancel>
                          <AlertDialogAction onClick={onCancelSingle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" disabled={cancelling}>
                          Cancel Movie Globally
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Global Movie Cancellation</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel ALL future showtimes for this movie across all theatres from this date onwards. This action cannot be easily undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Go Back</AlertDialogCancel>
                          <AlertDialogAction onClick={onCancelGlobal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Confirm Global Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading || cancelling}>
                    Close
                  </Button>
                  <Button type="submit" disabled={loading || cancelling}>
                    {loading ? 'Saving...' : editId ? 'Update Details' : 'Schedule Now'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
