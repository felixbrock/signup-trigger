import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { appConfig } from './config';

export interface AccountDto {
  userId: string;
  organizationId: string;
  // eslint-disable-next-line semi
}

export interface OrganizationDto {
  name: string;
}

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

export const handler = async (
  event: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: any
): Promise<void> => {
  try {

    const { userName } = event;

    const jwt = await getJwt();
    
    console.log(jwt);
    
    

    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${jwt}` },
    };

    const organizationPayload: OrganizationDto = {
      name: crypto.randomUUID()
    };

    const createOrganizationResponse = await axios.post(
      `https://p2krek4fsj.execute-api.eu-central-1.amazonaws.com/production/api/v1/organization`,
      // `http://localhost:8081/api/v1/organization`,
      organizationPayload,
      config
    );

    if (createOrganizationResponse.status !== 201) console.warn(`Failed ot create organization for ${userName}`);
   
    const accountPayload: AccountDto = {
      userId: userName,
      organizationId: createOrganizationResponse.data,
    };

    const createAccountResponse = await axios.post(
      `https://p2krek4fsj.execute-api.eu-central-1.amazonaws.com/production/api/v1/account`,
      // `http://localhost:8081/api/v1/account`,
      accountPayload,
      config
    );

    if (createAccountResponse.status !== 201) console.warn(`Failed ot create account for ${userName}`);
    callback(null, event);
  } catch (error: any) {
    console.error(error.response.data.message);
  }
};


