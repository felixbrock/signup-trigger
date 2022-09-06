import isBusinessDomain from './is-business-domain';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (
  event: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: any
): Promise<void> => {
  try {
    const { email } = event.request.userAttributes;
    const providedDomain = email.split('@')[1];

    const domainValid = await isBusinessDomain(providedDomain);

    if (!domainValid){
      callback(`--> Please sign up with a business email address`, event);
      return;
    }
        
      callback(null, event);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if (error instanceof Error) console.error(error.message);
    console.error('Unknown error occurred');
  }
};
