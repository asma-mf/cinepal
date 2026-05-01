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

export default async function AdminBookingsPage() {
  let bookings: Booking[] = [];
  try {
    bookings = await adminFetch('/bookings');
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Confirmed</Badge>;
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
