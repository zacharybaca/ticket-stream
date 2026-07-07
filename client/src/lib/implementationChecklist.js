export const implementationChecklistSections = [
  {
    title: 'Project foundation',
    description: 'Stand up the shared baseline before feature work starts.',
    tasks: [
      'Confirm product goals, user roles, and the initial incident workflow.',
      'Set up the client and server environments with working local development scripts.',
      'Define the MongoDB data model for users, incidents, comments, and status history.',
      'Document the API contracts needed between the React UI and Express services.',
    ],
  },
  {
    title: 'Authentication and access control',
    description: 'Make sure the workspace is protected before exposing operations data.',
    tasks: [
      'Implement registration, login, logout, and session persistence with JWT cookies.',
      'Add protected client routes so only authenticated users can reach incident pages.',
      'Create role-aware middleware for administrators, responders, and observers.',
      'Verify validation, rate limiting, and error handling across auth endpoints.',
    ],
  },
  {
    title: 'Incident creation workflow',
    description: 'Enable teams to report and categorize incidents consistently.',
    tasks: [
      'Build the create-incident form with fields for summary, severity, priority, and ownership.',
      'Validate required inputs on both the client and server before saving records.',
      'Persist new incidents with an initial timeline entry that captures who created them.',
      'Return clear success and failure states so the UI can guide the reporter.',
    ],
  },
  {
    title: 'Dashboard and triage experience',
    description: 'Give operators a fast view of active work and overall system state.',
    tasks: [
      'Create dashboard summary cards for open volume, priority mix, and status counts.',
      'Add filtering for search, status, severity, priority, and assignee ownership.',
      'Render a responsive incident table that links directly to the detail workflow.',
      'Keep the dashboard data in sync after creates, status changes, and assignments.',
    ],
  },
  {
    title: 'Incident detail collaboration',
    description: 'Support the day-to-day actions responders need after triage.',
    tasks: [
      'Show incident metadata, customer impact, assignee, and the full activity timeline.',
      'Allow status transitions with required notes for key lifecycle updates.',
      'Support comments and assignment changes so teams can coordinate in context.',
      'Record each change in the timeline to preserve a complete operational history.',
    ],
  },
  {
    title: 'Quality, hardening, and release readiness',
    description: 'Finish with the checks needed to ship a reliable first release.',
    tasks: [
      'Add automated test coverage for authentication, incident APIs, and critical UI paths.',
      'Run linting, build validation, and regression checks before every release candidate.',
      'Review security controls such as cookie settings, authorization boundaries, and input sanitization.',
      'Prepare deployment configuration, environment documentation, and operational follow-up items.',
    ],
  },
];

const buildChecklistParagraphs = () =>
  implementationChecklistSections.flatMap((section) => [
    {
      type: 'heading',
      text: section.title,
    },
    {
      type: 'description',
      text: section.description,
    },
    ...section.tasks.map((task) => ({
      type: 'task',
      text: task,
    })),
  ]);

export const buildImplementationChecklistDocument = async () => {
  const { AlignmentType, Document, HeadingLevel, Paragraph, TextRun } =
    await import('docx');

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Ticket Stream Implementation Checklist',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'A step-by-step rollout checklist for implementing the incident management web application.',
            alignment: AlignmentType.CENTER,
            spacing: { after: 260 },
          }),
          ...buildChecklistParagraphs().map((entry) => {
            if (entry.type === 'heading') {
              return new Paragraph({
                text: entry.text,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 320, after: 120 },
              });
            }

            if (entry.type === 'description') {
              return new Paragraph({
                text: entry.text,
                spacing: { after: 180 },
              });
            }

            return new Paragraph({
              children: [new TextRun(`☐ ${entry.text}`)],
              spacing: { after: 100 },
            });
          }),
        ],
      },
    ],
  });
};

export const downloadImplementationChecklist = async () => {
  const { Packer } = await import('docx');
  const fileName = 'ticket-stream-implementation-checklist.docx';
  const checklistDocument = await buildImplementationChecklistDocument();
  const blob = await Packer.toBlob(checklistDocument);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);

  return fileName;
};
