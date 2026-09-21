import { PdfTemplate, Snippet } from '../types';

// NOTE: Each `code` field is a raw JavaScript string (NOT the result of
// JSON.stringify). This is intentional: pdfmake document definitions rely on
// function expressions for things like `footer(currentPage, pageCount)`,
// `header(...)`, and table `layout` callbacks (`hLineWidth`, `vLineWidth`,
// `hLineColor`, `fillColor`, `padding*`). JSON.stringify silently drops
// function-valued properties, which would strip every dynamic styling rule
// out of the loaded template. Using a plain string lets the runner's
// `safeParseDocDefinition` evaluator (which understands JS object literals)
// preserve all functions exactly as written.

const STARTER_CODE = `{
  "info": {
    "title": "PDFMake Starter Playground",
    "author": "Angular PDF Runner"
  },
  "pageSize": "A4",
  "pageMargins": [40, 60, 40, 60],
  "header": {
    "text": "PDFMake Live Playground • Angular Edition",
    "alignment": "right",
    "fontSize": 9,
    "color": "#94a3b8",
    "margin": [40, 20]
  },
  "footer": (currentPage, pageCount) => ({
    "text": "Page " + currentPage + " of " + pageCount,
    "alignment": "center",
    "fontSize": 9,
    "color": "#94a3b8",
    "margin": [0, 20]
  }),
  "content": [
    {
      "text": "PDFMake Code Runner",
      "style": "heroHeader"
    },
    {
      "text": "Instant real-time rendering in Angular with complete docDefinition support.",
      "style": "heroSub",
      "margin": [0, 0, 0, 24]
    },
    {
      "columns": [
        {
          "width": "*",
          "stack": [
            { "text": "Core Features", "style": "sectionTitle" },
            {
              "ul": [
                "Live debounced updates without UI lag",
                "Zero-overhead PDF buffer generation",
                "Full support for tables, columns, & vectors",
                "Download, print, or view natively"
              ],
              "color": "#334155",
              "lineHeight": 1.3
            }
          ]
        },
        {
          "width": "*",
          "stack": [
            { "text": "Quick Tips", "style": "sectionTitle" },
            {
              "ol": [
                "Edit the JSON on the left panel",
                "Press Format to organize syntax",
                "Insert snippets from the toolbar",
                "Export your document anytime"
              ],
              "color": "#334155",
              "lineHeight": 1.3
            }
          ]
        }
      ],
      "columnGap": 20,
      "margin": [0, 0, 0, 24]
    },
    { "text": "Sample Data Table", "style": "sectionTitle" },
    {
      "table": {
        "headerRows": 1,
        "widths": ["*", 120, 80, 80],
        "body": [
          [
            { "text": "Module Name", "style": "tableHeader" },
            { "text": "Component", "style": "tableHeader" },
            { "text": "Status", "style": "tableHeader" },
            { "text": "Latency", "style": "tableHeader", "alignment": "right" }
          ],
          ["Code Runner Engine", "Angular 19 Service", { "text": "Active", "color": "#16a34a", "bold": true }, { "text": "12ms", "alignment": "right" }],
          ["Live PDF Renderer", "pdfmake + vfs_fonts", { "text": "Active", "color": "#16a34a", "bold": true }, { "text": "24ms", "alignment": "right" }],
          ["Interactive Viewer", "Native Sandboxed Frame", { "text": "Ready", "color": "#2563eb", "bold": true }, { "text": "5ms", "alignment": "right" }],
          ["Syntax Validator", "JSON AST Parser", { "text": "Watching", "color": "#9333ea", "bold": true }, { "text": "1ms", "alignment": "right" }]
        ]
      },
      "layout": {
        "hLineWidth": (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
        "vLineWidth": () => 0,
        "hLineColor": (i) => (i === 1 ? "#0284c7" : "#e2e8f0"),
        "fillColor": (rowIndex) => (rowIndex === 0 ? "#f8fafc" : rowIndex % 2 === 0 ? "#f1f5f9" : null),
        "paddingLeft": () => 8,
        "paddingRight": () => 8,
        "paddingTop": () => 7,
        "paddingBottom": () => 7
      },
      "margin": [0, 0, 0, 20]
    }
  ],
  "styles": {
    "heroHeader": {
      "fontSize": 24,
      "bold": true,
      "color": "#0f172a",
      "margin": [0, 0, 0, 4]
    },
    "heroSub": {
      "fontSize": 12,
      "color": "#64748b"
    },
    "sectionTitle": {
      "fontSize": 14,
      "bold": true,
      "color": "#0284c7",
      "margin": [0, 0, 0, 8]
    },
    "tableHeader": {
      "bold": true,
      "fontSize": 10,
      "color": "#0f172a",
      "fillColor": "#e0f2fe"
    }
  },
  "defaultStyle": {
    "font": "Roboto",
    "fontSize": 10,
    "color": "#334155"
  }
}`;

const INVOICE_CODE = `{
  "pageSize": "A4",
  "pageMargins": [40, 50, 40, 50],
  "content": [
    {
      "columns": [
        {
          "stack": [
            { "text": "ACME TECHNOLOGIES", "fontSize": 18, "bold": true, "color": "#0f172a" },
            { "text": "Cloud Infrastructure & Design Systems", "fontSize": 9, "color": "#64748b", "margin": [0, 2, 0, 0] },
            { "text": "742 Evergreen Terrace, Suite 400", "fontSize": 9, "color": "#64748b" },
            { "text": "billing@acmetechnologies.io", "fontSize": 9, "color": "#0284c7" }
          ]
        },
        {
          "stack": [
            { "text": "INVOICE", "fontSize": 24, "bold": true, "color": "#0284c7", "alignment": "right" },
            { "text": "Invoice #: INV-2026-0891", "fontSize": 10, "bold": true, "alignment": "right", "margin": [0, 4, 0, 0] },
            { "text": "Date: September 21, 2026", "fontSize": 9, "color": "#64748b", "alignment": "right" },
            { "text": "Due Date: October 05, 2026", "fontSize": 9, "color": "#dc2626", "alignment": "right" }
          ]
        }
      ],
      "margin": [0, 0, 0, 30]
    },
    {
      "canvas": [{ "type": "line", "x1": 0, "y1": 0, "x2": 515, "y2": 0, "lineWidth": 1.5, "lineColor": "#e2e8f0" }],
      "margin": [0, 0, 0, 20]
    },
    {
      "columns": [
        {
          "width": "*",
          "stack": [
            { "text": "Billed To:", "fontSize": 10, "bold": true, "color": "#64748b", "margin": [0, 0, 0, 4] },
            { "text": "Horizon Global Ventures", "fontSize": 11, "bold": true, "color": "#0f172a" },
            { "text": "Attention: Financial Operations", "fontSize": 9, "color": "#475569" },
            { "text": "100 Montgomery St, Floor 22", "fontSize": 9, "color": "#475569" },
            { "text": "San Francisco, CA 94104", "fontSize": 9, "color": "#475569" }
          ]
        },
        {
          "width": 180,
          "stack": [
            { "text": "Payment Method:", "fontSize": 10, "bold": true, "color": "#64748b", "margin": [0, 0, 0, 4] },
            { "text": "Bank Wire Transfer (ACH)", "fontSize": 9, "color": "#0f172a", "bold": true },
            { "text": "Routing: 121000358", "fontSize": 9, "color": "#475569" },
            { "text": "Account: ****-****-9821", "fontSize": 9, "color": "#475569" },
            { "text": "Status: PENDING", "fontSize": 9, "bold": true, "color": "#ea580c" }
          ]
        }
      ],
      "margin": [0, 0, 0, 24]
    },
    {
      "table": {
        "headerRows": 1,
        "widths": ["*", 60, 80, 80],
        "body": [
          [
            { "text": "Description & Scope", "style": "th" },
            { "text": "Qty", "style": "th", "alignment": "center" },
            { "text": "Unit Rate", "style": "th", "alignment": "right" },
            { "text": "Amount", "style": "th", "alignment": "right" }
          ],
          ["High-Performance PDF Generation Engine Architecture", { "text": "40 hrs", "alignment": "center" }, { "text": "$150.00", "alignment": "right" }, { "text": "$6,000.00", "alignment": "right", "bold": true }],
          ["Angular Real-Time Code Runner & Instant Preview Integration", { "text": "35 hrs", "alignment": "center" }, { "text": "$150.00", "alignment": "right" }, { "text": "$5,250.00", "alignment": "right", "bold": true }],
          ["Monaco & CodeMirror Precision Syntax Validation Layer", { "text": "15 hrs", "alignment": "center" }, { "text": "$150.00", "alignment": "right" }, { "text": "$2,250.00", "alignment": "right", "bold": true }],
          ["Security Auditing & Sandboxed Iframe Blob Handler", { "text": "10 hrs", "alignment": "center" }, { "text": "$150.00", "alignment": "right" }, { "text": "$1,500.00", "alignment": "right", "bold": true }]
        ]
      },
      "layout": {
        "hLineWidth": (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
        "vLineWidth": () => 0,
        "hLineColor": (i) => (i === 1 ? "#0284c7" : "#e2e8f0"),
        "paddingTop": () => 8,
        "paddingBottom": () => 8
      },
      "margin": [0, 0, 0, 20]
    },
    {
      "columns": [
        { "width": "*", "text": "" },
        {
          "width": 220,
          "table": {
            "widths": ["*", 80],
            "body": [
              [{ "text": "Subtotal:", "color": "#64748b" }, { "text": "$15,000.00", "alignment": "right" }],
              [{ "text": "Sales Tax (0% Exempt):", "color": "#64748b" }, { "text": "$0.00", "alignment": "right" }],
              [{ "text": "Total Due (USD):", "bold": true, "fontSize": 12, "color": "#0f172a" }, { "text": "$15,000.00", "bold": true, "fontSize": 12, "color": "#0284c7", "alignment": "right" }]
            ]
          },
          "layout": "noBorders"
        }
      ],
      "margin": [0, 0, 0, 30]
    },
    {
      "stack": [
        { "text": "Terms & Conditions", "fontSize": 10, "bold": true, "color": "#0f172a", "margin": [0, 0, 0, 4] },
        { "text": "Payment is due within 14 calendar days of receipt. Please include the invoice number on your remittance advice. Thank you for your business!", "fontSize": 8, "color": "#64748b", "lineHeight": 1.4 }
      ]
    }
  ],
  "styles": {
    "th": {
      "bold": true,
      "fontSize": 9,
      "color": "#0f172a",
      "fillColor": "#f1f5f9"
    }
  },
  "defaultStyle": {
    "font": "Roboto",
    "fontSize": 9,
    "color": "#334155"
  }
}`;

const RESUME_CODE = `{
  "pageSize": "A4",
  "pageMargins": [36, 40, 36, 40],
  "content": [
    {
      "columns": [
        {
          "width": "*",
          "stack": [
            { "text": "ALEXANDER CHEN", "fontSize": 22, "bold": true, "color": "#0f172a" },
            { "text": "Lead Frontend Systems Architect • Angular & TypeScript", "fontSize": 11, "bold": true, "color": "#0284c7", "margin": [0, 2, 0, 6] },
            { "text": "alex.chen@devmail.org • (415) 890-3412 • San Francisco, CA • github.com/alexchen", "fontSize": 8, "color": "#64748b" }
          ]
        }
      ],
      "margin": [0, 0, 0, 16]
    },
    {
      "canvas": [{ "type": "line", "x1": 0, "y1": 0, "x2": 523, "y2": 0, "lineWidth": 1, "lineColor": "#cbd5e1" }],
      "margin": [0, 0, 0, 16]
    },
    {
      "columns": [
        {
          "width": 160,
          "stack": [
            { "text": "CORE EXPERTISE", "style": "sidebarHeading" },
            {
              "ul": [
                "Angular 18/19 Standalone",
                "TypeScript & Reactive RxJS",
                "Client-side PDF & Blob Pipeline",
                "Vite Plugin Architecture",
                "Tailwind & Design Systems",
                "Web Workers & Off-thread IO"
              ],
              "fontSize": 8,
              "lineHeight": 1.35,
              "color": "#334155",
              "margin": [0, 0, 0, 14]
            },
            { "text": "EDUCATION", "style": "sidebarHeading" },
            { "text": "B.S. in Computer Science", "bold": true, "fontSize": 8, "color": "#0f172a" },
            { "text": "UC Berkeley, 2018 - 2022", "fontSize": 8, "color": "#64748b", "margin": [0, 1, 0, 14] },
            { "text": "AWARDS & CERTS", "style": "sidebarHeading" },
            { "text": "Google Developer Expert (Web)", "fontSize": 8, "bold": true, "color": "#0f172a" },
            { "text": "Recognized for web tooling innovation", "fontSize": 7.5, "color": "#64748b" }
          ]
        },
        {
          "width": "*",
          "stack": [
            { "text": "PROFESSIONAL EXPERIENCE", "style": "mainHeading" },
            {
              "stack": [
                {
                  "columns": [
                    { "text": "Senior Staff Engineer — Cloud UI Systems", "bold": true, "fontSize": 10, "color": "#0f172a" },
                    { "text": "2023 — Present", "fontSize": 8, "color": "#64748b", "alignment": "right" }
                  ]
                },
                { "text": "NextWave Cloud Infrastructure • San Francisco, CA", "fontSize": 8.5, "color": "#0284c7", "margin": [0, 1, 0, 4] },
                {
                  "ul": [
                    "Spearheaded transition of document generation suite to Angular reactive components, reducing TTFB by 68%.",
                    "Authored in-browser PDF compilation engine handling 120,000+ daily exports with zero server compute costs.",
                    "Mentored 14 engineers across frontend architecture, testing paradigms, and accessibility compliance."
                  ],
                  "fontSize": 8,
                  "lineHeight": 1.3,
                  "color": "#475569",
                  "margin": [0, 0, 0, 12]
                }
              ]
            },
            {
              "stack": [
                {
                  "columns": [
                    { "text": "Frontend Software Engineer", "bold": true, "fontSize": 10, "color": "#0f172a" },
                    { "text": "2022 — 2023", "fontSize": 8, "color": "#64748b", "alignment": "right" }
                  ]
                },
                { "text": "Apex Analytics Platform • Mountain View, CA", "fontSize": 8.5, "color": "#0284c7", "margin": [0, 1, 0, 4] },
                {
                  "ul": [
                    "Engineered interactive code editor playground with debounced rendering and syntax tree linting.",
                    "Optimized memory lifecycle by enforcing strict blob URL revocation, preventing critical tab memory leaks."
                  ],
                  "fontSize": 8,
                  "lineHeight": 1.3,
                  "color": "#475569"
                }
              ]
            }
          ]
        }
      ],
      "columnGap": 20
    }
  ],
  "styles": {
    "sidebarHeading": {
      "fontSize": 9,
      "bold": true,
      "color": "#0284c7",
      "margin": [0, 0, 0, 6]
    },
    "mainHeading": {
      "fontSize": 10,
      "bold": true,
      "color": "#0f172a",
      "margin": [0, 0, 0, 8]
    }
  },
  "defaultStyle": {
    "font": "Roboto"
  }
}`;

const CONTRACT_CODE = `{
  "pageSize": "LETTER",
  "pageMargins": [50, 60, 50, 60],
  "content": [
    { "text": "MUTUAL NON-DISCLOSURE AGREEMENT", "fontSize": 16, "bold": true, "alignment": "center", "margin": [0, 0, 0, 6] },
    { "text": "Document ID: NDA-2026-CONF", "fontSize": 9, "color": "#64748b", "alignment": "center", "margin": [0, 0, 0, 24] },
    {
      "text": [
        "This Mutual Non-Disclosure Agreement (\\"Agreement\\") is made and entered into as of ",
        { "text": "September 21, 2026", "bold": true },
        ", by and between ",
        { "text": "TechVentures Corporation", "bold": true },
        " (\\"Disclosing Party\\"), and ",
        { "text": "Recipient Enterprises Inc.", "bold": true },
        " (\\"Receiving Party\\")."
      ],
      "fontSize": 9.5,
      "lineHeight": 1.4,
      "margin": [0, 0, 0, 14]
    },
    { "text": "1. Definition of Confidential Information", "fontSize": 11, "bold": true, "margin": [0, 8, 0, 4] },
    {
      "text": "For purposes of this Agreement, \\"Confidential Information\\" shall include all non-public information, software source code, architectural blueprints, trade secrets, business projections, and intellectual property disclosed by one party to the other, whether orally or in tangible writing.",
      "fontSize": 9,
      "lineHeight": 1.4,
      "color": "#334155",
      "margin": [0, 0, 0, 10]
    },
    { "text": "2. Standard of Care and Non-Disclosure", "fontSize": 11, "bold": true, "margin": [0, 8, 0, 4] },
    {
      "text": "The Receiving Party agrees to protect the Confidential Information using the same degree of care it uses for its own proprietary information of like nature, but no less than a reasonable standard of care, and shall not disclose Confidential Information to any third party without express prior written consent.",
      "fontSize": 9,
      "lineHeight": 1.4,
      "color": "#334155",
      "margin": [0, 0, 0, 10]
    },
    { "text": "3. Term & Governing Law", "fontSize": 11, "bold": true, "margin": [0, 8, 0, 4] },
    {
      "text": "This Agreement shall remain in effect for a period of three (3) years from the effective date. This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to conflicts of law principles.",
      "fontSize": 9,
      "lineHeight": 1.4,
      "color": "#334155",
      "margin": [0, 0, 0, 30]
    },
    {
      "columns": [
        {
          "width": "*",
          "stack": [
            { "text": "TECHVENTURES CORP:", "fontSize": 9, "bold": true },
            { "margin": [0, 24, 0, 0], "canvas": [{ "type": "line", "x1": 0, "y1": 0, "x2": 200, "y2": 0, "lineWidth": 1, "lineColor": "#94a3b8" }] },
            { "text": "Authorized Officer Signature", "fontSize": 8, "color": "#64748b", "margin": [0, 4, 0, 0] },
            { "text": "Name: Sarah Jenkins, Chief Counsel", "fontSize": 8, "color": "#334155" }
          ]
        },
        {
          "width": "*",
          "stack": [
            { "text": "RECIPIENT ENTERPRISES INC:", "fontSize": 9, "bold": true },
            { "margin": [0, 24, 0, 0], "canvas": [{ "type": "line", "x1": 0, "y1": 0, "x2": 200, "y2": 0, "lineWidth": 1, "lineColor": "#94a3b8" }] },
            { "text": "Authorized Officer Signature", "fontSize": 8, "color": "#64748b", "margin": [0, 4, 0, 0] },
            { "text": "Name: David K. Vance, CEO", "fontSize": 8, "color": "#334155" }
          ]
        }
      ]
    }
  ],
  "defaultStyle": {
    "font": "Roboto"
  }
}`;

const CERTIFICATE_CODE = `{
  "pageOrientation": "landscape",
  "pageSize": "A4",
  "pageMargins": [40, 40, 40, 40],
  "background": [
    {
      "canvas": [
        {
          "type": "rect",
          "x": 20,
          "y": 20,
          "w": 802,
          "h": 555,
          "lineWidth": 3,
          "lineColor": "#b45309"
        },
        {
          "type": "rect",
          "x": 26,
          "y": 26,
          "w": 790,
          "h": 543,
          "lineWidth": 1,
          "lineColor": "#f59e0b"
        }
      ]
    }
  ],
  "content": [
    { "text": "CERTIFICATE OF EXCELLENCE", "fontSize": 26, "bold": true, "color": "#92400e", "alignment": "center", "margin": [0, 60, 0, 6] },
    { "text": "THIS HONOR IS PROUDLY CONFERRED UPON", "fontSize": 10, "letterSpacing": 2, "color": "#78716c", "alignment": "center", "margin": [0, 0, 0, 20] },
    { "text": "JORDAN M. PATTERSON", "fontSize": 30, "bold": true, "color": "#1c1917", "alignment": "center", "margin": [0, 0, 0, 6] },
    {
      "canvas": [{ "type": "line", "x1": 220, "y1": 0, "x2": 540, "y2": 0, "lineWidth": 1.5, "lineColor": "#d97706" }],
      "margin": [0, 0, 0, 16]
    },
    {
      "text": "In recognition of outstanding craftsmanship and innovation in engineering real-time reactive PDF document pipelines with Angular and PDFMake.",
      "fontSize": 12,
      "alignment": "center",
      "color": "#44403c",
      "lineHeight": 1.4,
      "margin": [100, 0, 100, 40]
    },
    {
      "columns": [
        {
          "width": "*",
          "stack": [
            { "canvas": [{ "type": "line", "x1": 60, "y1": 0, "x2": 240, "y2": 0, "lineWidth": 1, "lineColor": "#a8a29e" }] },
            { "text": "DR. ELEANOR VOSS", "bold": true, "fontSize": 10, "color": "#1c1917", "alignment": "center", "margin": [0, 4, 0, 0] },
            { "text": "Dean of Software Systems", "fontSize": 8, "color": "#78716c", "alignment": "center" }
          ]
        },
        {
          "width": 140,
          "stack": [
            { "text": "★ SEAL ★", "fontSize": 12, "bold": true, "color": "#b45309", "alignment": "center" },
            { "text": "OFFICIAL RECORD", "fontSize": 7, "color": "#78716c", "alignment": "center" }
          ]
        },
        {
          "width": "*",
          "stack": [
            { "canvas": [{ "type": "line", "x1": 60, "y1": 0, "x2": 240, "y2": 0, "lineWidth": 1, "lineColor": "#a8a29e" }] },
            { "text": "MARCUS A. REED", "bold": true, "fontSize": 10, "color": "#1c1917", "alignment": "center", "margin": [0, 4, 0, 0] },
            { "text": "Director of Evaluation", "fontSize": 8, "color": "#78716c", "alignment": "center" }
          ]
        }
      ]
    }
  ],
  "defaultStyle": {
    "font": "Roboto"
  }
}`;

export const TEMPLATES: PdfTemplate[] = [
  {
    id: 'starter',
    title: 'Interactive Starter Guide',
    description: 'A clean introduction demonstrating headings, columns, styled tables, and margins.',
    category: 'General',
    icon: 'sparkles',
    code: STARTER_CODE
  },
  {
    id: 'invoice',
    title: 'Professional Commercial Invoice',
    description: 'Complete billing invoice with line items, tax calculations, invoice metadata, and total summary.',
    category: 'Finance',
    icon: 'receipt',
    code: INVOICE_CODE
  },
  {
    id: 'resume',
    title: 'Executive Resume / Curriculum Vitae',
    description: 'Modern two-column CV highlighting professional experience, tech stack, education, and achievements.',
    category: 'Business',
    icon: 'user',
    code: RESUME_CODE
  },
  {
    id: 'contract',
    title: 'Standard Non-Disclosure Agreement',
    description: 'Mutual non-disclosure legal document with defined parties, obligations, and signature execution block.',
    category: 'Legal',
    icon: 'file-text',
    code: CONTRACT_CODE
  },
  {
    id: 'certificate',
    title: 'Certificate of Achievement',
    description: 'Landscape decorative diploma / certificate with bordered perimeter and emblem styling.',
    category: 'Creative',
    icon: 'award',
    code: CERTIFICATE_CODE
  }
];

export const COMMON_SNIPPETS: Snippet[] = [
  {
    name: 'Formatted Table',
    category: 'Tables',
    description: 'Multi-column grid with custom headers, borders, and column widths.',
    snippet: `{\n  "table": {\n    "headerRows": 1,\n    "widths": ["*", 100, "auto"],\n    "body": [\n      [\n        { "text": "Item Name", "bold": true, "fillColor": "#e0f2fe" },\n        { "text": "Category", "bold": true, "fillColor": "#e0f2fe" },\n        { "text": "Price", "bold": true, "fillColor": "#e0f2fe", "alignment": "right" }\n      ],\n      ["Cloud Compute Node", "Infrastructure", "$240.00"],\n      ["Database Instance", "Storage", "$110.00"]\n    ]\n  },\n  "margin": [0, 10, 0, 10]\n}`
  },
  {
    name: 'Two Columns',
    category: 'Layout',
    description: 'Side-by-side flex columns with balanced widths and gap.',
    snippet: `{\n  "columns": [\n    {\n      "width": "*",\n      "text": "Left column content goes here with customized text styling."\n    },\n    {\n      "width": "*",\n      "text": "Right column content aligned alongside."\n    }\n  ],\n  "columnGap": 20,\n  "margin": [0, 10, 0, 10]\n}`
  },
  {
    name: 'Header & Footer with Page Numbers',
    category: 'Document',
    description: 'Dynamic page number function for running headers and footers.',
    snippet: `"header": {\n  "text": "Confidential Document",\n  "alignment": "right",\n  "fontSize": 9,\n  "color": "#94a3b8",\n  "margin": [40, 20]\n},\n"footer": (currentPage, pageCount) => ({\n  "text": "Page " + currentPage + " of " + pageCount,\n  "alignment": "center",\n  "fontSize": 9,\n  "color": "#94a3b8",\n  "margin": [0, 20]\n})`
  },
  {
    name: 'Watermark',
    category: 'Document',
    description: 'Faint diagonal watermark across every page.',
    snippet: `"watermark": {\n  "text": "CONFIDENTIAL",\n  "color": "#ef4444",\n  "opacity": 0.15,\n  "bold": true,\n  "fontSize": 52\n}`
  },
  {
    name: 'Horizontal Divider Line',
    category: 'Graphics',
    description: 'Vector horizontal rule with custom color and thickness.',
    snippet: `{\n  "canvas": [\n    { "type": "line", "x1": 0, "y1": 0, "x2": 515, "y2": 0, "lineWidth": 1, "lineColor": "#e2e8f0" }\n  ],\n  "margin": [0, 15, 0, 15]\n}`
  },
  {
    name: 'Numbered & Bulleted Lists',
    category: 'Typography',
    description: 'Unordered bullet list and ordered numbered list.',
    snippet: `{\n  "ul": [\n    "First bullet item with details",\n    "Second item with additional note",\n    { "text": "Highlighted point", "bold": true, "color": "#0284c7" }\n  ],\n  "margin": [0, 5, 0, 10]\n}`
  },
  {
    name: 'QR Code',
    category: 'Graphics',
    description: 'Vector QR Code generated directly inside the PDF.',
    snippet: `{\n  "qr": "https://ai.studio/build",\n  "fit": 100,\n  "alignment": "center",\n  "margin": [0, 10, 0, 10]\n}`
  }
];
