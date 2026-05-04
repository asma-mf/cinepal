'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { cancelBookingAction } from './actions';
import { toast } from 'sonner';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refundPercentage, setRefundPercentage] = useState('0');
  const [comment, setComment] = useState('');
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelBookingAction(
        bookingId,
        parseInt(refundPercentage),
        comment
      );

      if (result.success) {
        toast.success('Booking Cancelled', {
          description: 'The booking has been successfully cancelled and the user notified.',
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Error', {
          description: result.error,
        });
      }
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to cancel booking',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'cancelled') return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <XCircle className="h-4 w-4" />
        <span className="sr-only">Cancel</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="refund">Refund Percentage</Label>
              <Select value={refundPercentage} onValueChange={setRefundPercentage}>
                <SelectTrigger id="refund">
                  <SelectValue placeholder="Select refund amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Refund</SelectItem>
                  <SelectItem value="50">50% Refund</SelectItem>
                  <SelectItem value="75">75% Refund</SelectItem>
                  <SelectItem value="100">Full Refund (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Reason (sent to user)</Label>
              <Textarea
                id="comment"
                placeholder="e.g. Theatre maintenance, show cancelled, etc."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
