import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  PageOrientation,
  convertInchesToTwip,
  Header,
  ImageRun,
  BorderStyle,
  TableLayoutType,
  HeadingLevel,
} from 'docx';
import { saveAs } from 'file-saver';

interface Matter {
  _id?: string;
  title: string;
  clientName?: string;
  serviceDescription?: string;
  dealValue?: { amount: number; currency: string };
  status?: string;
  opposingCounsel?: Array<{
    firmName: string;
    representedParty: string;
    practiceArea?: string;
  }>;
}

interface Lawyer {
  _id?: string;
  firstName: string;
  lastName: string;
  position?: string;
  yearsOfExperience?: number;
  practiceAreas?: string[];
  isResponsiblePartner?: boolean;
}

interface LawyerChanges {
  partnersJoined?: string[];
  partnersLeft?: string[];
  lawyersJoined?: string[];
  lawyersLeft?: string[];
}

interface Referee {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title?: string;
  isClient?: boolean;
}

interface Submission {
  _id?: string;
  title: string;
  rankingType: 'firm' | 'department' | 'lawyer';
  targetDirectories: string[];
  year: number;
  departmentName?: string;
  matterIds: Matter[];
}

interface FirmDetails {
  firmNameHebrew?: string;
  firmNameEnglish?: string;
  companyId?: string;
  responsiblePartner?: string;
  partnerSeniority?: string;
  partnerBio?: string;
  whyDeserveRanking?: string;
  additionalData?: string;
  confirmationName?: string;
  confirmationTitle?: string;
  confirmationDate?: string;
  confirmationPhone?: string;
  confirmationEmail?: string;
}

// Colors matching the Dun's 100 template
const HEADER_GOLD = 'F5E1AF';  // Gold/beige header color
const LIGHT_BLUE = 'DEEAF6';   // Light blue accent
const DARK_BLUE = '2F5496';    // Dark blue for titles
const BORDER_COLOR = '000000'; // Black borders

const practiceAreaTranslations: Record<string, string> = {
  'real_estate': 'נדל"ן',
  'corporate': 'תאגידים',
  'litigation': 'ליטיגציה',
  'high_tech': 'היי-טק',
  'banking': 'בנקאות ומימון',
  'capital_markets': 'שוק ההון',
  'tax': 'מיסים',
  'labor': 'דיני עבודה',
  'intellectual_property': 'קניין רוחני',
  'antitrust': 'הגבלים עסקיים',
  'venture_capital': 'הון סיכון',
  'project_finance': 'מימון פרויקטים',
  'planning_construction': 'תכנון ובנייה',
};

const statusTranslations: Record<string, string> = {
  draft: 'טיוטה',
  in_progress: 'בתהליך',
  review: 'בבדיקה',
  approved: 'מאושר',
  completed: 'הושלם',
  exported: 'יוצא',
  submitted: 'הוגש',
};

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'ILS') {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Standard cell borders
const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
};

function createHeaderCell(text: string, width?: number, fontSize: number = 24): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size: fontSize,
            rightToLeft: true,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    ],
    shading: { fill: HEADER_GOLD, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: cellBorders,
  });
}

function createDataCell(text: string, width?: number, fontSize: number = 22): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: fontSize,
            rightToLeft: true,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: cellBorders,
  });
}

function createBlueCell(text: string, width?: number, bold: boolean = true): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size: 22,
            rightToLeft: true,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      }),
    ],
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: cellBorders,
  });
}

async function fetchLogoImage(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch('/assets/duns100-logo.png');
    if (!response.ok) {
      console.warn('Could not fetch logo image');
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.warn('Error fetching logo:', error);
    return null;
  }
}

export async function exportSubmissionToWord(
  submission: Submission,
  firmDetails?: FirmDetails,
  teamLawyers?: Lawyer[],
  lawyerChanges?: LawyerChanges,
  referees?: Referee[]
): Promise<void> {
  const sections: (Paragraph | Table)[] = [];

  const practiceArea = submission.departmentName
    ? (practiceAreaTranslations[submission.departmentName] || submission.departmentName)
    : 'כללי';

  // ===== LOGO =====
  const logoData = await fetchLogoImage();
  if (logoData) {
    sections.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: {
              width: 200,
              height: 80,
            },
            type: 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // ===== TITLE SECTION =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'שאלון דירוגי משרדי עורכי דין לפי תחומי פעילות',
          bold: true,
          size: 36,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 200 },
    })
  );

  // Practice Area (large blue title)
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: practiceArea,
          bold: true,
          size: 56,
          color: DARK_BLUE,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 300 },
    })
  );

  // Deadline notice
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `להגשה עד ה- 10.11.${submission.year}, באמצעות הקישור הבא `,
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
        new TextRun({
          text: 'הגשת שאלון',
          size: 22,
          color: '0563C1',
          underline: {},
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 300 },
    })
  );

  // Instructions
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'על מנת לשקף נאמנה את פעילות המשרד אנא מלאו את הפרטים הנדרשים. לתשומת לבכם:',
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 100 },
    })
  );

  const instructions = [
    'יש למלא את השאלון בהתאם להגדרת התחום (כמפורט באתר DUNS 100).',
    'הנתונים שיימסרו בטופס יישארו חסויים ולא יועברו לגורם חיצוני.',
    'דן אנד ברדסטריט אינה מתחייבת לכלול את המשרד בטבלאות הדירוג.',
    'הופעה בטבלאות הדירוג אינה כרוכה בתשלום.',
    'לא יתקבלו טפסים לאחר המועד המבוקש, אי-עמידה בלוח הזמנים עלולה לפגוע בדירוג המשרד.',
  ];

  instructions.forEach(instruction => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${instruction}`,
            size: 20,
            rightToLeft: true,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 50 },
        indent: { right: 200 },
      })
    );
  });

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '*לשאלות ניתן לפנות במייל d100@dbisrael.co.il',
          size: 20,
          italics: true,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 400 },
    })
  );

  // ===== FIRM DETAILS TABLE =====
  const firmTable = new Table({
    rows: [
      new TableRow({
        children: [
          createDataCell(firmDetails?.firmNameHebrew || '', 60),
          createHeaderCell('שם המשרד בעברית', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.firmNameEnglish || '', 60),
          createHeaderCell('שם המשרד באנגלית', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.companyId || '', 60),
          createHeaderCell('מספר ח.פ./ שותפות/ עוסק מורשה', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.responsiblePartner || '', 60),
          createHeaderCell('שם השותפ/ה אחראי/ת על תחום פעילות', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.partnerSeniority || '', 60),
          createHeaderCell('ותק השותפ/ה האחראי/ת', 40),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  sections.push(firmTable);

  // Partner Bio Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אנא הציגו בקצרה את קורות החיים של השותפ/ה האחראי/ת (ניתן להציג בקובץ מצורף):',
          bold: true,
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 300, after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: firmDetails?.partnerBio || '',
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 400 },
    })
  );

  // ===== LAWYERS JOINED/LEFT TABLE =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אנא ציינו את שמות השותפים/ות ועורכי הדין אשר הצטרפו / עזבו את הנישה במהלך השנה:',
          bold: true,
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 300, after: 200 },
    })
  );

  const changesTable = new Table({
    rows: [
      new TableRow({
        children: [
          createHeaderCell('עורכי דין', 30),
          createHeaderCell('שותפים/ות', 30),
          createHeaderCell('', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(lawyerChanges?.lawyersJoined?.join(', ') || '', 30),
          createDataCell(lawyerChanges?.partnersJoined?.join(', ') || '', 30),
          createBlueCell('הצטרפו', 40),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(lawyerChanges?.lawyersLeft?.join(', ') || '', 30),
          createDataCell(lawyerChanges?.partnersLeft?.join(', ') || '', 30),
          createBlueCell('עזבו', 40),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  sections.push(changesTable);

  // ===== TEAM LAWYERS TABLE =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אנא ציינו את שמות השותפים/ות ועורכי הדין הייעודיים לתחום הפעילות ושנות הוותק שלהם:',
          bold: true,
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 400, after: 200 },
    })
  );

  const lawyerRows = [
    new TableRow({
      children: [
        createHeaderCell('שותפ/ה אחראי/ת', 20),
        createHeaderCell('שנות ותק בתחום', 30),
        createHeaderCell('שם עוה"ד', 50),
      ],
    }),
  ];

  const lawyers = teamLawyers || [];
  for (let i = 0; i < Math.max(lawyers.length, 10); i++) {
    const lawyer = lawyers[i];
    lawyerRows.push(
      new TableRow({
        children: [
          createDataCell(lawyer?.isResponsiblePartner ? '✓' : '', 20),
          createDataCell(lawyer?.yearsOfExperience?.toString() || '', 30),
          createDataCell(lawyer ? `${lawyer.firstName} ${lawyer.lastName}` : '', 50),
        ],
      })
    );
  }

  const lawyersTable = new Table({
    rows: lawyerRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  sections.push(lawyersTable);

  // ===== 10 MATTERS SECTION =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אנא פרטו את 10 התיקים / העסקאות המהותיים מהשנה האחרונה:',
          bold: true,
          size: 26,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 500, after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'יש לפרט את השירותים הספציפיים שסיפקתם ללקוח בשנה האחרונה, תוך התייחסות למורכבות השירות, סכומים כספיים מעורבים, תקדימים (אם קיימים), וכן ייחודיות השירות ביחס למקרים דומים.',
          size: 20,
          italics: true,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 300 },
    })
  );

  // Create 10 matter sections
  for (let i = 0; i < 10; i++) {
    const matter = submission.matterIds[i];
    const matterNumber = i + 1;

    // Matter number header (blue background)
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${matterNumber}`,
            bold: true,
            size: 32,
            color: DARK_BLUE,
            rightToLeft: true,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { before: 300, after: 100 },
        shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
      })
    );

    const matterTable = new Table({
      rows: [
        new TableRow({
          children: [
            createDataCell(matter?.clientName || '', 65),
            createHeaderCell('שם הלקוח/ה', 35),
          ],
        }),
        new TableRow({
          children: [
            createDataCell(matter?.serviceDescription || matter?.title || '', 65),
            createHeaderCell('פירוט השירותים שהוענקו', 35),
          ],
        }),
        new TableRow({
          children: [
            createDataCell(
              matter?.opposingCounsel?.map(c =>
                `${c.firmName} (ייצג את ${c.representedParty}${c.practiceArea ? `, ${c.practiceArea}` : ''})`
              ).join('\n') || '',
              65
            ),
            createHeaderCell('משרדי עו"ד נוספים שהיו מעורבים (את מי ייצגו ובאיזה תחום)', 35),
          ],
        }),
        new TableRow({
          children: [
            createDataCell(
              matter?.dealValue
                ? formatCurrency(matter.dealValue.amount, matter.dealValue.currency)
                : '',
              65
            ),
            createHeaderCell('היקף עסקה מידי (לא פוטנציאלי) עפ"י שוויו לצורכי דיווח (בש"ח):', 35),
          ],
        }),
        new TableRow({
          children: [
            createDataCell(
              matter?.status
                ? (statusTranslations[matter.status] || matter.status)
                : '',
              65
            ),
            createHeaderCell('סטאטוס הפרויקט:', 35),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    });

    sections.push(matterTable);
  }

  // ===== REFEREES SECTION =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אנא ציינו עד 10 ממליצים – בפורמט מטה בלבד',
          bold: true,
          size: 24,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 500, after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'הפניה לממליצים תעשה במייל',
          size: 20,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 50 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '*יש לכלול ברשימת הממליצים לפחות 3 לקוחות - למעט מקרים בהם מדובר על לקוחות פרטיים או חסויים',
          size: 18,
          italics: true,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 200 },
    })
  );

  const refereeRows = [
    new TableRow({
      children: [
        createHeaderCell('האם הממליצ/ה – לקוח / לא לקוח', 20),
        createHeaderCell('תפקיד וחברת הממליצ/ה', 25),
        createHeaderCell('כתובת דוא"ל', 25),
        createHeaderCell('שם הממליצ/ה', 30),
      ],
    }),
  ];

  const refereesData = referees || [];
  for (let i = 0; i < 10; i++) {
    const referee = refereesData[i];
    refereeRows.push(
      new TableRow({
        children: [
          createDataCell(referee?.isClient ? 'לקוח' : (referee ? 'לא לקוח' : ''), 20),
          createDataCell(referee ? `${referee.title || ''}, ${referee.company}` : '', 25),
          createDataCell(referee?.email || '', 25),
          createDataCell(referee ? `${referee.firstName} ${referee.lastName}` : '', 30),
        ],
      })
    );
  }

  const refereesTable = new Table({
    rows: refereeRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  sections.push(refereesTable);

  // ===== WHY DESERVE RANKING =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'מדוע לדעתכם משרדכם ראוי להופיע בדירוג?',
          bold: true,
          size: 24,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: firmDetails?.whyDeserveRanking || '',
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 300 },
    })
  );

  // ===== ADDITIONAL DATA =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'נתונים נוספים (כגון: מאמרים, ספרים, תקדימים וכל חומר רלוונטי נוסף)',
          bold: true,
          size: 24,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 300, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: firmDetails?.additionalData || '',
          size: 22,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 400 },
    })
  );

  // ===== CONFIRMATION TABLE =====
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אישור הנתונים',
          bold: true,
          size: 26,
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 400, after: 200 },
    })
  );

  const confirmationTable = new Table({
    rows: [
      new TableRow({
        children: [
          createDataCell(firmDetails?.confirmationName || '', 80),
          createHeaderCell('שם', 20),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.confirmationTitle || '', 80),
          createHeaderCell('תפקיד', 20),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.confirmationDate || new Date().toLocaleDateString('he-IL'), 80),
          createHeaderCell('תאריך', 20),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.confirmationPhone || '', 80),
          createHeaderCell('טלפון ישיר', 20),
        ],
      }),
      new TableRow({
        children: [
          createDataCell(firmDetails?.confirmationEmail || '', 80),
          createHeaderCell('דואר אלקטרוני', 20),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  sections.push(confirmationTable);

  // Footer note
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'הערה: דן אנד ברדסטריט אינה מתחייבת לכלול את המשרד בטבלאות הדירוג',
          size: 18,
          italics: true,
          color: '666666',
          rightToLeft: true,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { before: 400 },
    })
  );

  // Create document with RTL support
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'David',
            rightToLeft: true,
          },
          paragraph: {
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
            },
          },
          bidi: true, // Enable RTL for the entire section
        },
        children: sections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `${submission.title.replace(/[^a-zA-Z0-9א-ת]/g, '_')}_${submission.year}.docx`;
  saveAs(blob, fileName);
}
