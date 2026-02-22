const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

// Read the original template
const templatePath = '/Users/neildahan/Downloads/Documents/3.docx';
const outputPath = path.join(__dirname, '../public/templates/duns100-template.docx');

const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

// Get document.xml
let documentXml = zip.file('word/document.xml').asText();

// Replace the practice area placeholder (נדל"ן)
documentXml = documentXml.replace(
  />נדל"ן</g,
  '>{{practiceArea}}<'
);

// Find empty cells after specific headers and add placeholders
// Pattern: Header text in one cell, empty cell next to it

const replacements = [
  // Firm details table
  { after: 'שם המשרד בעברית', placeholder: '{{firmNameHebrew}}' },
  { after: 'שם המשרד באנגלית', placeholder: '{{firmNameEnglish}}' },
  { after: 'מספר ח.פ./ שותפות/ עוסק מורשה', placeholder: '{{companyId}}' },
  { after: 'שם השותפ/ה אחראי/ת על תחום פעילות', placeholder: '{{responsiblePartner}}' },
  { after: 'ותק השותפ/ה האחראי/ת', placeholder: '{{partnerSeniority}}' },
];

// For each replacement, find the header text and add placeholder in the next empty cell
replacements.forEach(({ after, placeholder }) => {
  // Find pattern where the header appears and the next cell is empty
  // We need to find the empty paragraph in the next table cell
  const headerPattern = new RegExp(
    `(${after.replace(/[\/]/g, '\\/')})(.{0,500}?<w:tc>.*?<w:p[^>]*>)(</w:p>)`,
    's'
  );

  documentXml = documentXml.replace(headerPattern, (match, header, middle, end) => {
    return `${header}${middle}<w:r><w:t>${placeholder}</w:t></w:r>${end}`;
  });
});

// Add placeholder for partner bio section
// Find the section after "אנא הציגו בקצרה את קורות החיים"
documentXml = documentXml.replace(
  /(אנא הציגו בקצרה את קורות החיים.*?<\/w:p>.*?<w:p[^>]*>)(.*?)(<\/w:p>)/s,
  '$1<w:r><w:t>{{partnerBio}}</w:t></w:r>$3'
);

// Add placeholders for lawyer changes table
// Find "הצטרפו" row and add placeholders
const lawyerChangesPatterns = [
  { row: 'הצטרפו', partners: '{{partnersJoined}}', lawyers: '{{lawyersJoined}}' },
  { row: 'עזבו', partners: '{{partnersLeft}}', lawyers: '{{lawyersLeft}}' },
];

// Add placeholders for 10 matters
for (let i = 1; i <= 10; i++) {
  const patterns = [
    { header: 'שם הלקוח/ה', placeholder: `{{m${i}_clientName}}` },
    { header: 'פירוט השירותים שהוענקו', placeholder: `{{m${i}_serviceDescription}}` },
    { header: 'משרדי עו"ד נוספים שהיו מעורבים', placeholder: `{{m${i}_opposingCounsel}}` },
    { header: 'היקף עסקה מידי', placeholder: `{{m${i}_dealValue}}` },
    { header: 'סטאטוס הפרויקט', placeholder: `{{m${i}_status}}` },
  ];
}

// Update the document
zip.file('word/document.xml', documentXml);

// Write the output
const out = zip.generate({
  type: 'nodebuffer',
  compression: 'DEFLATE',
});

fs.writeFileSync(outputPath, out);
console.log(`Template created at: ${outputPath}`);
