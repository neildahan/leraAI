import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

interface Matter {
  title: string;
  clientName?: string;
  serviceDescription?: string;
  opposingCounsel?: Array<{
    firmName: string;
    representedParty: string;
    practiceArea?: string;
  }>;
}

interface Submission {
  title: string;
  rankingType: 'firm' | 'department' | 'lawyer';
  targetDirectories: string[];
  year: number;
  departmentName?: string;
  matterIds: Matter[];
}

const directoryLabels: Record<string, string> = {
  chambers: 'Chambers and Partners',
  legal_500: 'Legal 500',
  duns_100: "Dun's 100",
};

function createTableCell(text: string, options?: { bold?: boolean; width?: number }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options?.bold,
            size: 22,
          }),
        ],
      }),
    ],
    width: options?.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
  });
}

export async function exportSubmissionToWord(submission: Submission): Promise<void> {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      text: 'Legal Directory Submission',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push(
    new Paragraph({
      text: submission.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Submission Info Table
  sections.push(
    new Paragraph({
      text: 'Submission Details',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  const infoRows = [
    ['Ranking Type', submission.rankingType.charAt(0).toUpperCase() + submission.rankingType.slice(1)],
    ['Target Directories', submission.targetDirectories.map(d => directoryLabels[d] || d).join(', ')],
    ['Year', submission.year.toString()],
  ];

  if (submission.departmentName) {
    infoRows.push(['Department/Practice Area', submission.departmentName]);
  }

  const infoTable = new Table({
    rows: infoRows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            createTableCell(label, { bold: true, width: 30 }),
            createTableCell(value, { width: 70 }),
          ],
        })
    ),
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  sections.push(infoTable as unknown as Paragraph);

  // Matters Section
  sections.push(
    new Paragraph({
      text: 'Key Matters',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 },
    })
  );

  if (submission.matterIds.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No matters selected.',
        spacing: { after: 200 },
      })
    );
  } else {
    submission.matterIds.forEach((matter, index) => {
      // Matter number and title
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. `,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: matter.title,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      // Client name
      if (matter.clientName) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Client: ', bold: true, size: 22 }),
              new TextRun({ text: matter.clientName, size: 22 }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      // Service Description
      if (matter.serviceDescription) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Services Provided:', bold: true, size: 22 }),
            ],
            spacing: { after: 50 },
          })
        );
        sections.push(
          new Paragraph({
            text: matter.serviceDescription,
            spacing: { after: 100 },
          })
        );
      }

      // Opposing Counsel
      if (matter.opposingCounsel && matter.opposingCounsel.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Other Law Firms Involved:', bold: true, size: 22 }),
            ],
            spacing: { after: 50 },
          })
        );

        matter.opposingCounsel.forEach((counsel) => {
          const counselText = `${counsel.firmName} (representing ${counsel.representedParty}${counsel.practiceArea ? `, ${counsel.practiceArea}` : ''})`;
          sections.push(
            new Paragraph({
              text: `• ${counselText}`,
              spacing: { after: 50 },
            })
          );
        });
      }

      // Divider line (empty paragraph with border)
      sections.push(
        new Paragraph({
          text: '',
          spacing: { before: 200, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
          },
        })
      );
    });
  }

  // Footer
  sections.push(
    new Paragraph({
      text: `Generated on ${new Date().toLocaleDateString()} by Lera AI`,
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      children: [
        new TextRun({
          text: `Generated on ${new Date().toLocaleDateString()} by Lera AI`,
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `${submission.title.replace(/[^a-zA-Z0-9]/g, '_')}_${submission.year}.docx`;
  saveAs(blob, fileName);
}
