'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const theatreSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(5, 'Please provide a full address'),
  imageUrl: z.string().optional(),
});

type TheatreFormValues = z.infer<typeof theatreSchema>;

export default function TheatreModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const editId = searchParams.get('edit');
  const isOpen = action === 'new' || !!editId;

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const form = useForm<TheatreFormValues>({
    resolver: zodResolver(theatreSchema),
    defaultValues: {
      name: '',
      location: '',
      address: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    async function fetchTheatre() {
      if (!editId) return;
      try {
        const res = await fetch(`/api/proxy/theatres/${editId}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            name: data.name || '',
            location: data.location || '',
            address: data.address || '',
            imageUrl: data.imageUrl || '',
          });
          setImageUrl(data.imageUrl || '');
        }
      } catch (err) {
        console.error('Failed to fetch theatre', err);
      }
    }

    if (editId && isOpen) {
      fetchTheatre();
    } else if (action === 'new') {
      form.reset({
        name: '',
        location: '',
        address: '',
        imageUrl: '',
      });
      setImageUrl('');
      setImageFile(null);
    }
  }, [editId, action, isOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/admin/theatres');
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imageUrl;
    const fd = new FormData();
    fd.append('file', imageFile);
    const res = await fetch('/api/proxy/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (values: TheatreFormValues) => {
    setLoading(true);
    try {
      const uploadedImageUrl = await uploadImage();
      const payload = {
        ...values,
        imageUrl: uploadedImageUrl,
      };

      const url = editId ? `/api/proxy/theatres/${editId}` : '/api/proxy/theatres';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save theatre');
      }

      toast.success(editId ? 'Theatre updated successfully' : 'Theatre added successfully');
      router.push('/admin/theatres');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editId ? 'Edit Theatre' : 'Add New Theatre'}</DialogTitle>
          <DialogDescription>
            {editId 
              ? 'Update the details for this theatre location.' 
              : 'Register a new theatre location in the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theatre Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="CinePal Megaplex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Colombo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street, City Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theatre Image</label>
              {imageUrl && !imageFile && (
                <div className="mb-4">
                  <img src={imageUrl} alt="Theatre preview" className="w-full h-32 object-cover rounded-md border" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-[0.8rem] text-muted-foreground">Upload a photo of the theatre building or interior (optional)</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Theatre' : 'Add Theatre'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
