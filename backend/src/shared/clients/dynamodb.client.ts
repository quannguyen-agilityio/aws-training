import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '@config/environment.js';

const ddbRawClient = new DynamoDBClient({ region: config.awsRegion });

export const docClient = DynamoDBDocumentClient.from(ddbRawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
