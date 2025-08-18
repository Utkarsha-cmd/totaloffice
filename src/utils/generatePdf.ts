import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote } from "@/types/quote";

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
  interface jsPDFOptions {
    autoTable?: (options: any) => jsPDF;
  }
}

// Initialize autoTable
(jsPDF as any).autoTable = autoTable;

export const generateQuotePdf = (quote: Quote) => {
  try {
    console.log('Starting PDF generation for quote:', quote.quoteNumber);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Add logo and header
  // doc.addImage(logo, 'PNG', margin, 10, 40, 20);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTE', pageWidth - margin - 20, 20, { align: 'right' });
  
  // Quote info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote #: ${quote.quoteNumber}`, margin, 30);
  doc.text(`Date: ${quote.date}`, margin, 36);
  doc.text(`Expiry: ${quote.expiryDate}`, margin, 42);
  doc.text(`Status: ${quote.status.toUpperCase()}`, margin, 48);
  
  // Customer info
  doc.text(quote.customerName, pageWidth - margin - 60, 30, { align: 'right' });
  doc.text(`Quote Prepared For:`, pageWidth - margin - 60, 36, { align: 'right' });
  
  // Line items table
  const tableColumn = ["Item", "Description", "Qty", "Unit Price", "Total"];
  const tableRows: any[] = [];
  
  quote.lineItems.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.description,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ];
    tableRows.push(itemData);
  });
  
  // Add summary rows
  tableRows.push([
    { content: '', colSpan: 3, styles: { fillColor: false, textColor: 0 } },
    { content: 'Subtotal:', styles: { fontStyle: 'bold', halign: 'right' } },
    { content: `$${quote.subtotal.toFixed(2)}`, styles: { halign: 'right' } }
  ]);
  
  tableRows.push([
    { content: '', colSpan: 3, styles: { fillColor: false, textColor: 0 } },
    { content: `Tax (${quote.taxRate}%):`, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: `$${quote.taxAmount.toFixed(2)}`, styles: { halign: 'right' } }
  ]);
  
  tableRows.push([
    { content: '', colSpan: 3, styles: { fillColor: false, textColor: 0 } },
    { content: 'Total:', styles: { fontStyle: 'bold', halign: 'right' } },
    { content: `$${quote.total.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } }
  ]);
  
  // Use autoTable directly
  autoTable(doc, {
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: margin, right: margin }
  });
  
  // Add terms and notes
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', margin, finalY);
  doc.setFont('helvetica', 'normal');
  const splitTerms = doc.splitTextToSize(quote.terms, pageWidth - (2 * margin));
  doc.text(splitTerms, margin, finalY + 6);
  
  if (quote.notes) {
    const notesY = finalY + 6 + (splitTerms.length * 6) + 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, notesY);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(quote.notes, pageWidth - (2 * margin));
    doc.text(splitNotes, margin, notesY + 6);
  }
  
    // Save the PDF
    const fileName = `Quote-${quote.quoteNumber}.pdf`;
    console.log('Saving PDF as:', fileName);
    doc.save(fileName);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error; // Re-throw to be caught by the error boundary
  }
};
