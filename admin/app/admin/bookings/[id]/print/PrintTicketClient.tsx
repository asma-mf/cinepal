'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Loader2, Download, Printer } from 'lucide-react';

export default function PrintTicketClient({ booking }: { booking: any }) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  const ticketId = booking._id?.slice(-8).toUpperCase() || 'ID';
  const filename = `Ticket_CinePal_${ticketId}.pdf`;

  const generatePDF = async (autoDownload = false) => {
    if (!ticketRef.current || generating) return;
    
    setGenerating(true);
    setStatus('Capturing ticket...');
    
    try {
      // Small delay to ensure all images/QR are fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const element = ticketRef.current;
      
      // Using html-to-image which is much more robust for modern CSS (oklch, lab, etc.)
      const imgData = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      
      setStatus('Generating PDF...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Center vertically if it's much shorter than A4
      const yPos = pdfHeight < 297 ? (297 - pdfHeight) / 2 : 0;
      
      pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, pdfHeight);
      
      if (autoDownload) {
        pdf.save(filename);
      } else {
        pdf.save(filename);
      }
      setStatus('Done!');
    } catch (err) {
      console.error('PDF Generation failed:', err);
      setStatus('Error generating PDF');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    // Auto-generate on load
    const timer = setTimeout(() => {
      generatePDF(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const theatre = showtime?.theatreId;
  const hall = showtime?.hallId;

  const dateStr = showtime?.date 
    ? new Date(showtime.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }) 
    : 'N/A';
    
  const seatList = booking.seats?.map((s: any) => `${s.row}${s.col}`).join(', ') || 'N/A';

  return (
    <div className="min-h-screen bg-gray-100 text-black p-4 md:p-8 flex flex-col items-center">
      
      {/* Control Panel */}
      <div className="mb-8 flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm font-medium text-gray-600">{status}</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => generatePDF(true)} 
            disabled={generating}
            className="bg-[#E50914] hover:bg-red-700 text-white px-8 shadow-lg transition-all active:scale-95"
          >
            {generating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {generating ? 'Processing...' : 'Download PDF Ticket'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="border-gray-300 text-gray-400"
          >
            <Printer className="mr-2 h-5 w-5 text-gray-400" />
            Browser Print
          </Button>
        </div>
      </div>

      {/* The Ticket Container - Captured via html-to-image */}
      <div 
        ref={ticketRef}
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
        className="ticket-container max-w-2xl w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 relative shadow-2xl mb-12"
      >
        {/* Header */}
        <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
          <img src="/cinepal.png" alt="Logo" style={{ width: '150px', height: 'auto', margin: '0 auto' }} />
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Movie Poster & QR */}
          <div className="flex flex-col items-center gap-8 shrink-0">
            {movie?.posterUrl ? (
              <img 
                src={movie.posterUrl} 
                alt="Poster" 
                crossOrigin="anonymous"
                style={{ width: '224px', height: '320px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #f3f4f6' }}
              />
            ) : (
              <div style={{ width: '224px', height: '320px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#d1d5db', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Poster</span>
              </div>
            )}
            
            <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #f9fafb' }}>
              <QRCode value={booking._id} size={150} />
            </div>
            <div className="text-center">
              <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Booking Reference</p>
              <p style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '900', color: '#1f2937' }}>{booking._id.slice(-12).toUpperCase()}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <p style={{ fontSize: '10px', color: '#E50914', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Now Playing</p>
              <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#000000', textTransform: 'uppercase', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                {movie?.title || 'Unknown Movie'}
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Location</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{theatre?.name || 'N/A'}</p>
                {theatre?.location && <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{theatre.location}</p>}
              </div>

              <div className="flex gap-16">
                <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Date</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{dateStr}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Time</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{showtime?.startTime || 'N/A'}</p>
                </div>
              </div>

              <div style={{ paddingTop: '32px', borderTop: '2px solid #f3f4f6', marginTop: '8px', display: 'flex', gap: '64px' }}>
                <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Screen / Hall</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: '#111827' }}>{hall?.name || 'N/A'} • {showtime?.format || '2D'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Confirmed Seats</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: '#E50914' }}>{seatList}</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px dashed #f3f4f6', fontSize: '9px', color: '#9ca3af', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.3em', lineHeight: '1.6' }}>
              Scan QR code at entrance • No entry after show starts
              <br />
              Generated by CinePal Admin Portal
            </div>
          </div>
        </div>

        {/* Decorative Ticket Notches */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-100 rounded-full shadow-inner" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-100 rounded-full shadow-inner" />
      </div>
    </div>
  );
}
