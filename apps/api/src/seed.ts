import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get models
  const lawyerModel = app.get<Model<any>>(getModelToken('Lawyer'));
  const matterModel = app.get<Model<any>>(getModelToken('Matter'));
  const refereeModel = app.get<Model<any>>(getModelToken('Referee'));
  const submissionModel = app.get<Model<any>>(getModelToken('Submission'));
  const userModel = app.get<Model<any>>(getModelToken('User'));

  console.log('🌱 Starting database seed...');

  // Get or create a default user for createdBy references
  let defaultUser = await userModel.findOne({ email: 'admin@firm.co.il' });
  if (!defaultUser) {
    defaultUser = await userModel.create({
      email: 'admin@firm.co.il',
      passwordHash: '$2b$10$placeholder', // This won't be used for login
      firstName: 'מנהל',
      lastName: 'מערכת',
      role: 'admin',
    });
    console.log('✅ Created default admin user');
  }

  const userId = defaultUser._id;

  // Clear existing data
  await lawyerModel.deleteMany({});
  await matterModel.deleteMany({});
  await refereeModel.deleteMany({});
  await submissionModel.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Seed Lawyers
  const lawyers = await lawyerModel.insertMany([
    {
      firstName: 'יוסי',
      lastName: 'כהן',
      email: 'yossi.cohen@firm.co.il',
      phone: '+972-54-111-2222',
      level: 'managing_partner',
      title: 'שותף מנהל, ראש מחלקת M&A',
      practiceAreas: ['corporate', 'high_tech', 'capital_markets'],
      department: 'Corporate',
      admissionYear: 2002,
      bio: 'יוסי כהן הוא השותף המנהל של המשרד ומוביל את מחלקת ה-M&A. בעל ניסיון של למעלה מ-20 שנה בליווי עסקאות מיזוג ורכישה מורכבות.',
      previousRankings: [
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה', practiceArea: 'corporate' },
        { directory: 'Chambers', year: 2025, ranking: 'Band 1', practiceArea: 'corporate' },
      ],
      education: ['LLB האוניברסיטה העברית', 'LLM Harvard Law School'],
      languages: ['עברית', 'אנגלית', 'צרפתית'],
      achievements: ['עורך דין מוביל בדירוג BDI', 'הנהגת עסקת השנה 2024'],
      createdBy: userId,
    },
    {
      firstName: 'מיכל',
      lastName: 'לוי',
      email: 'michal.levi@firm.co.il',
      phone: '+972-54-333-4444',
      level: 'senior_partner',
      title: 'שותפה בכירה, ראש מחלקת היי-טק',
      practiceAreas: ['high_tech', 'venture_capital', 'corporate'],
      department: 'High-Tech',
      admissionYear: 2005,
      bio: 'מיכל לוי היא שותפה בכירה וראש מחלקת ההיי-טק במשרד. מומחית בעסקאות M&A, גיוסי הון ויציאות (exits) של חברות טכנולוגיה. בעשור האחרון ליוותה יותר מ-50 עסקאות בהיקף כולל של מעל 5 מיליארד דולר.',
      previousRankings: [
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה', practiceArea: 'high_tech' },
        { directory: 'Chambers', year: 2025, ranking: 'Band 1', practiceArea: 'TMT' },
      ],
      education: ['LLB אוניברסיטת תל אביב', 'LLM Harvard Law School'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'דוד',
      lastName: 'שמעוני',
      email: 'david.shimoni@firm.co.il',
      phone: '+972-54-555-6666',
      level: 'senior_partner',
      title: 'שותף בכיר, ליטיגציה מסחרית',
      practiceAreas: ['litigation', 'arbitration', 'antitrust'],
      department: 'Litigation',
      admissionYear: 2003,
      bio: 'דוד שמעוני הוא שותף בכיר וראש מחלקת הליטיגציה. מומחה בליטיגציה מסחרית מורכבת, בוררויות בינלאומיות והגבלים עסקיים.',
      previousRankings: [
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה שנייה', practiceArea: 'litigation' },
        { directory: 'Chambers', year: 2025, ranking: 'Band 2', practiceArea: 'Dispute Resolution' },
      ],
      education: ['LLB האוניברסיטה העברית', 'MBA אוניברסיטת תל אביב'],
      languages: ['עברית', 'אנגלית', 'רוסית'],
      createdBy: userId,
    },
    {
      firstName: 'רונית',
      lastName: 'אברהם',
      email: 'ronit.avraham@firm.co.il',
      phone: '+972-54-777-8888',
      level: 'partner',
      title: 'שותפה, נדל"ן ותכנון ובנייה',
      practiceAreas: ['real_estate', 'planning_construction', 'corporate'],
      department: 'Real Estate',
      admissionYear: 2008,
      bio: 'רונית אברהם היא שותפה וראש מחלקת הנדל"ן במשרד. מתמחה בפרויקטים של התחדשות עירונית, עסקאות נדל"ן מסחרי ומגורים.',
      previousRankings: [
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה', practiceArea: 'real_estate' },
      ],
      education: ['LLB אוניברסיטת תל אביב'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'עמית',
      lastName: 'גולדשטיין',
      email: 'amit.goldstein@firm.co.il',
      phone: '+972-54-999-0000',
      level: 'partner',
      title: 'שותף, בנקאות ומימון',
      practiceAreas: ['banking', 'project_finance', 'capital_markets'],
      department: 'Banking & Finance',
      admissionYear: 2010,
      bio: 'עמית גולדשטיין הוא שותף במחלקת הבנקאות והמימון. מתמחה במימון פרויקטים, עסקאות מימון מורכבות ושוק ההון.',
      previousRankings: [
        { directory: 'Legal 500', year: 2025, ranking: 'Recommended', practiceArea: 'Banking & Finance' },
      ],
      education: ['LLB IDC הרצליה', 'MBA IDC הרצליה'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'נועה',
      lastName: 'פרידמן',
      email: 'noa.friedman@firm.co.il',
      phone: '+972-54-111-3333',
      level: 'counsel',
      title: 'עורכת דין בכירה, מיסים',
      practiceAreas: ['tax', 'corporate', 'capital_markets'],
      department: 'Tax',
      admissionYear: 2012,
      bio: 'נועה פרידמן היא עורכת דין בכירה במחלקת המיסים. מתמחה בתכנון מס, עסקאות בינלאומיות והיבטי מס של שוק ההון.',
      previousRankings: [],
      education: ['LLB אוניברסיטת בר אילן', 'LLM מיסים אוניברסיטת תל אביב'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'אלון',
      lastName: 'ברקוביץ',
      email: 'alon.berkowitz@firm.co.il',
      phone: '+972-54-222-4444',
      level: 'senior_associate',
      title: 'עורך דין בכיר, היי-טק',
      practiceAreas: ['high_tech', 'venture_capital', 'intellectual_property'],
      department: 'High-Tech',
      admissionYear: 2017,
      bio: 'אלון ברקוביץ הוא עורך דין בכיר במחלקת ההיי-טק. מתמחה בגיוסי הון, הסכמי SAFE, ורישום קניין רוחני.',
      previousRankings: [],
      education: ['LLB אוניברסיטת תל אביב'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'שירה',
      lastName: 'מזרחי',
      email: 'shira.mizrachi@firm.co.il',
      phone: '+972-54-333-5555',
      level: 'associate',
      title: 'עורכת דין, תאגידים',
      practiceAreas: ['corporate', 'capital_markets'],
      department: 'Corporate',
      admissionYear: 2021,
      bio: 'שירה מזרחי היא עורכת דין במחלקת התאגידים. מתמחה בעסקאות מיזוג ורכישה ודיני חברות.',
      previousRankings: [],
      education: ['LLB האוניברסיטה העברית'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'איתן',
      lastName: 'רוזנברג',
      email: 'eitan.rosenberg@firm.co.il',
      phone: '+972-54-444-6666',
      level: 'partner',
      title: 'שותף, דיני עבודה',
      practiceAreas: ['labor', 'litigation', 'corporate'],
      department: 'Labor',
      admissionYear: 2009,
      bio: 'איתן רוזנברג הוא שותף במחלקת דיני העבודה. מתמחה בהסכמים קיבוציים, ליטיגציה בדיני עבודה ויעוץ שוטף למעסיקים.',
      previousRankings: [
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה שנייה', practiceArea: 'labor' },
      ],
      education: ['LLB אוניברסיטת חיפה'],
      languages: ['עברית', 'אנגלית'],
      createdBy: userId,
    },
    {
      firstName: 'תמר',
      lastName: 'הלוי',
      email: 'tamar.halevi@firm.co.il',
      phone: '+972-54-555-7777',
      level: 'senior_partner',
      title: 'שותפה בכירה, קניין רוחני',
      practiceAreas: ['intellectual_property', 'high_tech', 'litigation'],
      department: 'IP',
      admissionYear: 2004,
      bio: 'תמר הלוי היא שותפה בכירה וראש מחלקת הקניין הרוחני. מומחית ברישום פטנטים, סימני מסחר ותביעות הפרה.',
      previousRankings: [
        { directory: 'Chambers', year: 2025, ranking: 'Band 1', practiceArea: 'IP' },
        { directory: "Dun's 100", year: 2025, ranking: 'טבלה ראשונה', practiceArea: 'intellectual_property' },
      ],
      education: ['LLB אוניברסיטת תל אביב', 'B.Sc. מדעי המחשב הטכניון'],
      languages: ['עברית', 'אנגלית', 'גרמנית'],
      createdBy: userId,
    },
  ]);
  console.log(`✅ Seeded ${lawyers.length} lawyers`);

  // Seed Matters
  const matters = await matterModel.insertMany([
    {
      title: 'רכישת מודולר מערכות ע"י אינטל',
      clientName: 'Intel Corporation',
      counterparties: ['מודולר מערכות בע"מ', 'בעלי מניות מודולר'],
      opposingCounsel: [
        { firmName: 'הרצוג פוקס נאמן', representedParty: 'מודולר מערכות', practiceArea: 'corporate' },
      ],
      serviceDescription: 'ייצוג אינטל ברכישת חברת הסטארטאפ הישראלית מודולר מערכות בעסקה בשווי 450 מיליון דולר. העסקה כללה בדיקת נאותות מקיפה, משא ומתן על הסכמי רכישה מורכבים, וטיפול באישורים רגולטוריים מול רשות ההגבלים העסקיים.',
      practiceArea: 'corporate',
      status: 'approved',
      dealValue: { amount: 450000000, currency: 'USD' },
      confidenceScore: 95,
      submissionScore: 92,
      completionDate: new Date('2025-01-15'),
      createdBy: userId,
    },
    {
      title: 'הנפקת אופנה פלוס בבורסת תל אביב',
      clientName: 'אופנה פלוס בע"מ',
      counterparties: ['חתמים: לידר שוקי הון, פועלים IBI'],
      opposingCounsel: [
        { firmName: 'גולדפרב זליגמן', representedParty: 'חתמים', practiceArea: 'capital_markets' },
      ],
      serviceDescription: 'ליווי הנפקה ראשונה של רשת האופנה הגדולה בישראל בבורסת תל אביב. ההנפקה גייסה 180 מיליון ש"ח וכללה תשקיף מפורט, עבודה מול הרשות לניירות ערך, ומשא ומתן עם מוסדיים.',
      practiceArea: 'capital_markets',
      status: 'approved',
      dealValue: { amount: 180000000, currency: 'ILS' },
      confidenceScore: 90,
      submissionScore: 88,
      completionDate: new Date('2025-02-01'),
      createdBy: userId,
    },
    {
      title: 'סבב גיוס C של פינטק סולושנס',
      clientName: 'FinTech Solutions Ltd',
      counterparties: ['Sequoia Capital', 'Insight Partners', 'Viola Ventures'],
      opposingCounsel: [
        { firmName: 'Fenwick & West', representedParty: 'Sequoia Capital', practiceArea: 'venture_capital' },
      ],
      serviceDescription: 'ייצוג חברת הפינטק הישראלית בסבב גיוס Series C בהיקף 120 מיליון דולר בהובלת סקויה קפיטל. העסקה כללה משא ומתן על תנאי ההשקעה, זכויות אנטי-דילול, והרכב דירקטוריון.',
      practiceArea: 'high_tech',
      status: 'review',
      dealValue: { amount: 120000000, currency: 'USD' },
      confidenceScore: 88,
      createdBy: userId,
    },
    {
      title: 'פרויקט מגורים "פארק הים" הרצליה',
      clientName: 'אזורים קבוצת השקעות',
      counterparties: ['עיריית הרצליה', 'בנק הפועלים'],
      serviceDescription: 'ליווי משפטי מקיף לפרויקט פינוי-בינוי בהיקף 2 מיליארד ש"ח בהרצליה הכולל 800 יחידות דיור. כולל הסכמים עם דיירים, הסדרי מימון, וטיפול בהיבטי תכנון ובנייה.',
      practiceArea: 'real_estate',
      status: 'approved',
      dealValue: { amount: 2000000000, currency: 'ILS' },
      confidenceScore: 93,
      submissionScore: 90,
      completionDate: new Date('2025-01-28'),
      createdBy: userId,
    },
    {
      title: 'תביעה ייצוגית נגד תשתיות טלקום',
      clientName: 'תשתיות טלקום ישראל בע"מ',
      counterparties: ['קבוצת התובעים הייצוגית'],
      opposingCounsel: [
        { firmName: 'בן ארי פיש סבן', representedParty: 'קבוצת התובעים', practiceArea: 'litigation' },
      ],
      serviceDescription: 'הגנה מוצלחת על חברת תקשורת מובילה בתביעה ייצוגית בסך 500 מיליון ש"ח בגין טענות לגביה יתר. התיק הסתיים בפשרה של 15 מיליון ש"ח בלבד.',
      practiceArea: 'litigation',
      status: 'exported',
      dealValue: { amount: 500000000, currency: 'ILS' },
      confidenceScore: 96,
      submissionScore: 94,
      completionDate: new Date('2024-11-15'),
      createdBy: userId,
    },
    {
      title: 'מיזוג בנקים דיגיטליים - וואן ופאי',
      clientName: 'One Digital Bank',
      counterparties: ['PayBank Ltd', 'בנק ישראל'],
      opposingCounsel: [
        { firmName: 'מיתר ליקוורניק', representedParty: 'PayBank', practiceArea: 'banking' },
      ],
      serviceDescription: 'ייצוג One Digital Bank במיזוג עם PayBank ליצירת הבנק הדיגיטלי הגדול בישראל. העסקה דרשה אישור בנק ישראל והתמודדות עם סוגיות רגולציה מורכבות.',
      practiceArea: 'banking',
      status: 'review',
      dealValue: { amount: 800000000, currency: 'ILS' },
      confidenceScore: 85,
      createdBy: userId,
    },
    {
      title: 'רישום פטנטים גלובלי - AI מדיקל',
      clientName: 'AI Medical Diagnostics',
      counterparties: ['USPTO', 'EPO', 'משרד הפטנטים הישראלי'],
      serviceDescription: 'הגשה וליווי של 12 בקשות פטנט בינלאומיות עבור טכנולוגיית AI לאבחון רפואי. כולל משא ומתן עם בוחני פטנטים ותיקון תביעות.',
      practiceArea: 'intellectual_property',
      status: 'approved',
      dealValue: { amount: 5000000, currency: 'USD' },
      confidenceScore: 91,
      submissionScore: 89,
      completionDate: new Date('2025-02-10'),
      createdBy: userId,
    },
    {
      title: 'הסכם קיבוצי - עובדי חברת תעשייה',
      clientName: 'תעשיות כימיות ישראל',
      counterparties: ['ההסתדרות הכללית', 'ועד העובדים'],
      serviceDescription: 'ניהול משא ומתן על הסכם קיבוצי חדש ל-3,000 עובדים. ההסכם כולל העלאות שכר, שיפור תנאים סוציאליים, ומעבר לעבודה היברידית.',
      practiceArea: 'labor',
      status: 'approved',
      dealValue: { amount: 150000000, currency: 'ILS' },
      confidenceScore: 87,
      submissionScore: 85,
      completionDate: new Date('2025-01-01'),
      createdBy: userId,
    },
    {
      title: 'מימון פרויקט אנרגיה סולארית',
      clientName: 'דליה אנרגיות מתחדשות',
      counterparties: ['בנק לאומי', 'הפניקס השקעות', 'חברת החשמל'],
      serviceDescription: 'ליווי משפטי למימון פרויקט שדה סולארי בהיקף 400 מגה-וואט בנגב. כולל הסכמי PPA עם חברת החשמל, מימון פרויקט, וליווי רגולטורי.',
      practiceArea: 'project_finance',
      status: 'draft',
      dealValue: { amount: 1200000000, currency: 'ILS', isEstimated: true },
      createdBy: userId,
    },
    {
      title: 'Exit של סייבר סטארט לפאלו אלטו',
      clientName: 'CyberStart Ltd',
      counterparties: ['Palo Alto Networks', 'משקיעים קיימים'],
      opposingCounsel: [
        { firmName: 'Wilson Sonsini', representedParty: 'Palo Alto Networks', practiceArea: 'high_tech' },
        { firmName: 'גרניט', representedParty: 'משקיעים קיימים', practiceArea: 'corporate' },
      ],
      serviceDescription: 'ייצוג מייסדי חברת הסייבר הישראלית במכירה לפאלו אלטו נטוורקס בעסקה בשווי 350 מיליון דולר. העסקה כללה מנגנוני earn-out מורכבים והתחייבויות נושאי משרה.',
      practiceArea: 'high_tech',
      status: 'approved',
      dealValue: { amount: 350000000, currency: 'USD' },
      confidenceScore: 97,
      submissionScore: 95,
      completionDate: new Date('2024-12-20'),
      createdBy: userId,
    },
  ]);
  console.log(`✅ Seeded ${matters.length} matters`);

  // Seed Referees
  const referees = await refereeModel.insertMany([
    {
      firstName: 'אורי',
      lastName: 'לוינסון',
      email: 'ori.levinson@intel.com',
      phone: '+972-54-777-8899',
      company: 'Intel Israel',
      title: 'VP & General Counsel',
      position: 'סמנכ"ל ויועץ משפטי ראשי',
      relationshipType: 'client',
      relationshipYears: 8,
      matterReferences: [
        { matterId: matters[0]._id, matterTitle: 'רכישת מודולר מערכות' },
      ],
      status: 'confirmed',
      createdBy: userId,
    },
    {
      firstName: 'דנה',
      lastName: 'שפירא',
      email: 'dana.shapira@azurim.co.il',
      phone: '+972-3-555-1234',
      company: 'אזורים קבוצת השקעות',
      title: 'מנכ"לית',
      position: 'Chief Executive Officer',
      relationshipType: 'client',
      relationshipYears: 12,
      matterReferences: [
        { matterId: matters[3]._id, matterTitle: 'פרויקט פארק הים הרצליה' },
      ],
      status: 'confirmed',
      createdBy: userId,
    },
    {
      firstName: 'יונתן',
      lastName: 'גולדברג',
      email: 'jonathan@fintechsolutions.io',
      phone: '+972-52-888-9999',
      company: 'FinTech Solutions',
      title: 'Founder & CEO',
      position: 'מייסד ומנכ"ל',
      relationshipType: 'client',
      relationshipYears: 5,
      matterReferences: [
        { matterId: matters[2]._id, matterTitle: 'סבב גיוס C' },
      ],
      status: 'confirmed',
      createdBy: userId,
    },
    {
      firstName: 'רן',
      lastName: 'כרמלי',
      email: 'ran.carmeli@viola.vc',
      phone: '+972-3-684-1000',
      company: 'Viola Ventures',
      title: 'General Partner',
      position: 'שותף כללי',
      relationshipType: 'client',
      relationshipYears: 10,
      matterReferences: [
        { matterId: matters[2]._id, matterTitle: 'השקעה ב-FinTech Solutions' },
      ],
      status: 'contacted',
      createdBy: userId,
    },
    {
      firstName: 'מיכאל',
      lastName: 'וייס',
      email: 'michael.weiss@leumi.co.il',
      phone: '+972-3-514-8000',
      company: 'בנק לאומי',
      title: 'יועץ משפטי',
      position: 'General Counsel',
      relationshipType: 'client',
      relationshipYears: 6,
      matterReferences: [
        { matterId: matters[8]._id, matterTitle: 'מימון פרויקט אנרגיה סולארית' },
      ],
      status: 'confirmed',
      createdBy: userId,
    },
    {
      firstName: 'שרון',
      lastName: 'אלוני',
      email: 'sharon.aloni@cyberstart.io',
      phone: '+972-54-666-7777',
      company: 'CyberStart',
      title: 'Co-founder & CTO',
      position: 'מייסדת שותפה וסמנכ"לית טכנולוגיות',
      relationshipType: 'client',
      relationshipYears: 4,
      matterReferences: [
        { matterId: matters[9]._id, matterTitle: 'Exit לפאלו אלטו' },
      ],
      status: 'confirmed',
      createdBy: userId,
    },
    {
      firstName: 'עודד',
      lastName: 'רביב',
      email: 'oded.raviv@telecom-il.co.il',
      phone: '+972-3-500-1000',
      company: 'תשתיות טלקום ישראל',
      title: 'סמנכ"ל משפטי',
      position: 'VP Legal',
      relationshipType: 'client',
      relationshipYears: 7,
      matterReferences: [
        { matterId: matters[4]._id, matterTitle: 'תביעה ייצוגית - הגנה' },
      ],
      status: 'pending',
      createdBy: userId,
    },
    {
      firstName: 'איילת',
      lastName: 'שניידר',
      email: 'ayelet@onedigitalbank.co.il',
      phone: '+972-52-333-4444',
      company: 'One Digital Bank',
      title: 'מנכ"לית',
      position: 'CEO',
      relationshipType: 'client',
      relationshipYears: 3,
      matterReferences: [
        { matterId: matters[5]._id, matterTitle: 'מיזוג בנקים דיגיטליים' },
      ],
      status: 'contacted',
      createdBy: userId,
    },
  ]);
  console.log(`✅ Seeded ${referees.length} referees`);

  // Seed Submissions
  const submissions = await submissionModel.insertMany([
    {
      title: "Dun's 100 2026 - היי-טק",
      rankingType: 'department',
      targetDirectories: ['duns_100'],
      status: 'in_progress',
      year: 2026,
      departmentName: 'high_tech',
      practiceArea: 'high_tech',
      matterIds: [matters[0]._id, matters[2]._id, matters[9]._id],
      lawyerAttributions: [
        { lawyerId: lawyers[1]._id, name: 'מיכל לוי', role: 'lead', title: 'שותפה בכירה', practiceArea: 'high_tech' },
        { lawyerId: lawyers[6]._id, name: 'אלון ברקוביץ', role: 'supporting', title: 'עורך דין בכיר', practiceArea: 'high_tech' },
      ],
      createdBy: userId,
      submissionDeadline: new Date('2026-11-10'),
    },
    {
      title: "Dun's 100 2026 - נדל\"ן",
      rankingType: 'department',
      targetDirectories: ['duns_100'],
      status: 'review',
      year: 2026,
      departmentName: 'real_estate',
      practiceArea: 'real_estate',
      matterIds: [matters[3]._id],
      lawyerAttributions: [
        { lawyerId: lawyers[3]._id, name: 'רונית אברהם', role: 'lead', title: 'שותפה', practiceArea: 'real_estate' },
      ],
      createdBy: userId,
      submissionDeadline: new Date('2026-11-10'),
    },
    {
      title: 'Chambers 2026 - Corporate/M&A',
      rankingType: 'department',
      targetDirectories: ['chambers'],
      status: 'in_progress',
      year: 2026,
      departmentName: 'corporate',
      practiceArea: 'corporate',
      matterIds: [matters[0]._id, matters[5]._id],
      lawyerAttributions: [
        { lawyerId: lawyers[0]._id, name: 'יוסי כהן', role: 'lead', title: 'שותף מנהל', practiceArea: 'corporate' },
      ],
      createdBy: userId,
      submissionDeadline: new Date('2026-03-15'),
    },
    {
      title: 'Legal 500 2026 - TMT',
      rankingType: 'department',
      targetDirectories: ['legal_500'],
      status: 'draft',
      year: 2026,
      departmentName: 'high_tech',
      practiceArea: 'high_tech',
      matterIds: [matters[9]._id],
      createdBy: userId,
      submissionDeadline: new Date('2026-04-30'),
    },
    {
      title: "Dun's 100 2026 - ליטיגציה",
      rankingType: 'department',
      targetDirectories: ['duns_100'],
      status: 'approved',
      year: 2026,
      departmentName: 'litigation',
      practiceArea: 'litigation',
      matterIds: [matters[4]._id],
      lawyerAttributions: [
        { lawyerId: lawyers[2]._id, name: 'דוד שמעוני', role: 'lead', title: 'שותף בכיר', practiceArea: 'litigation' },
      ],
      createdBy: userId,
      submissionDeadline: new Date('2026-11-10'),
      approvedAt: new Date('2026-02-15'),
    },
  ]);
  console.log(`✅ Seeded ${submissions.length} submissions`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`
Summary:
- ${lawyers.length} lawyers
- ${matters.length} matters
- ${referees.length} referees
- ${submissions.length} submissions
  `);

  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
