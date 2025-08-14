import React from 'react';

const PDFExtractionDocs: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto bg-card print:bg-white print:shadow-none shadow-lg rounded-lg print:rounded-none p-8 print:p-8">
        {/* Header */}
        <div className="border-b border-border print:border-gray-300 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-foreground print:text-black mb-2">
            PDF Extraction System Documentation
          </h1>
          <p className="text-muted-foreground print:text-gray-600 text-lg">
            Technical overview of the automated contract document processing system
          </p>
          <p className="text-sm text-muted-foreground print:text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            System Overview
          </h2>
          <p className="text-foreground print:text-black leading-relaxed">
            The PDF extraction system automatically processes uploaded contract documents, 
            extracting structured data using AI-powered text analysis. The system supports 
            various document types including contracts, drawings, invoices, and specifications.
          </p>
        </section>

        {/* Process Flow */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            Process Flow
          </h2>
          
          <div className="space-y-6">
            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                File Upload
              </h3>
              <p className="text-foreground print:text-black ml-9">
                When a contract PDF is uploaded, it's stored in Supabase Storage and a record 
                is created in the <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">project_contracts</code> table.
              </p>
            </div>

            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Edge Function Trigger
              </h3>
              <p className="text-foreground print:text-black ml-9">
                The <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">extract_unified</code> edge function is called with:
              </p>
              <ul className="list-disc list-inside ml-12 mt-2 text-foreground print:text-black">
                <li>The signed URL to download the PDF</li>
                <li>The project contract ID for database updates</li>
              </ul>
            </div>

            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                PDF Text Extraction
              </h3>
              <p className="text-foreground print:text-black ml-9 mb-2">The function performs text extraction through:</p>
              <ul className="list-disc list-inside ml-12 text-foreground print:text-black">
                <li>Downloads the PDF file as binary data</li>
                <li>Uses the <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">pdf_parse</code> library to extract raw text content</li>
                <li>Falls back to basic pattern matching if the library fails</li>
              </ul>
            </div>

            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</span>
                AI Analysis
              </h3>
              <p className="text-foreground print:text-black ml-9 mb-2">
                The extracted text is sent to OpenAI's <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">gpt-4o-mini</code> model with structured prompts to:
              </p>
              <ul className="list-disc list-inside ml-12 text-foreground print:text-black">
                <li>Identify document type (contract, drawing, invoice, spec, other)</li>
                <li>Generate a comprehensive summary</li>
                <li>Provide confidence level (0-1 scale)</li>
                <li>Extract structured data based on document type</li>
              </ul>
            </div>

            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">5</span>
                Data Storage
              </h3>
              <p className="text-foreground print:text-black ml-9 mb-2">
                The AI response is parsed and stored in the <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">project_contracts</code> table:
              </p>
              <ul className="list-disc list-inside ml-12 text-foreground print:text-black">
                <li><code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">ai_summary_json</code>: The summary text</li>
                <li><code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">confidence</code>: Confidence score</li>
                <li><code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">contract_data</code>: Full structured JSON with all extracted fields</li>
              </ul>
            </div>

            <div className="bg-accent/50 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-2 flex items-center">
                <span className="bg-primary print:bg-blue-600 text-primary-foreground print:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">6</span>
                UI Update
              </h3>
              <p className="text-foreground print:text-black ml-9">
                The frontend refreshes and displays the extracted information with proper formatting 
                (e.g., converting 0.85 confidence to "85%").
              </p>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            Technical Implementation
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-accent/30 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-3">Backend Components</h3>
              <ul className="space-y-2 text-foreground print:text-black">
                <li><strong>Supabase Storage:</strong> File storage and management</li>
                <li><strong>Edge Functions:</strong> <code className="bg-muted print:bg-gray-200 px-2 py-1 rounded text-sm">extract_unified</code></li>
                <li><strong>Database:</strong> PostgreSQL with RLS policies</li>
                <li><strong>AI Service:</strong> OpenAI GPT-4o-mini</li>
              </ul>
            </div>

            <div className="bg-accent/30 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
              <h3 className="text-lg font-medium text-foreground print:text-black mb-3">Key Features</h3>
              <ul className="space-y-2 text-foreground print:text-black">
                <li><strong>Structured Output:</strong> JSON schema validation</li>
                <li><strong>Multi-format Support:</strong> Various document types</li>
                <li><strong>Confidence Scoring:</strong> Reliability assessment</li>
                <li><strong>Real-time Updates:</strong> Immediate UI refresh</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Document Types */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            Supported Document Types
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'Contract', fields: ['Title', 'Parties', 'Dates', 'Value', 'Terms'] },
              { type: 'Drawing', fields: ['Number', 'Revision', 'Project', 'Client', 'Scale'] },
              { type: 'Invoice', fields: ['Number', 'Date', 'Vendor', 'Total', 'Line Items'] },
              { type: 'Specification', fields: ['Title', 'Requirements', 'Standards', 'Materials'] }
            ].map((doc) => (
              <div key={doc.type} className="bg-accent/30 print:bg-gray-50 p-4 rounded-lg print:rounded border print:border-gray-200">
                <h3 className="font-medium text-foreground print:text-black mb-2">{doc.type}</h3>
                <ul className="text-sm text-muted-foreground print:text-gray-600 space-y-1">
                  {doc.fields.map((field) => (
                    <li key={field}>• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* System Architecture */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            System Architecture
          </h2>
          
          <div className="bg-accent/20 print:bg-gray-50 p-6 rounded-lg print:rounded border print:border-gray-200">
            <div className="text-center text-foreground print:text-black">
              <div className="font-mono text-sm leading-relaxed">
                <div>Frontend (React) → Supabase Storage → Edge Function</div>
                <div className="my-2">↓</div>
                <div>PDF Download → Text Extraction → OpenAI API</div>
                <div className="my-2">↓</div>
                <div>Structured Analysis → Database Update → UI Refresh</div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground print:text-black mb-4 border-l-4 border-primary print:border-blue-600 pl-4">
            Error Handling & Fallbacks
          </h2>
          
          <div className="space-y-4">
            <div className="bg-amber-50 print:bg-yellow-50 border border-amber-200 print:border-yellow-200 p-4 rounded-lg print:rounded">
              <h3 className="font-medium text-amber-800 print:text-yellow-800 mb-2">PDF Extraction Failures</h3>
              <p className="text-amber-700 print:text-yellow-700 text-sm">
                If the pdf_parse library fails, the system falls back to basic pattern matching 
                to extract readable text between PDF text markers.
              </p>
            </div>
            
            <div className="bg-blue-50 print:bg-blue-50 border border-blue-200 print:border-blue-200 p-4 rounded-lg print:rounded">
              <h3 className="font-medium text-blue-800 print:text-blue-800 mb-2">AI Processing Errors</h3>
              <p className="text-blue-700 print:text-blue-700 text-sm">
                OpenAI API errors are caught and logged. The system uses structured output 
                with JSON schema validation to ensure consistent response format.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border print:border-gray-300 pt-6 mt-12">
          <p className="text-sm text-muted-foreground print:text-gray-500 text-center">
            This documentation was generated automatically. 
            For technical support or questions, contact the development team.
          </p>
        </footer>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:page-break-before {
            page-break-before: always;
          }
          
          .print\\:page-break-after {
            page-break-after: always;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFExtractionDocs;