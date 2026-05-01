'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  Edit 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteMovieMenuItem from './DeleteMovieButton';

interface Movie {
  _id: string;
}

export default function MovieActions({ movie }: { movie: Movie }) {
  const [mounted, setMounted] = useState(false);

  // Ensure hydration stability by only rendering interactive menu on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" className="h-8 w-8 p-0" disabled>
        <MoreHorizontal className="h-4 w-4 opacity-20" />
      </Button>
    );
  }

  return (
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
            <Edit className="w-4 h-4 mr-2" />
            Edit Movie
          </Link>
        </DropdownMenuItem>
        <DeleteMovieMenuItem id={movie._id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
