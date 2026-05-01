'use client';

import { useState } from 'react';
import { Settings2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Hall {
  _id: string;
  name: string;
  rows: number;
  cols: number;
  rowBreaks: number[];
  colBreaks: number[];
}

export function HallLayoutEditor({ hall, onUpdate }: { hall: Hall; onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rowBreaks, setRowBreaks] = useState<number[]>(hall.rowBreaks || []);
  const [colBreaks, setColBreaks] = useState<number[]>(hall.colBreaks || []);
  const [loading, setLoading] = useState(false);

  const toggleRowBreak = (index: number) => {
    setRowBreaks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const toggleColBreak = (index: number) => {
    setColBreaks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/halls/${hall._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowBreaks, colBreaks }),
      });

      if (!res.ok) throw new Error('Failed to update layout');

      toast.success('Layout updated successfully');
      onUpdate();
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          Edit Layout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Layout: {hall.name}</DialogTitle>
          <DialogDescription>
            Click the spaces between seats to add walking paths (aisles).
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 flex flex-col items-center overflow-auto">
          {/* Screen Indicator */}
          <div className="w-64 h-1.5 bg-muted-foreground/20 rounded-full mb-12 flex items-center justify-center relative">
            <div className="absolute -top-6 text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50">
              SCREEN
            </div>
            <div className="w-full h-full bg-primary/20 rounded-full blur-sm" />
          </div>

          <div className="inline-block p-4 border rounded-xl bg-muted/30">
            {Array.from({ length: hall.rows }).map((_, r) => (
              <div key={r}>
                <div className="flex items-center gap-1">
                  {/* Row Label */}
                  <div className="w-6 text-[10px] font-bold text-muted-foreground/40 uppercase">
                    {String.fromCharCode(65 + r)}
                  </div>
                  
                  {Array.from({ length: hall.cols }).map((_, c) => (
                    <div key={c} className="flex items-center">
                      <div className="size-6 rounded-sm bg-muted border border-border/50 flex items-center justify-center text-[8px] text-muted-foreground/50">
                        {c + 1}
                      </div>
                      
                      {/* Column Break Trigger */}
                      {c < hall.cols - 1 && (
                        <button
                          onClick={() => toggleColBreak(c + 1)}
                          className={cn(
                            "w-2 h-6 mx-0.5 rounded-full transition-all group relative",
                            colBreaks.includes(c + 1) ? "bg-primary/40" : "bg-transparent hover:bg-muted-foreground/10"
                          )}
                        >
                           <div className={cn(
                            "absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5",
                            colBreaks.includes(c + 1) ? "bg-primary" : "bg-transparent group-hover:bg-muted-foreground/30"
                          )} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Row Break Trigger */}
                {r < hall.rows - 1 && (
                  <button
                    onClick={() => toggleRowBreak(r + 1)}
                    className={cn(
                      "w-full h-2 my-0.5 rounded-full transition-all group relative",
                      rowBreaks.includes(r + 1) ? "bg-primary/40" : "bg-transparent hover:bg-muted-foreground/10"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5",
                      rowBreaks.includes(r + 1) ? "bg-primary" : "bg-transparent group-hover:bg-muted-foreground/30"
                    )} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
