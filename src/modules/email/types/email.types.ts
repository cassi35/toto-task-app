type emailType = 'welcome' | 'sendtoken' | 'sendForgotPassowrdToken';
export type EmailJob = {
  type: emailType;
  data: {
    email: string;
    token?: string;
    name?: string;
    resetUrl?: string;
    expiresIn?: string;
  };
};
