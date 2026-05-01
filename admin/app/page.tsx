// Root page: redirects to admin dashboard
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/admin/movies');
}
