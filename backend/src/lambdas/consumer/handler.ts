export async function handler(event: { Records?: Array<{ messageId: string; body: string }> }) {
  const records = event.Records || [];
  console.log(`[Consumer Lambda] Processing batch of ${records.length} SQS records.`);

  const batchItemFailures: Array<{ itemIdentifier: string }> = [];

  for (const record of records) {
    try {
      console.log(`[Consumer Lambda] Processing SQS Record ID: ${record.messageId}`);
    } catch (err) {
      console.error(`[Consumer Lambda] Failed to process record ${record.messageId}:`, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
