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

const hallSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rows: z.coerce.number().min(1, 'At least 1 row').max(26, 'Max 26 rows'),
  cols: z.coerce.number().min(1, 'At least 1 column'),
});

type HallFormValues = z.infer<typeof hallSchema>;

interface Hall {
  _id: string;
  name: string;
  rows: number;
  cols: number;
}

export default function HallsManager({ theatreId, halls }: { theatreId: string; halls: Hall[] }) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallSchema),
    defaultValues: {
      name: '',
      rows: 10,
      cols: 10,
    },
  });

  const onSubmit = async (values: HallFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/theatres/${theatreId}/halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
    <div className="space-y-6">
      <Card className="bg-background/50 backdrop-blur-sm border-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-xl flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Cinema Halls
            </CardTitle>
            <CardDescription>
              Manage seating capacity and layouts for this theatre.
            </CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-muted">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Hall Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {halls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      No halls configured for this theatre yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  halls.map((hall) => (
                    <TableRow key={hall._id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium">{hall.name}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {hall.rows} R × {hall.cols} C
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {hall.rows * hall.cols}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
