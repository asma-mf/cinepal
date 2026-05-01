import { Suspense } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import MovieActions from './MovieActions';
import MovieModal from './MovieModal';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Plus, 
  Film, 
  Star,
  Play,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const dynamic = 'force-dynamic';

interface Movie {
  _id: string;
  title: string;
  genre: string[];
  language: string;
  duration: number;
  status: string;
  rating?: number;
  featured?: boolean;
  posterUrl?: string;
}

export default async function MoviesPage() {
  let movies: Movie[] = [];
  try {
    movies = await adminFetch('/movies?includeArchived=true');
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    movies = [];
  }

  // Calculate stats
  const totalMovies = movies.length;
  const nowShowing = movies.filter(m => m.status === 'now_showing').length;
  const comingSoon = movies.filter(m => m.status === 'coming_soon').length;
  
  const totalRating = movies.reduce((sum, m) => sum + (m.rating || 0), 0);
  const ratedMovies = movies.filter(m => m.rating && m.rating > 0).length;
  const avgRating = ratedMovies > 0 ? (totalRating / ratedMovies).toFixed(1) : '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movies Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview and catalog management.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/movies?action=new">
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </Link>
        </Button>
      </div>

      {/* Dashboard Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovies}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Now Showing</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nowShowing}</div>
            <p className="text-xs text-muted-foreground">Currently in theatres</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comingSoon}</div>
            <p className="text-xs text-muted-foreground">Upcoming releases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Based on audience reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movie Catalogue</CardTitle>
          <CardDescription>Manage your cinema's available and upcoming movies.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Genre</TableHead>
                <TableHead className="hidden md:table-cell">Language</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md bg-muted">
                        <AvatarImage src={movie.posterUrl} alt={movie.title} className="object-cover" />
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary font-medium text-xs">
                          {movie.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{movie.title}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{movie.genre?.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {movie.genre?.slice(0, 3).join(', ')}
                    {movie.genre?.length > 3 && '...'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{movie.language}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{movie.duration} min</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Badge variant={
                        movie.status === 'now_showing' ? 'default' : 
                        movie.status === 'archived' ? 'destructive' : 'secondary'
                      }>
                        {movie.status.replace('_', ' ')}
                      </Badge>
                      {movie.featured && (
                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase tracking-wider">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary opacity-70" />
                      {movie.rating ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <MovieActions movie={movie} />
                  </TableCell>
                </TableRow>
              ))}
              {movies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Film className="size-8 opacity-20 mb-2" />
                      <p className="font-medium">No movies found</p>
                      <p className="text-sm">Add a movie to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Suspense fallback={null}>
        <MovieModal />
      </Suspense>
    </div>
  );
}
