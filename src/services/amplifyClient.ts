import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

/**
 * Singleton instance of the AWS Amplify Data Client.
 * Used throughout the app to execute GraphQL API queries and mutations.
 */
export const dataClient = generateClient<Schema>();
