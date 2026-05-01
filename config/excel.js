module.exports = {
  config: {
    'api::contact-submission.contact-submission': {
      columns: ['id', 'name', 'email', 'subject', 'message', 'createdAt'],
    },
    'api::public-records-request.public-records-request': {
      columns: [
        'id',
        'isMemberAgency',
        'submittorName',
        'submittorEmail',
        'submittorPhone',
        'submittorMailingAddress',
        'requestDate',
        'agencyCaseId',
        'otherInformation',
        'neededForCourt',
        'courtDeadline',
        'feeAcknowledgement',
        'createdAt',
      ],
      // Repeatable component fields - each will become a single column with semicolon-separated values
      components: {
        incidents: {
          // Format: "2024-03-15 | 123 Main St | Vehicle theft"
          format: (item) => [item.dateTime, item.location, item.description].filter(Boolean).join(' | '),
        },
        callerNames: {
          format: (item) => item.name,
        },
        officers: {
          // Format: "Officer Brown (#123)"
          format: (item) => item.idNumber ? `${item.name} (#${item.idNumber})` : item.name,
        },
        suspectNames: {
          format: (item) => item.name,
        },
      },
    },
    'api::tax-info-request.tax-info-request': {
      columns: [
        'id',
        'name',
        'phone',
        'email',
        'mailingAddress',
        'requestW2',
        'request1095C',
        'request1099',
        'taxYears',
        'otherInformation',
        'createdAt',
      ],
    },
  },
};
