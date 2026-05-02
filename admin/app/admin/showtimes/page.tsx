import { Suspense } from 'react';
import Link from 'next/link';
import { CalendarDays, Plus, Info, Filter, History, Clock } from 'lucide-react';
import { adminFetch } from '@/lib/api';
import { buttonVariants, Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationWrapper } from '@/components/Pagination';

import DeleteShowtimeButton from './DeleteShowtimeButton';
import ShowtimeModal from './ShowtimeModal';

export const dynamic = 'force-dynamic';

interface Showtime {
  _id: string;
  movieId?: { title: string };
  theatreId?: { name: string };
  hallId?: { name: string };
  date: string;
  startTime: string;
  format: string;
  price: number;
  status: string;
}

interface ShowtimesResponse {
  data: Showtime[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function ShowtimesPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    tab1?: string; 
    tab2?: string; 
    status1?: string; 
    page1?: string;
    action?: string;
    edit?: string;
  }>;
}) {
  const { 
    tab1 = 'today', 
    tab2 = 'executed', 
    status1 = 'all', 
    page1 = '1',
  } = await searchParams;

  let section1Data: Showtime[] = [];
  let section2Data: Showtime[] = [];
  let section1TotalPages = 1;
  let section2TotalPages = 1;

  // Data fetching helper
  const fetchSection = async (timeframe: string, status: string, page: string = '1', limit: number = 100) => {
    try {
      const res = await adminFetch(`/showtimes?timeframe=${timeframe}&status=${status}&page=${page}&limit=${limit}`);
      if ('data' in res) return res;
      return { data: res, totalPages: 1 };
    } catch (err) {
      console.error(`Failed to fetch ${timeframe} showtimes`, err);
      return { data: [], totalPages: 1 };
    }
  };

  // Fetch Section 1
  let s1Params = { timeframe: 'today', status: status1, limit: 100 };
  if (tab1 === 'upcoming') {
    s1Params = { timeframe: 'upcoming', status: status1, limit: 25 };
  } else if (tab1 === 'upcoming_cancelled') {
    s1Params = { timeframe: 'upcoming', status: 'cancelled', limit: 100 };
  }
  const s1Res = await fetchSection(s1Params.timeframe, s1Params.status, page1, s1Params.limit);
  section1Data = s1Res.data;
  section1TotalPages = s1Res.totalPages;

  // Fetch Section 2
  const s2Status = tab2 === 'executed' ? 'active' : 'cancelled';
  const s2Res = await fetchSection('previous', s2Status, '1', 100);
  section2Data = s2Res.data;
  section2TotalPages = s2Res.totalPages;

  const movies = await adminFetch('/movies?includeArchived=true');
  const theatres = await adminFetch('/theatres');

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'success' : 'destructive'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const ShowtimeTable = ({ data, showStatus = true }: { data: Showtime[], showStatus?: boolean }) => (
    <div className="rounded-md border border-muted">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Movie</TableHead>
            <TableHead>Theatre / Hall</TableHead>
            <TableHead>Date / Time</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Price</TableHead>
            {showStatus && <TableHead>Status</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showStatus ? 7 : 6} className="h-32 text-center text-muted-foreground">
                No showtimes found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((s) => (
              <TableRow key={s._id} className={cn("hover:bg-muted/10 transition-colors", s.status === 'cancelled' && "opacity-60")}>
                <TableCell className="font-semibold truncate max-w-[200px]">{s.movieId?.title || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {s.theatreId?.name} • {s.hallId?.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(s.date).toLocaleDateString()} {s.startTime}
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] h-5">{s.format}</Badge></TableCell>
                <TableCell className="text-xs font-mono">LKR {s.price.toLocaleString()}</TableCell>
                {showStatus && <TableCell>{getStatusBadge(s.status)}</TableCell>}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={`/admin/showtimes?edit=${s._id}`}>Manage</Link>
                    </Button>
                    <DeleteShowtimeButton id={s._id} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Showtimes Schedule</h1>
          <p className="text-muted-foreground">Manage screening schedules, history, and ticket pricing.</p>
        </div>
        <Button asChild>
          <Link href="/admin/showtimes?action=new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Showtime
          </Link>
        </Button>
      </div>

      {/* Section 1: Current & Future */}
      <Card className="border-muted bg-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Live Schedule
            </CardTitle>
            <CardDescription>Active and upcoming movie screenings.</CardDescription>
          </div>
          
          {(tab1 === 'today' || tab1 === 'upcoming') && (
            <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-lg border border-muted">
              <span className="text-xs font-medium px-2 text-muted-foreground">Filter:</span>
              <div className="flex gap-1">
                {['all', 'active', 'cancelled'].map((s) => (
                  <Button
                    key={s}
                    variant={status1 === s ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-[10px] capitalize px-2"
                    asChild
                  >
                    <Link href={`?tab1=${tab1}&status1=${s}&tab2=${tab2}`}>{s}</Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab1} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="today" asChild>
                <Link href={`?tab1=today&status1=${status1}&tab2=${tab2}`}>Today's Schedule</Link>
              </TabsTrigger>
              <TabsTrigger value="upcoming" asChild>
                <Link href={`?tab1=upcoming&status1=${status1}&tab2=${tab2}`}>Upcoming</Link>
              </TabsTrigger>
              <TabsTrigger value="upcoming_cancelled" asChild>
                <Link href={`?tab1=upcoming_cancelled&tab2=${tab2}`}>Upcoming Cancelled</Link>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={tab1} className="mt-0">
              <ShowtimeTable data={section1Data} />
              {tab1 === 'upcoming' && (
                <div className="mt-4">
                  <PaginationWrapper totalPages={section1TotalPages} paramName="page1" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Section 2: History */}
      <Card className="border-muted bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Showtime History
          </CardTitle>
          <CardDescription>Past showtimes and archived records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab2} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="executed" asChild>
                <Link href={`?tab1=${tab1}&tab2=executed`}>Executed</Link>
              </TabsTrigger>
              <TabsTrigger value="cancelled" asChild>
                <Link href={`?tab1=${tab1}&tab2=cancelled`}>Cancelled</Link>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={tab2} className="mt-0">
              <ShowtimeTable data={section2Data} showStatus={false} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <ShowtimeModal movies={movies} theatres={theatres} />
      </Suspense>
    </div>
  );
}
