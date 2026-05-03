'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DeleteShowtimeButton({ id, hasBookings }: { id: string; hasBookings?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processRefunds, setProcessRefunds] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/showtimes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processRefunds }),
      });
      if (!res.ok) throw new Error('Failed to cancel showtime');
      toast.success(
        processRefunds
          ? 'Showtime cancelled and refunds processed'
          : 'Showtime cancelled'
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={loading}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Showtime?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark this showtime as cancelled and notify all affected bookers.
            {hasBookings && ' There are existing confirmed bookings for this showtime.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Refund option — only meaningful if there are confirmed bookings */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4 my-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {processRefunds ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Process Refunds</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically cancel and refund all confirmed bookings for this showtime.
            </p>
          </div>
          <Switch
            checked={processRefunds}
            onCheckedChange={setProcessRefunds}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
          >
            {loading ? 'Processing...' : processRefunds ? 'Cancel & Refund' : 'Confirm Cancellation'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
