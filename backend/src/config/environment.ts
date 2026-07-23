export const config = {
  awsRegion: process.env.AWS_REGION || 'ap-southeast-2',
  sqsQueueUrl: process.env.SQS_QUEUE_URL || '',
  tableName: process.env.TABLE_NAME || 'PlayersDashboard-Data',
  senderEmail: process.env.SENDER_EMAIL || 'noreply@apexathletes.com',
};
