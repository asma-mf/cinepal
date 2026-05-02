'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Search...' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (value === currentQ) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.set('page', '1');
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-4 text-muted-foreground" />
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10"
        placeholder={placeholder}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
          onClick={() => setValue('')}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
