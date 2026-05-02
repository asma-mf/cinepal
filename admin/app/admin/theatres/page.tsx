import { Suspense } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, MapPin, Building2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TheatreModal from './TheatreModal';
import { TheatreActions } from './TheatreActions';
import { SearchInput } from '@/components/SearchInput';
import { PaginationWrapper } from '@/components/Pagination';

export const dynamic = 'force-dynamic';

interface Theatre {
  _id: string;
  name: string;
  location: string;
  address: string;
  imageUrl?: string;
}

interface TheatresResponse {
  data: Theatre[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function TheatresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page = '1' } = await searchParams;

  let theatres: Theatre[] = [];
  let totalPages = 1;

  try {
    const res: TheatresResponse = await adminFetch(`/theatres?q=${q}&page=${page}&limit=10`);
    theatres = res.data;
    totalPages = res.totalPages;
  } catch {
    theatres = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theatres Management</h1>
          <p className="text-sm text-muted-foreground">Manage theatre locations and their respective halls.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/theatres?action=new">
            <Plus className="mr-2 h-4 w-4" />
            Add Theatre
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Suspense fallback={<div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />}>
          <SearchInput placeholder="Search by name or location..." />
        </Suspense>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {theatres.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md border bg-muted">
                        <AvatarImage src={t.imageUrl} alt={t.name} className="object-cover" />
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {t.location}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[300px]">
                    {t.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <TheatreActions theatreId={t._id} />
                  </TableCell>
                </TableRow>
              ))}
              {theatres.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="size-8 opacity-20 mb-2" />
                      <p className="font-medium">No theatres found</p>
                      <p className="text-sm">Add a theatre location to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaginationWrapper totalPages={totalPages} />

      <Suspense fallback={null}>
        <TheatreModal />
      </Suspense>
    </div>
  );
}
