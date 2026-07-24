import { API_URL, AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID } from './config.js';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID || 'us-east-1_DEFAULT',
      userPoolClientId: USER_POOL_CLIENT_ID || 'DEFAULT_CLIENT_ID',
      signUpVerificationMethod: 'code',
    },
  },
  API: {
    REST: {
      apexApi: {
        endpoint: API_URL || 'https://pexoimesc4.execute-api.ap-southeast-2.amazonaws.com/develop',
        region: AWS_REGION,
      },
    },
  },
};

export default awsConfig;
