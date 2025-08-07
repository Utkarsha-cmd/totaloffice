// components/AgreementReviewSection.tsx
import React, { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  customer: any;
}

const AgreementReviewSection: React.FC<Props> = ({ customer }) => {
  const [pageCount, setPageCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleSubmit = () => {
    const sigImage = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    const doc = new jsPDF();

    // Add title and details
    doc.setFontSize(16);
    doc.text('Signed Infinity Agreement', 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${customer?.firstName} ${customer?.lastName}`, 20, 40);
    doc.text(`Email: ${customer?.email}`, 20, 48);
    doc.text(`Phone: ${customer?.phone}`, 20, 56);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 64);

    // Add signature image
    if (sigImage) {
      doc.text('Signature:', 20, 80);
      doc.addImage(sigImage, 'PNG', 20, 85, 100, 40);
    }

    doc.save('Signed_Agreement.pdf');
    setSubmitted(true);
  };

  return (
    <div className="mt-12 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Infinity Agreement</h2>

      {/* PDF Preview */}
      <div className="border p-4 max-h-[500px] overflow-y-scroll mb-4">
        <Document
          file="/Infinity Agreement.pdf"
          onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        >
          {Array.from({ length: pageCount }, (_, i) => (
            <Page key={i} pageNumber={i + 1} width={600} />
          ))}
        </Document>
      </div>

      {/* Signature Pad */}
      <div className="mb-4">
        <p className="mb-2 font-medium">Sign Below:</p>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{ className: 'border border-gray-400 rounded w-full h-32' }}
        />
        <button
          className="mt-2 text-sm text-blue-600 hover:underline"
          onClick={() => sigCanvas.current?.clear()}
        >
          Clear Signature
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Submit & Download Agreement
      </button>

      {submitted && (
        <div className="mt-4 text-green-700 font-semibold">Agreement signed and downloaded!</div>
      )}
    </div>
  );
};

export default AgreementReviewSection;
