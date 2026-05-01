// Theatres list page
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Settings, MoreHorizontal, MapPin } from 'lucide-react';
import TheatreModal from './TheatreModal';

interface Theatre {
  _id: string;
  name: string;
  location: string;
  address: string;
}

export default async function TheatresPage() {
  let theatres: Theatre[] = [];
  try {
    theatres = await adminFetch('/theatres');
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
            <Plus data-icon="inline-start" />
            Add Theatre
          </Link>
        </Button>
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
                  <TableCell className="font-medium">{t.name}</TableCell>
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
                          <Link href={`/admin/theatres?edit=${t._id}`}>
                            <Edit data-icon="inline-start" />
                            Edit Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/theatres/${t._id}`}>
                            <Settings data-icon="inline-start" />
                            Manage Halls
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <TheatreModal />
    </div>
  );
}
