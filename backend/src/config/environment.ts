import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

export const config = {
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  tableName: process.env.TABLE_NAME || 'PlayersDashboard-Data',
  sqsQueueUrl: process.env.SQS_QUEUE_URL || '',
  senderEmail: process.env.SENDER_EMAIL || '',
};

export type AppConfig = typeof config;
