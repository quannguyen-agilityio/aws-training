import { API_URL, AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID } from './config.js';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code',
    },
  },
  API: {
    REST: {
      apexApi: {
        endpoint: API_URL,
        region: AWS_REGION,
      },
    },
  },
};

export default awsConfig;
