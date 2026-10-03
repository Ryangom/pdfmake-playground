import { PdfTemplate, Snippet } from '../types';

export const JSON_RUNNER_CODE = `{
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
  "footer": {
    "text": "PDFMake Live Playground • Angular Edition",
    "alignment": "center",
    "fontSize": 9,
    "color": "#94a3b8",
    "margin": [0, 20]
  },
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

export const JS_RUNNER_CODE = `// PDFMake JavaScript Mode
// Define helper functions, loops, and dynamic calculations!

function verticalHeader(label, height = 200) {
  return {
    svg: \`
      <svg width="24" height="\${height}">
        <text x="15" y="\${height / 2}"
              text-anchor="middle"
              font-size="10"
              font-family="Roboto"
              font-weight="bold"
              transform="rotate(-90 15 \${height / 2})">
          \${label}
        </text>
      </svg>\`,
    width: 24,
  };
}

const docDefinition = {
  pageOrientation: 'landscape',
  pageSize: { width: 1000, height: 700 },
  header: {
    text: 'Academic Term Grade Sheet • Dynamic JS Mode',
    alignment: 'right',
    fontSize: 9,
    color: '#94a3b8',
    margin: [40, 20]
  },
  content: [
    {
      text: 'Semester Grade Sheet & Evaluation',
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 16],
      color: '#1e293b'
    },
    {
      table: {
        headerRows: 1,
        widths: [40, 90, 140, 24, 24, 24, 60, 60],
        body: [
          // Header row with rotated vertical SVG headers
          [
            { text: 'Sl.No', bold: true, alignment: 'center' },
            { text: 'Student ID', bold: true },
            { text: 'Name', bold: true },
            verticalHeader('ΣCi×Gi in this Term'),
            verticalHeader('Marks Obtained in this Term'),
            verticalHeader('Total Credits Taken in this Term'),
            { text: 'GPA', bold: true, alignment: 'center' },
            { text: 'Status', bold: true, alignment: 'center' }
          ],
          // Sample Student Rows
          [
            { text: '1', alignment: 'center' },
            '2023001',
            'Sadman Rahman',
            { text: '68.4', alignment: 'center' },
            { text: '85', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.80', alignment: 'center', bold: true, color: '#16a34a' },
            { text: 'Passed', alignment: 'center', color: '#16a34a' }
          ],
          [
            { text: '2', alignment: 'center' },
            '2023002',
            'Tasnim Ahmed',
            { text: '70.2', alignment: 'center' },
            { text: '88', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.90', alignment: 'center', bold: true, color: '#16a34a' },
            { text: 'Passed', alignment: 'center', color: '#16a34a' }
          ],
          [
            { text: '3', alignment: 'center' },
            '2023003',
            'Nusrat Jahan',
            { text: '63.0', alignment: 'center' },
            { text: '78', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.50', alignment: 'center', bold: true, color: '#0284c7' },
            { text: 'Passed', alignment: 'center', color: '#0284c7' }
          ]
        ]
      },
      layout: 'lightHorizontalLines'
    }
  ]
};

return docDefinition;
`;

export const TS_RUNNER_CODE = `// PDFMake TypeScript Mode (TS 5.7+)
// Type-safe PDF document definitions with interfaces, enums, & helper functions!

interface FinancialRecord {
  quarter: string;
  revenue: number;
  expenses: number;
  growth: number;
  status: 'Profitable' | 'Breakeven' | 'Loss';
}

interface ReportConfig {
  title: string;
  company: string;
  currency: string;
  records: FinancialRecord[];
}

// Helper: format currency with type safety
function formatCurrency(amount: number, symbol: string = '$'): string {
  return \`\${symbol}\${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;
}

// Helper: dynamic KPI status color
function getStatusColor(status: FinancialRecord['status']): string {
  switch (status) {
    case 'Profitable': return '#16a34a';
    case 'Breakeven': return '#0284c7';
    case 'Loss': return '#dc2626';
  }
}

// Sample dataset
const config: ReportConfig = {
  title: 'Executive Financial & Performance Report',
  company: 'Apex Global Technologies Ltd.',
  currency: '$',
  records: [
    { quarter: 'Q1 2025', revenue: 245000, expenses: 180000, growth: 12.5, status: 'Profitable' },
    { quarter: 'Q2 2025', revenue: 310000, expenses: 220000, growth: 26.5, status: 'Profitable' },
    { quarter: 'Q3 2025', revenue: 285000, expenses: 240000, growth: -8.0, status: 'Profitable' },
    { quarter: 'Q4 2025', revenue: 420000, expenses: 290000, growth: 47.3, status: 'Profitable' }
  ]
};

// Compute aggregates with typed reduce
const totalRevenue: number = config.records.reduce((sum, r) => sum + r.revenue, 0);
const totalExpenses: number = config.records.reduce((sum, r) => sum + r.expenses, 0);
const netProfit: number = totalRevenue - totalExpenses;

// Document Definition
const docDefinition = {
  pageSize: 'A4',
  pageMargins: [40, 50, 40, 50],
  header: {
    text: \`\${config.company} • TypeScript Report Engine\`,
    alignment: 'right',
    fontSize: 9,
    color: '#94a3b8',
    margin: [40, 20]
  },
  footer: (currentPage: number, pageCount: number) => ({
    text: \`Page \${currentPage} of \${pageCount} • Generated with TypeScript\`,
    alignment: 'center',
    fontSize: 9,
    color: '#94a3b8',
    margin: [0, 20]
  }),
  content: [
    // Header section
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: config.title, fontSize: 18, bold: true, color: '#0f172a' },
            { text: \`Fiscal Year Performance Review • \${config.company}\`, fontSize: 10, color: '#64748b', margin: [0, 3, 0, 0] }
          ]
        },
        {
          width: 'auto',
          table: {
            body: [[
              {
                text: 'TS MODE ACTIVE',
                fontSize: 9,
                bold: true,
                color: '#0284c7',
                fillColor: '#f0f9ff',
                margin: [8, 4, 8, 4]
              }
            ]]
          },
          layout: 'noBorders'
        }
      ],
      margin: [0, 0, 0, 20]
    },

    // KPI Summary Cards
    {
      columns: [
        {
          width: '*',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'TOTAL REVENUE', fontSize: 9, bold: true, color: '#64748b' }],
              [{ text: formatCurrency(totalRevenue), fontSize: 16, bold: true, color: '#0f172a', margin: [0, 2, 0, 0] }]
            ]
          },
          layout: {
            fillColor: () => '#f8fafc',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e2e8f0',
            vLineColor: () => '#e2e8f0',
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        },
        {
          width: '*',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'TOTAL EXPENSES', fontSize: 9, bold: true, color: '#64748b' }],
              [{ text: formatCurrency(totalExpenses), fontSize: 16, bold: true, color: '#0f172a', margin: [0, 2, 0, 0] }]
            ]
          },
          layout: {
            fillColor: () => '#f8fafc',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e2e8f0',
            vLineColor: () => '#e2e8f0',
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        },
        {
          width: '*',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'NET PROFIT', fontSize: 9, bold: true, color: '#16a34a' }],
              [{ text: formatCurrency(netProfit), fontSize: 16, bold: true, color: '#16a34a', margin: [0, 2, 0, 0] }]
            ]
          },
          layout: {
            fillColor: () => '#f0fdf4',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#bbf7d0',
            vLineColor: () => '#bbf7d0',
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 8,
            paddingBottom: () => 8
          }
        }
      ],
      columnGap: 10,
      margin: [0, 0, 0, 24]
    },

    // Financial breakdown table
    { text: 'Quarterly Breakdown', fontSize: 13, bold: true, color: '#1e293b', margin: [0, 0, 0, 8] },
    {
      table: {
        headerRows: 1,
        widths: ['*', 100, 100, 80, 80],
        body: [
          [
            { text: 'Quarter', bold: true, fillColor: '#0f172a', color: '#ffffff' },
            { text: 'Revenue', bold: true, fillColor: '#0f172a', color: '#ffffff', alignment: 'right' },
            { text: 'Expenses', bold: true, fillColor: '#0f172a', color: '#ffffff', alignment: 'right' },
            { text: 'Growth', bold: true, fillColor: '#0f172a', color: '#ffffff', alignment: 'right' },
            { text: 'Status', bold: true, fillColor: '#0f172a', color: '#ffffff', alignment: 'center' }
          ],
          ...config.records.map((rec) => [
            { text: rec.quarter, bold: true },
            { text: formatCurrency(rec.revenue), alignment: 'right' },
            { text: formatCurrency(rec.expenses), alignment: 'right' },
            { text: \`\${rec.growth > 0 ? '+' : ''}\${rec.growth}%\`, alignment: 'right', color: rec.growth >= 0 ? '#16a34a' : '#dc2626' },
            { text: rec.status, alignment: 'center', bold: true, color: getStatusColor(rec.status) }
          ]),
          // Total row
          [
            { text: 'Total / Net', bold: true, fillColor: '#f1f5f9' },
            { text: formatCurrency(totalRevenue), bold: true, alignment: 'right', fillColor: '#f1f5f9' },
            { text: formatCurrency(totalExpenses), bold: true, alignment: 'right', fillColor: '#f1f5f9' },
            { text: '-', alignment: 'right', fillColor: '#f1f5f9' },
            { text: formatCurrency(netProfit), bold: true, alignment: 'center', color: '#16a34a', fillColor: '#f1f5f9' }
          ]
        ]
      },
      layout: 'lightHorizontalLines'
    }
  ]
};

return docDefinition;
`;

// Exactly 3 templates: 1 for JSON, 1 for JavaScript, 1 for TypeScript
export const TEMPLATES: PdfTemplate[] = [
  {
    id: 'json-runner',
    title: 'JSON Document Definition',
    description: 'Declarative JSON structure with styled headings, multi-column layouts, sample data tables, and custom margins.',
    category: 'General',
    icon: 'file-text',
    mode: 'json',
    code: JSON_RUNNER_CODE
  },
  {
    id: 'javascript-runner',
    title: 'JavaScript Code Runner',
    description: 'Dynamic JavaScript runner featuring helper functions, calculations, loops, rotated 90° SVG headers, and evaluation metrics.',
    category: 'Business',
    icon: 'code',
    mode: 'js',
    code: JS_RUNNER_CODE
  },
  {
    id: 'typescript-runner',
    title: 'TypeScript Code Runner',
    description: 'Type-safe TypeScript runner featuring typed interfaces, array reduce aggregations, KPI summary cards, and dynamic quarterly tables.',
    category: 'Finance',
    icon: 'cpu',
    mode: 'ts',
    code: TS_RUNNER_CODE
  }
];

export const COMMON_SNIPPETS: Snippet[] = [
  {
    name: 'TypeScript Typed Table Generator',
    category: 'TypeScript',
    description: 'Typed interface and dynamic row mapping function for PDF tables.',
    snippet: `interface ProductItem {\n  sku: string;\n  name: string;\n  qty: number;\n  price: number;\n}\n\nfunction renderProductRows(items: ProductItem[]) {\n  return items.map((p) => [\n    p.sku,\n    p.name,\n    { text: p.qty.toString(), alignment: 'right' },\n    { text: '$' + p.price.toFixed(2), alignment: 'right' }\n  ]);\n}`
  },
  {
    name: 'TypeScript Document Definition Wrapper',
    category: 'TypeScript',
    description: 'Clean typed document definition structure with export default or return.',
    snippet: `interface DocumentMetadata {\n  title: string;\n  author: string;\n  generatedAt: Date;\n}\n\nconst meta: DocumentMetadata = {\n  title: 'Official Report',\n  author: 'Engineering Team',\n  generatedAt: new Date()\n};\n\nconst docDefinition = {\n  info: { title: meta.title, author: meta.author },\n  content: [\n    { text: meta.title, fontSize: 20, bold: true },\n    { text: 'Generated: ' + meta.generatedAt.toISOString().slice(0, 10), color: '#64748b' }\n  ]\n};\n\nreturn docDefinition;`
  },
  {
    name: 'Vertical Rotated SVG Header (Table Cell)',
    category: 'Tables',
    description: 'Rotated 90° vertical text header using vector SVG inside a table column.',
    snippet: `{\n  "svg": "<svg width=\\"24\\" height=\\"190\\"><text x=\\"15\\" y=\\"95\\" text-anchor=\\"middle\\" font-size=\\"10\\" font-family=\\"Roboto\\" font-weight=\\"bold\\" transform=\\"rotate(-90 15 95)\\">ΣCi×Gi in this Term</text></svg>",\n  "width": 24\n}`
  },
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
