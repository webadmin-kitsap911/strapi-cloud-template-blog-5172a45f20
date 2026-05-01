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
