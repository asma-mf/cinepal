'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DeleteMovieMenuItem({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/movies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Movie deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete movie');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Movie
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Movie?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this movie? This will remove all associated metadata and images from the catalogue. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
