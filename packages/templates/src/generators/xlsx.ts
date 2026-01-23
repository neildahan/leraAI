import ExcelJS from 'exceljs';
import { TemplateDefinition } from '../types.js';

export class XlsxGenerator {
  static async generate(
    template: TemplateDefinition,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lera AI';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Submission');

    // Add header row
    worksheet.addRow(['Field', 'Value']);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    for (const field of template.fields) {
      const value = data[field.name];
      if (value !== undefined && value !== null) {
        worksheet.addRow([field.label, String(value)]);
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? String(cell.value) : '';
        maxLength = Math.max(maxLength, Math.min(cellValue.length + 2, 50));
      });
      column.width = maxLength;
    });

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
