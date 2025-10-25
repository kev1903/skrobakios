# Invoice Format Standard

## Overview
This document defines the standard invoice format used across the entire Skrobaki platform. All invoice pages (create, edit, view, print, PDF) must follow this format for consistency.

## Layout Structure

### Header Section
The invoice header is divided into 3 columns:

#### Left Column - TAX INVOICE & Bill To
- **TAX INVOICE** title (bold, 3xl font)
- Blue underline accent (h-0.5, w-20, bg-blue-600)
- "BILL TO" label (uppercase, gray-600, xs font)
- Client Name (bold)
- Client Address (multi-line, gray-700, xs font)

#### Middle Column - Company Logo & Details
- Company logo (centered, h-12)
- Company name: **SKROBAKI Pty Ltd** (bold)
- Address (xs font, gray-600):
  ```
  Unit A11/2A Westall Rd
  Clayton VIC 3168
  Australia
  ```
- ABN: 49 032 355 809

#### Right Column - Invoice Details Box
Background: gray-50, padding: 4, rounded border
Contains:
- **Invoice Number**: INV-XXXX (bold)
- **Invoice Date**: 25 Oct 2025 (format: DD MMM YYYY)
- **Due Date**: 24 Nov 2025 (format: DD MMM YYYY)
- **Reference**: Stage X | Description - XX% ($XX,XXX)

### Form Sections (Create/Edit Only)

#### Invoice Details Section (Left)
- Invoice Number (text input)
- Invoice Date (date picker)
- Due Date (date picker)
- Client Name (text input)
- Client Address (textarea, 3 rows)

#### Contract Details Section (Right)
- **Contract** dropdown (selects from project_contracts)
- **Reference** dropdown (selects from payment stages)
- **Payment Structure Table**:
  
  | Column | Alignment | Description |
  |--------|-----------|-------------|
  | STAGES | Left | Stage name (e.g., "Deposit", "Stage 5") |
  | DESCRIPTION | Left | Stage description (e.g., "Contract Stage", "Start of Base Stage") |
  | % | Center | Percentage of total (e.g., 5, 10, 20) |
  | AMOUNT (AUD) | Right | Dollar amount formatted as $X,XXX |

### Payment Structure Table Styling
```tsx
<table className="w-full text-xs">
  <thead>
    <tr className="bg-gray-50 border-b border-gray-200">
      <th className="text-left p-2 font-medium text-gray-700">STAGES</th>
      <th className="text-left p-2 font-medium text-gray-700">DESCRIPTION</th>
      <th className="text-center p-2 font-medium text-gray-700">%</th>
      <th className="text-right p-2 font-medium text-gray-700">AMOUNT (AUD)</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 hover:bg-gray-25">
      <td className="p-2 text-gray-700 font-medium">{stage}</td>
      <td className="p-2 text-gray-600">{description}</td>
      <td className="p-2 text-center text-gray-700">{percentage}</td>
      <td className="p-2 text-right text-gray-700 font-medium">
        ${amount.toLocaleString('en-AU')}
      </td>
    </tr>
  </tbody>
</table>
```

## Color Scheme
- Primary text: black (#000000)
- Secondary text: gray-700 (#374151)
- Muted text: gray-600 (#4B5563)
- Accent: blue-600 (#2563EB)
- Borders: gray-200 (#E5E7EB)
- Background accents: gray-50 (#F9FAFB)

## Action Buttons (Create/Edit Pages)
Located in top-right header:
1. **Save** - Green (bg-green-600 hover:bg-green-700)
2. **Download PDF** - Outline variant
3. **Send Invoice** - Primary blue

## Date Format
All dates displayed as: **DD MMM YYYY**
Example: 25 Oct 2025

## Currency Format
All amounts displayed as: **$X,XXX.XX** (Australian format)
- Use `toLocaleString('en-AU')` for formatting
- Always show 2 decimal places for totals
- No decimal places in Payment Structure table

## Typography
- Headers: font-bold, font-semibold
- Labels: uppercase, tracking-wide, text-xs
- Body text: text-sm or text-xs depending on section
- Amounts: font-semibold or font-bold

## Responsive Behavior
- Desktop: 3-column header layout
- Mobile: Stack columns vertically
- Print: Optimize layout for A4 paper

## Files to Update
When making changes to invoice format, ensure these files are updated:
- `/src/components/invoices/InvoiceFormPage.tsx` - Create/Edit page
- `/src/components/project-cost/IncomeTable.tsx` - View popup
- Any invoice PDF generation components
- Invoice print stylesheets

## Reference Image
The standard format is based on the invoice layout provided in `user-uploads://image-822.png`

## Implementation Checklist
- [ ] TAX INVOICE header with blue accent line
- [ ] Three-column layout (Bill To | Company | Invoice Details)
- [ ] Invoice Details box with gray-50 background
- [ ] Payment Structure table with correct column headers
- [ ] Consistent date formatting (DD MMM YYYY)
- [ ] Consistent currency formatting ($X,XXX)
- [ ] Proper spacing and typography
- [ ] Print-friendly styling
- [ ] Mobile responsive layout
