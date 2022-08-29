import axios, { AxiosRequestConfig } from 'axios';
import { appConfig } from './config';
import createAccount from './create-account';
import isBusinessDomain from './is-business-domain';

const getJwt = async (): Promise<string> => {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${appConfig.cloud.authSchedulerEnvConfig.clientId}:${appConfig.cloud.authSchedulerEnvConfig.clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appConfig.cloud.authSchedulerEnvConfig.clientId,
      }),
    };

    const response = await axios.post(
      appConfig.cloud.authSchedulerEnvConfig.tokenUrl,
      undefined,
      config
    );
    const jsonResponse = response.data;
    if (response.status !== 200) throw new Error(jsonResponse.message);
    if (!jsonResponse.access_token)
      throw new Error('Did not receive an access token');
    return jsonResponse.access_token;
  } catch (error: unknown) {
    if (typeof error === 'string') return Promise.reject(error);
    if (error instanceof Error) return Promise.reject(error.message);
    return Promise.reject(new Error('Unknown error occured'));
  }
};

// eslint-disable-next-line import/prefer-default-export
export const handler = async (
  event: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: any
): Promise<void> => {
  try {
    const { userName } = event;
    const { email } = event.request.userAttributes;
    const providedDomain = email.split('@')[1];

    const domainValid = await isBusinessDomain(providedDomain);

    if (!domainValid)
      callback(`--> Please sign up with a business email address`, event);
    else {
      const jwt = await getJwt();

      await createAccount(userName, jwt);

      callback(null, event);
    }
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if (error instanceof Error) console.error(error.message);
  }
};
