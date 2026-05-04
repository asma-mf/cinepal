'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Seat {
  row: string;
  col: number;
  type: string;
  status: string;
}

interface Showtime {
  _id: string;
  date: string;
  startTime: string;
  format: string;
  price: number;
  movieId: { title: string };
  seats?: Seat[];
  hallId?: {
    rows: number;
    cols: number;
    rowBreaks: number[];
    colBreaks: number[];
  };
}

const SEAT_COLORS: Record<string, string> = {
  available: 'bg-[#2A2A2A] hover:bg-[#3A3A3A]',
  hold: 'bg-amber-500 hover:bg-amber-600',
  booked: 'bg-red-900 opacity-80 cursor-not-allowed',
};

const SEAT_BORDERS: Record<string, string> = {
  available: 'border-[#3A3A3A]',
  hold: 'border-amber-600',
  booked: 'border-red-950',
};

export function HallShowtimeViewer({ hallId }: { hallId: string }) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');
  const [selectedShowtimeData, setSelectedShowtimeData] = useState<Showtime | null>(null);
  const [loading, setLoading] = useState(false);
  const [seatLoading, setSeatLoading] = useState(false);

  useEffect(() => {
    async function fetchShowtimes() {
      setLoading(true);
      try {
        // Fetch all showtimes for this hall
        const res = await fetch(`/api/proxy/showtimes?hallId=${hallId}&status=all&limit=500`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.data || [];
          setShowtimes(items);
        }
      } catch (err) {
        console.error('Failed to fetch showtimes', err);
      } finally {
        setLoading(false);
      }
    }
    fetchShowtimes();
  }, [hallId]);

  useEffect(() => {
    async function fetchShowtimeDetails() {
      if (!selectedShowtimeId) {
        setSelectedShowtimeData(null);
        return;
      }
      setSeatLoading(true);
      try {
        const res = await fetch(`/api/proxy/showtimes/${selectedShowtimeId}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedShowtimeData(data);
        }
      } catch (err) {
        toast.error('Failed to load seat map');
      } finally {
        setSeatLoading(false);
      }
    }
    fetchShowtimeDetails();
  }, [selectedShowtimeId]);

  const toggleSeat = async (seat: Seat) => {
    if (seat.status === 'booked') {
      toast.error('Cannot modify a booked seat');
      return;
    }
    
    const newStatus = seat.status === 'available' ? 'hold' : 'available';
    
    // Optimistic update
    setSelectedShowtimeData(prev => {
      if (!prev || !prev.seats) return prev;
      return {
        ...prev,
        seats: prev.seats.map(s => 
          (s.row === seat.row && s.col === seat.col) ? { ...s, status: newStatus } : s
        )
      };
    });

    try {
      const res = await fetch(`/api/proxy/showtimes/${selectedShowtimeId}/seat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: seat.row, col: seat.col, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update seat');
      toast.success(`Seat ${seat.row}${seat.col} marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
      // Revert on failure
      const revertedStatus = seat.status;
      setSelectedShowtimeData(prev => {
        if (!prev || !prev.seats) return prev;
        return {
          ...prev,
          seats: prev.seats.map(s => 
            (s.row === seat.row && s.col === seat.col) ? { ...s, status: revertedStatus } : s
          )
        };
      });
    }
  };

  const rows = useMemo(() => {
    if (!selectedShowtimeData?.seats) return {};
    const r: Record<string, Seat[]> = {};
    selectedShowtimeData.seats.forEach((seat) => {
      if (!r[seat.row]) r[seat.row] = [];
      r[seat.row].push(seat);
    });
    return r;
  }, [selectedShowtimeData]);

  const sortedRowKeys = useMemo(() => Object.keys(rows).sort(), [rows]);
  const hallInfo = selectedShowtimeData?.hallId;

  const groupedShowtimes = useMemo(() => {
    const past: Showtime[] = [];
    const today: Showtime[] = [];
    const upcoming: Showtime[] = [];
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    showtimes.forEach(st => {
      const stDate = new Date(st.date);
      if (stDate < startOfToday) {
        past.push(st);
      } else if (stDate > endOfToday) {
        upcoming.push(st);
      } else {
        today.push(st);
      }
    });

    // Sort past in descending order (most recent first)
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { past, today, upcoming };
  }, [showtimes]);

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading showtimes...</div>;
  }

  if (showtimes.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No showtimes scheduled for this hall yet.</div>;
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Select value={selectedShowtimeId} onValueChange={setSelectedShowtimeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a showtime to view seats" />
            </SelectTrigger>
            <SelectContent>
              {groupedShowtimes.today.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-primary">Today</SelectLabel>
                  {groupedShowtimes.today.map((st) => (
                    <SelectItem key={st._id} value={st._id}>
                      {st.startTime} - {st.movieId?.title} ({st.format})
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {groupedShowtimes.upcoming.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Upcoming</SelectLabel>
                  {groupedShowtimes.upcoming.map((st) => (
                    <SelectItem key={st._id} value={st._id}>
                      {new Date(st.date).toLocaleDateString()} {st.startTime} - {st.movieId?.title} ({st.format})
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {groupedShowtimes.past.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground">Past</SelectLabel>
                  {groupedShowtimes.past.map((st) => (
                    <SelectItem key={st._id} value={st._id} className="text-muted-foreground opacity-70">
                      {new Date(st.date).toLocaleDateString()} {st.startTime} - {st.movieId?.title} ({st.format})
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {seatLoading && (
        <div className="p-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedShowtimeData && !seatLoading && hallInfo && (
        <Card className="bg-[#111] border-[#333] overflow-hidden">
          <CardContent className="p-6 overflow-x-auto">
            <div className="min-w-max pb-8">
              {/* Screen Indicator */}
              <div className="flex flex-col items-center mb-12">
                <div className="w-[80%] h-4 border-t-4 border-[#ffffff40] rounded-[50%] opacity-50" style={{ transform: 'scaleY(4)' }} />
                <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground mt-4">SCREEN</span>
              </div>

              {/* Seat Grid */}
              <div className="flex flex-col gap-1 items-center">
                {sortedRowKeys.map((rowKey, rowIndex) => {
                  const midCol = hallInfo.cols / 2;
                  // Calculate curve offset for the row letter (aligns with first seat, colIndex 0)
                  const firstSeatDist = 0 + 0.5 - midCol;
                  const letterCurveOffset = Math.pow(firstSeatDist, 2) * 0.35;

                  return (
                    <div key={rowKey} className={`flex items-center ${hallInfo.rowBreaks?.includes(rowIndex + 1) ? 'mb-6' : ''}`}>
                      <span 
                        className="w-6 text-xs font-bold text-muted-foreground text-center mr-2"
                        style={{ transform: `translateY(${-letterCurveOffset}px)` }}
                      >
                        {rowKey}
                      </span>
                      <div className="flex">
                      {rows[rowKey]
                        .sort((a, b) => a.col - b.col)
                        .map((seat, colIndex) => {
                          const state = seat.status || 'available';
                          
                          // Curve Calculation (visual effect)
                          const midCol = hallInfo.cols / 2;
                          const distFromCenter = colIndex + 0.5 - midCol;
                          const curveOffset = Math.pow(distFromCenter, 2) * 0.35; // PX curve intensity

                          return (
                            <div key={`${seat.row}${seat.col}`} className="flex">
                              <button
                                onClick={() => toggleSeat(seat)}
                                disabled={state === 'booked'}
                                style={{ transform: `translateY(${-curveOffset}px)` }}
                                className={`
                                  w-7 h-7 rounded-md m-[2px] flex items-center justify-center border transition-all text-[9px] font-bold
                                  ${SEAT_COLORS[state]} ${SEAT_BORDERS[state]}
                                  ${state === 'booked' ? 'text-transparent' : 'text-[#AEAEAE] hover:text-white'}
                                `}
                                title={`${seat.row}${seat.col} - ${state}`}
                              >
                                {seat.col}
                              </button>
                              {hallInfo.colBreaks?.includes(colIndex + 1) && <div className="w-6" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-12 pt-6 border-t border-[#333]">
                {[
                  { label: 'Available', class: 'bg-[#2A2A2A] border-[#3A3A3A]' },
                  { label: 'Hold (Unavailable)', class: 'bg-amber-500 border-amber-600' },
                  { label: 'Booked', class: 'bg-red-900 opacity-80 border-red-950' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-[3px] border ${item.class}`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
