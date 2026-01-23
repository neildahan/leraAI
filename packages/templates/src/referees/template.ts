import { TemplateDefinition } from '../types.js';

export const RefereeSpreadsheetTemplate: TemplateDefinition = {
  id: 'referees-2024',
  name: 'Referee Spreadsheet',
  type: 'custom',
  description: 'Client referee contact list for directory submissions',
  outputFormat: 'xlsx',
  version: '2024',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
    },
    {
      name: 'company',
      label: 'Company/Organization',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      label: 'Job Title',
      type: 'text',
      required: false,
    },
    {
      name: 'position',
      label: 'Position',
      type: 'text',
      required: false,
    },
    {
      name: 'relationshipType',
      label: 'Relationship Type',
      type: 'select',
      required: true,
      options: ['Client', 'Co-counsel', 'Opposing counsel', 'Expert witness', 'Other'],
    },
    {
      name: 'relationshipYears',
      label: 'Years Known',
      type: 'number',
      required: false,
    },
    {
      name: 'mattersDiscuss',
      label: 'Matters They Can Discuss',
      type: 'textarea',
      required: true,
    },
    {
      name: 'speakingPoints',
      label: 'Key Speaking Points',
      type: 'textarea',
      required: false,
    },
    {
      name: 'practiceAreas',
      label: 'Practice Areas',
      type: 'textarea',
      required: false,
    },
    {
      name: 'contactStatus',
      label: 'Contact Status',
      type: 'select',
      required: true,
      options: ['Pending', 'Contacted', 'Confirmed', 'Declined'],
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
    },
  ],
};

// Chambers-specific referee format
export const ChambersRefereeTemplate: TemplateDefinition = {
  id: 'chambers-referees-2024',
  name: 'Chambers Referee Spreadsheet',
  type: 'chambers',
  description: 'Referee spreadsheet formatted for Chambers and Partners',
  outputFormat: 'xlsx',
  version: '2024',
  fields: [
    {
      name: 'refereeName',
      label: 'Referee Name',
      type: 'text',
      required: true,
    },
    {
      name: 'refereeOrganization',
      label: 'Organization',
      type: 'text',
      required: true,
    },
    {
      name: 'refereeRole',
      label: 'Role/Title',
      type: 'text',
      required: true,
    },
    {
      name: 'refereeEmail',
      label: 'Email',
      type: 'text',
      required: true,
    },
    {
      name: 'refereePhone',
      label: 'Phone',
      type: 'text',
      required: true,
    },
    {
      name: 'mattersInvolved',
      label: 'Matters Involved In',
      type: 'textarea',
      required: true,
    },
    {
      name: 'lawyersWorkedWith',
      label: 'Lawyers Worked With',
      type: 'textarea',
      required: true,
    },
    {
      name: 'yearsWorking',
      label: 'Years Working Together',
      type: 'number',
      required: false,
    },
    {
      name: 'refereeType',
      label: 'Referee Type',
      type: 'select',
      required: true,
      options: ['Client', 'Peer', 'Co-counsel', 'Market Source'],
    },
  ],
};

// Legal 500 specific referee format
export const Legal500RefereeTemplate: TemplateDefinition = {
  id: 'legal500-referees-2024',
  name: 'Legal 500 Referee Spreadsheet',
  type: 'legal_500',
  description: 'Referee spreadsheet formatted for Legal 500',
  outputFormat: 'xlsx',
  version: '2024',
  fields: [
    {
      name: 'contactName',
      label: 'Contact Name',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      required: true,
    },
    {
      name: 'jobTitle',
      label: 'Job Title',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'text',
      required: true,
    },
    {
      name: 'telephone',
      label: 'Telephone',
      type: 'text',
      required: false,
    },
    {
      name: 'practiceArea',
      label: 'Practice Area (for feedback)',
      type: 'text',
      required: true,
    },
    {
      name: 'workHighlights',
      label: 'Work Highlights They Can Discuss',
      type: 'textarea',
      required: true,
    },
    {
      name: 'lawyerNames',
      label: 'Lawyer Names They Can Comment On',
      type: 'textarea',
      required: true,
    },
    {
      name: 'relationship',
      label: 'Relationship to Firm',
      type: 'select',
      required: true,
      options: ['Current client', 'Former client', 'Peer', 'Counterparty'],
    },
  ],
};
