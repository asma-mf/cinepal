import { adminFetch } from '@/lib/api';
import PrintTicketClient from '../../admin/bookings/[id]/print/PrintTicketClient';

export default async function PublicPrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let booking = null;
  let error = '';

  try {
    // This will work if the user is logged in via Clerk and owns the booking
    booking = await adminFetch(`/bookings/${id}`);
  } catch (err: any) {
    error = 'You do not have permission to view this ticket or it does not exist.';
  }

  if (error || !booking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 p-6">
        <div className="max-w-md text-center">
          <p className="text-red-500 font-medium mb-2">Access Denied</p>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return <PrintTicketClient booking={booking} />;
}
