import axios from 'axios';

export default async (domain: string): Promise<boolean> => {
  try {
    const publicEmailProviderResponse = await axios.get(
      `https://gist.githubusercontent.com/tbrianjones/5992856/raw/93213efb652749e226e69884d6c048e595c1280a/free_email_provider_domains.txt`
    );

    if (publicEmailProviderResponse.status !== 200)
      throw new Error(`Failed to retrieve list of public email providers`);

    const { data } = publicEmailProviderResponse;

    if (typeof data !== 'string')
      throw new Error('Unexpected domain list format');

    const publicDomains = data.split('\n');

    return !publicDomains.includes(domain);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if(error instanceof Error) console.error(error.message);
    throw new Error('Error occured when checking email domain');
  }
};
