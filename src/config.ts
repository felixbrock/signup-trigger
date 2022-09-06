
import dotenv from 'dotenv';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const port = 7012;

// eslint-disable-next-line import/prefer-default-export
export const appConfig = {
  express: {
    port,
    mode,
  },
  cloud: {
    region: 'eu-central-1',
  },
};