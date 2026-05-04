'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
export type { Hall } from './HallLayoutEditor';
import type { Hall } from './HallLayoutEditor';
import { HallLayoutEditor } from './HallLayoutEditor';
import { HallShowtimeViewer } from './HallShowtimeViewer';

const hallSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rows: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 row').max(26, 'Max 26 rows')),
  cols: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 column')),
  rowBreaks: z.string().optional().default(''),
  colBreaks: z.string().optional().default(''),
});

type HallFormValues = {
  name: string;
  rows: number;
  cols: number;
  rowBreaks: string;
  colBreaks: string;
};

export default function HallsManager({ theatreId, halls }: { theatreId: string; halls: Hall[] }) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallSchema as any),
    defaultValues: {
      name: '',
      rows: 10,
      cols: 10,
      rowBreaks: '',
      colBreaks: '',
    },
  });

  const onSubmit = async (values: HallFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        rowBreaks: values.rowBreaks ? values.rowBreaks.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : [],
        colBreaks: values.colBreaks ? values.colBreaks.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : [],
      };
      const res = await fetch(`/api/proxy/theatres/${theatreId}/halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add hall');
      }

      toast.success('Hall added successfully');
      form.reset();
      setIsAddOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hallId: string) => {
    setDeleting(hallId);
    try {
      const res = await fetch(`/api/proxy/halls/${hallId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete hall');
      toast.success('Hall deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-muted">
        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Cinema Halls
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage seating capacity and layouts for this theatre.
          </p>
        </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Hall
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Hall</DialogTitle>
                <DialogDescription>
                  Define the seating capacity for a new cinema hall.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hall Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Screen 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rows"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rows</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cols"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seats per Row</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rowBreaks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Row Breaks (indices)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 3, 7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colBreaks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Col Breaks (indices)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Create Hall'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
      </div>
      <div className="rounded-md border border-muted p-2 bg-background/50">
            {halls.length === 0 ? (
              <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                No halls configured for this theatre yet.
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {halls.map((hall) => (
                  <AccordionItem key={hall._id} value={hall._id} className="border-b-0 mb-2 last:mb-0 border rounded-md bg-card overflow-hidden">
                    <div className="flex items-center group pr-4 hover:bg-muted/30 transition-colors">
                      <AccordionTrigger className="flex-1 hover:no-underline px-4 py-4 border-none">
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                          <span className="font-semibold text-base">{hall.name}</span>
                          <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {hall.rows} R × {hall.cols} C
                          </span>
                          <Badge variant="secondary" className="font-mono">
                            {hall.rows * hall.cols} Seats
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <HallLayoutEditor 
                          hall={hall} 
                          onUpdate={() => router.refresh()} 
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              disabled={deleting === hall._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Hall?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the hall and any associated seat configurations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(hall._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <AccordionContent className="pt-4 px-4 pb-4 border-t border-muted/50">
                      <HallShowtimeViewer hallId={hall._id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
      </div>
    </div>
  );
}
