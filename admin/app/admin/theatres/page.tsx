import { Suspense } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, MapPin, Building2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TheatreModal from './TheatreModal';
import { TheatreActions } from './TheatreActions';
import { SearchInput } from '@/components/SearchInput';
import { PaginationWrapper } from '@/components/Pagination';
import HallsManager from './[id]/HallsManager';

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
  let theatresWithHalls: any[] = [];
  let totalPages = 1;

  try {
    const res: TheatresResponse = await adminFetch(`/theatres?q=${q}&page=${page}&limit=10`);
    theatres = res.data;
    totalPages = res.totalPages;

    // Fetch halls for the theatres to display inline
    theatresWithHalls = await Promise.all(
      theatres.map(async (t) => {
        try {
          const detail = await adminFetch(`/theatres/${t._id}`);
          return { ...t, halls: detail.halls || [] };
        } catch {
          return { ...t, halls: [] };
        }
      })
    );
  } catch {
    theatres = [];
    theatresWithHalls = [];
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
        <CardContent className="p-2">
          {theatresWithHalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-32">
              <MapPin className="size-8 opacity-20 mb-2" />
              <p className="font-medium">No theatres found</p>
              <p className="text-sm">Add a theatre location to get started.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {theatresWithHalls.map((t) => (
                <AccordionItem key={t._id} value={t._id} className="border-b-0 mb-2 last:mb-0 border rounded-md bg-card overflow-hidden">
                  <div className="flex items-center justify-between group pr-4 hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="flex-1 hover:no-underline px-4 py-4 border-none">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-9 w-9 rounded-md border bg-muted">
                          <AvatarImage src={t.imageUrl} alt={t.name} className="object-cover" />
                          <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-base">{t.name}</span>
                          <span className="text-sm text-muted-foreground hidden sm:flex items-center mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {t.location} <span className="opacity-50 mx-2">•</span> {t.address}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TheatreActions theatreId={t._id} />
                    </div>
                  </div>
                  <AccordionContent className="p-4 border-t border-muted/50 bg-background/50">
                    <HallsManager theatreId={t._id} halls={t.halls} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <PaginationWrapper totalPages={totalPages} />

      <Suspense fallback={null}>
        <TheatreModal />
      </Suspense>
    </div>
  );
}
