import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Player: a
    .model({
      name: a.string().required(),
      position: a.string().required(),
      jerseyNumber: a.integer(),
      team: a.string(),
      bio: a.string(),
      avatarUrl: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']), // Public guests can read only
      allow.authenticated(), // Authenticated admin have full access
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
