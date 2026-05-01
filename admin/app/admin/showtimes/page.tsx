import { Suspense } from 'react';
// Showtimes list page with movie filter
import Link from 'next/link';
import { CalendarDays, Plus, Info } from 'lucide-react';
import { adminFetch } from '@/lib/api';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import DeleteShowtimeButton from './DeleteShowtimeButton';
import ShowtimeModal from './ShowtimeModal';

export const dynamic = 'force-dynamic';

interface Showtime {
  _id: string;
  movieId?: { title: string };
  theatreId?: { name: string };
  hallId?: { name: string };
  date: string;
  startTime: string;
  format: string;
  price: number;
  status: string;
}

export default async function ShowtimesPage() {
  let showtimes: Showtime[] = [];
  let movies: any[] = [];
  let theatres: any[] = [];
  
  try {
    [showtimes, movies, theatres] = await Promise.all([
      adminFetch('/showtimes'),
      adminFetch('/movies'),
      adminFetch('/theatres'),
    ]);
  } catch (err) {
    console.error('Failed to fetch showtimes data', err);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Showtimes</h1>
          <p className="text-muted-foreground">
            Manage movie screenings, schedules, and ticket pricing.
          </p>
        </div>
        <Link href="/admin/showtimes?action=new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="w-4 h-4" />
          Schedule Showtime
        </Link>
      </div>

      <Card className="bg-background/50 backdrop-blur-sm border-muted">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Active Schedule
          </CardTitle>
          <CardDescription>
            All currently scheduled screenings across all theatres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showtimes.length === 0 ? (
            <Alert variant="default" className="bg-muted/30 border-muted">
              <Info className="h-4 w-4" />
              <AlertTitle>No showtimes scheduled</AlertTitle>
              <AlertDescription>
                Get started by clicking the "Schedule Showtime" button above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border border-muted">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Movie</TableHead>
                    <TableHead>Theatre / Hall</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showtimes.map((s) => (
                    <TableRow 
                      key={s._id} 
                      className={cn(
                        "hover:bg-muted/10 transition-colors", 
                        s.status === 'cancelled' && "opacity-60 grayscale-[0.5]"
                      )}
                    >
                      <TableCell className="font-semibold">{s.movieId?.title || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.theatreId?.name} 
                        <span className="mx-1.5 opacity-30">•</span>
                        {s.hallId?.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(s.date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.startTime}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-xs font-normal">
                          {s.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        LKR {s.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={s.status === 'active' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/showtimes?edit=${s._id}`} 
                            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "h-8")}
                          >
                            Manage
                          </Link>
                          <DeleteShowtimeButton id={s._id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <ShowtimeModal movies={movies} theatres={theatres} />
      </Suspense>
    </div>
  );
}
