import { Suspense } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { PaginationWrapper } from '@/components/Pagination';
import { BookingActions } from './BookingActions';

export const dynamic = 'force-dynamic';

interface Booking {
  _id: string;
  userId: string;
  status: string;
  seats: { row: string; col: number }[];
  showtimeId?: {
    date: string;
    startTime: string;
    movieId?: { title: string };
    theatreId?: { name: string };
    hallId?: { name: string };
  };
  createdAt: string;
}

interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page = '1' } = await searchParams;

  let bookings: Booking[] = [];
  let totalPages = 1;

  try {
    const res: BookingsResponse = await adminFetch(`/bookings?q=${q}&page=${page}&limit=10`);
    bookings = res.data;
    totalPages = res.totalPages;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">Monitor all customer bookings and their status.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Suspense fallback={<div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />}>
          <SearchInput placeholder="Search by User ID or Booking ID..." />
        </Suspense>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Showtime</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const showtime = booking.showtimeId;
                  const dateStr = showtime?.date ? new Date(showtime.date).toLocaleDateString() : 'N/A';
                  return (
                    <TableRow key={booking._id}>
                      <TableCell className="font-mono text-xs">{booking._id.slice(-8).toUpperCase()}</TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate" title={booking.userId}>
                        {booking.userId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {showtime?.movieId?.title || 'Unknown Movie'}
                        <div className="text-xs text-muted-foreground mt-1">
                          {showtime?.theatreId?.name} - {showtime?.hallId?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dateStr}
                        <div className="text-xs text-muted-foreground mt-1">
                          {showtime?.startTime || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.seats?.map((s) => `${s.row}${s.col}`).join(', ') || 'None'}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <BookingActions bookingId={booking._id} status={booking.status} />
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/bookings/${booking._id}/print`} target="_blank">
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaginationWrapper totalPages={totalPages} />
    </div>
  );
}
