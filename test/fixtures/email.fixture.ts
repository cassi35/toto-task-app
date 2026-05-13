export const sendEmailDtoFixture = {
  to: 'receiver@example.com',
  subject: 'Welcome',
  template: 'welcome',
  context: {
    name: 'Receiver',
  },
};

export const sendMailResultFixture = {
  accepted: ['receiver@example.com'],
  rejected: [],
  response: '250 OK',
};
