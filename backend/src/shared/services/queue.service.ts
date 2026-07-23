import { SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { sqsClient } from '@shared/clients/sqs.client.js';
import { config } from '@config/environment.js';
import { PlayerRegistrationPayload } from '@shared/types/player.types.js';

export class QueueService {
  private queueUrl: string;

  constructor(queueUrl = config.sqsQueueUrl) {
    this.queueUrl = queueUrl;
  }

  async enqueuePlayerRegistration(payload: PlayerRegistrationPayload): Promise<string> {
    if (!this.queueUrl) {
      throw new Error('SQS Queue URL configuration missing.');
    }

    const sendParams: SendMessageCommandInput = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(payload),
    };

    if (this.queueUrl.endsWith('.fifo')) {
      sendParams.MessageDeduplicationId = payload.eventId;
      sendParams.MessageGroupId = payload.teamId;
    }

    const result = await sqsClient.send(new SendMessageCommand(sendParams));
    return result.MessageId || '';
  }
}

export const queueService = new QueueService();
