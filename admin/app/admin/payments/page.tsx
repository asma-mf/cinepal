import { adminFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RevenueChart, StatusDistributionChart } from './RevenueChart';

interface Payment {
  _id: string;
  bookingId?: {
    _id: string;
    showtimeId?: {
      movieId?: { title: string };
    };
  };
  userId: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

export default async function AdminPaymentsPage() {
  let payments: Payment[] = [];
  try {
    payments = await adminFetch('/payments');
  } catch (error) {
    console.error('Failed to fetch payments:', error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Success</Badge>;
      case 'partial_refund':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Partial Refund</Badge>;
      case 'refunded':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = payments.reduce((sum, p) => {
    if (p.status === 'success') return sum + p.amount;
    if (p.status === 'partial_refund') return sum + (p.amount / 2);
    return sum;
  }, 0);

  const totalTransactions = payments.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-muted-foreground">Monitor daily revenue and view transaction history.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1c1c1c] border-[#333]">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">LKR {totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-[#1c1c1c] border-[#333]">
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalTransactions}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue trend over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart payments={payments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of payment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart payments={payments} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A detailed list of all payment records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate" title={payment.userId}>
                      {payment.userId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.bookingId?.showtimeId?.movieId?.title || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      LKR {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
