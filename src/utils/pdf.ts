import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Event } from '../types';

export const generatePDF = (events: Event[], startDate: Date, endDate: Date) => {
  const doc = new jsPDF();
  const title = `Events from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`;

  doc.setFontSize(20);
  doc.text(title, 20, 20);

  doc.setFontSize(12);
  let y = 40;

  events.forEach((event) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.text(`${format(event.date, 'PPP')}`, 20, y);
    doc.text(`${event.title}`, 80, y);
    
    y += 7;
    
    if (event.description) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${event.description}`, 80, y);
      doc.setFontSize(12);
      y += 7;
    }

    y += 5;
  });

  doc.save(`calendar-events-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};