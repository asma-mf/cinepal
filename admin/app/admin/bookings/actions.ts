'use server';

import { adminFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function cancelBookingAction(bookingId: string, refundPercentage: number, comment: string) {
  try {
    await adminFetch(`/bookings/${bookingId}/admin-cancel`, {
      method: 'PUT',
      body: JSON.stringify({
        refundPercentage,
        comment,
      }),
    });
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to cancel booking:', error);
    return { success: false, error: error.message || 'Failed to cancel booking' };
  }
}
