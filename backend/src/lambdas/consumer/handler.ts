import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { processSqsRecord } from './processor.js';

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const records = event.Records || [];
  console.log(`[Consumer Lambda] Received batch of ${records.length} message(s).`);

  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of records) {
    try {
      await processSqsRecord(record);
    } catch (err) {
      console.error(`[Consumer Lambda] Error processing record ${record.messageId}:`, err);
      // Report failed item to SQS for partial batch retry
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
