import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { TemplateDefinition } from '../types.js';

// Base DOCX template as base64 (minimal valid docx)
const BASE_TEMPLATE = `UEsDBBQAAAAIAAAAAACBlaYMAQAAADQAAAALAAAAX3JlbHMvLnJlbHONz7sKwjAQQNGe/yBkbzKp7ERsoYWdCPoBQ7LGh80jZlL8fSNIoQgy3HPvDB3Xsy/iBXM2Q2DQNJQRxTBoN0k4jm/bDa28eKJD9DmDMC0h5MoYdNfpLs8pIprBDkdCbMV7loMPYuzsnK1f1y+T6y/Y7S9XPAyR+rJr7VR6xvQBUEsDBBQAAAAIAAAAAADlDSrjqQAAANcAAAAPAAAAZHJzL2Rvd25yZXYueG1sTM7NCoJAFAXgfQ/Qm4i7GLU/sDFoQEJBbbKrM15z0LmjzkTl0zdB0OqwOHyH07ed6cSTuq5xpGGeJCDIlk41tkZ4O8xmKxCdR6uwdUQI39TBNptMUlTKPemVnntfiyAhy4BAb/1DSdmVmgx2sXsQhXJ1nUEfYldL1eFLpKZZQrJkIQ02Nl4wxPIk92h6s7nqd6X/SvdrSA7xYXz/2WTPefL7vvzrD1BLAwQUAAAACAAAAAAA5Q0q46kAAADXAAAAEAAAAGRycy9kb3ducmV2LnhtbEzOzQqCQBSA4X0P0JuIuxj1PxhbkFBQm+zqjNccdO6oM1H59E0QtDosvsPhde0gWvGkrm0cyTgJQJItVeraGuH9OJusQXQea0WtI0L4po5WyXiSotL6Sa/0PPq1DOL+pO+MkgC9dQ/l0VRY7hqzueh3uf+K+DWkh3g/vv3sss+c+31ffvUHUEsDBBQAAAAIAAAAAACL8yjwgAAAALEAAAARAAAAZG9jUHJvcHMvY29yZS54bWxNjsEKwjAQRO8+Qth7mrYoIm3Fq3j0Jn5Akm5tsM0u2Yjt35tWEN8yM8Owsqt10+gtJdQhGJhlOWgKNrgmuAOD/XG7AY2Jgytq0GRgoITdejURZcwTPqR4wxQZfBwMzjFF4UJk+yBfpbOZ7L+yf+vf/gFQSwMEFAAAAAgAAAAAAByP+mGCAAAA1gAAABMAAABbQ29udGVudF9UeXBlc10ueG1snc7BDoIwDAbgu+E7kL0bQOMxagxH9eBZBttI2Mo6ot/ewIVEbzz2/5J+beJa3e+WrtCjj0SKJjwDReCcdB3J9/O8WoMKicipwRNJGDBpFS+TZyahB0vTkEJ4bDMWDfaa5QQ+fif3fU/a0M9kf+vYB1BLAQIUABQAAAAIAAAAAACBlaYMAQAAADQAAAALAAAAAAAAAAAAAAAAAAAAAABfcmVscy8ucmVsc1BLAQIUABQAAAAIAAAAAADlDSrjqQAAANcAAAAPAAAAAAAAAAAAAAAAACoAAABkcnMvZG93bnJldi54bWxQSwECFAAUAAAACAAAAAAA5Q0q46kAAADXAAAAEAAAAAAAAAAAAAAAAAAQAQAAZHJzL2Rvd25yZXYueG1sUEsBAhQAFAAAAAgAAAAAAIvzKPCAAAAAsQAAABEAAAAAAAAAAAAAAAAA9wEAAGRvY1Byb3BzL2NvcmUueG1sUEsBAhQAFAAAAAgAAAAAAByP+mGCAAAA1gAAABMAAAAAAAAAAAAAAAAApgIAAFtDb250ZW50X1R5cGVzXS54bWxQSwUGAAAAAAUABQD5AAAAWQMAAAAA`;

export class DocxGenerator {
  static async generate(
    template: TemplateDefinition,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    // For a real implementation, you would load an actual template file
    // This creates a simple text document with the data

    const content = this.formatContent(template, data);

    // In production, use actual docx template
    // For now, return a buffer with formatted text
    // This would be replaced with proper docxtemplater usage

    const zip = new PizZip(Buffer.from(BASE_TEMPLATE, 'base64'));
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buf;
  }

  private static formatContent(
    template: TemplateDefinition,
    data: Record<string, unknown>,
  ): string {
    const lines: string[] = [
      `${template.name}`,
      `${'='.repeat(template.name.length)}`,
      '',
    ];

    for (const field of template.fields) {
      const value = data[field.name];
      if (value !== undefined && value !== null && value !== '') {
        lines.push(`${field.label}: ${value}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
