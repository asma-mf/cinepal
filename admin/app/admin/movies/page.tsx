import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import DeleteMovieMenuItem from './DeleteMovieButton';
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
  Edit, 
  Film, 
  PlayCircle, 
  CalendarClock, 
  Star,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Movie {
  _id: string;
  title: string;
  genre: string[];
  language: string;
  duration: number;
  status: string;
  rating?: number;
}

export default async function MoviesPage() {
  let movies: Movie[] = [];
  try {
    movies = await adminFetch('/movies');
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
            <Plus data-icon="inline-start" />
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
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nowShowing}</div>
            <p className="text-xs text-muted-foreground">Currently in theatres</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
          <CardDescription>A list of all movies available in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movie</TableHead>
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
                    <Badge variant={movie.status === 'now_showing' ? 'default' : 'secondary'}>
                      {movie.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary opacity-70" />
                      {movie.rating ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/movies?edit=${movie._id}`}>
                            <Edit data-icon="inline-start" />
                            Edit Movie
                          </Link>
                        </DropdownMenuItem>
                        <DeleteMovieMenuItem id={movie._id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      
      <MovieModal />
    </div>
  );
}

