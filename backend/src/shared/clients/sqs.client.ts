import { SQSClient } from '@aws-sdk/client-sqs';
import { config } from '@config/environment.js';

export const sqsClient = new SQSClient({ region: config.awsRegion });
