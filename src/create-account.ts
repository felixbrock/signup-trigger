import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';

interface AccountPrototypeDto {
  userId: string;
  organizationId: string;
}

export interface AccountDto {
  id: string;
  userId: string,
  organizationId: string;
}

export interface OrganizationDto {
  name: string;
}

export default async (username: string, jwt: string): Promise<void> => {
  try {
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${jwt}` },
    };

    const organizationPayload: OrganizationDto = {
      name: crypto.randomUUID(),
    };

    const accountServiceUrl = 'https://p2krek4fsj.execute-api.eu-central-1.amazonaws.com/production';
    const apiRoot = 'api/v1';

    const readAccountsConfig: AxiosRequestConfig = {...config, params: new URLSearchParams({userId: username})};

    const readAccountsResponse = await axios.get(
      `${accountServiceUrl}/${apiRoot}/accounts`,
      readAccountsConfig
    );

    if (readAccountsResponse.status !== 200)
    throw new Error(`Failed to read users`);

    const jsonResponse: AccountDto[] = readAccountsResponse.data;

    if(jsonResponse.length) throw new Error(`Account for user ${username} already exists`);

    const createOrganizationResponse = await axios.post(
      `${accountServiceUrl}/${apiRoot}/organization`,
      // `http://localhost:8081/api/v1/organization`,
      organizationPayload,
      config
    );

    if (createOrganizationResponse.status !== 201)
      throw new Error(`Failed ot create organization for ${username}`);

    const accountPayload: AccountPrototypeDto = {
      userId: username,
      organizationId: createOrganizationResponse.data,
    };

    const createAccountResponse = await axios.post(
      `${accountServiceUrl}/${apiRoot}/account`,
      // `http://localhost:8081/api/v1/account`,
      accountPayload,
      config
    );

    if (createAccountResponse.status !== 201)
      throw new Error(`Failed ot create account for ${username}`);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if(error instanceof Error) console.error(error.message);
    throw new Error('Account creation failed');
  }
};
