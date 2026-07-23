// AWS Amplify Gen 1 Configuration Mapping
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-southeast-2_ApexAuthId',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'apexathletesclient12345',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      ApexApi: {
        endpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.apexathletes.com/dev',
        region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-2',
      },
    },
  },
};

export default awsConfig;
