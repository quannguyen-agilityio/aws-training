/**
 * ============================================================================
 * AMPLIFY GEN 2 - AUTHENTICATION UTILITIES (@aws-amplify/auth)
 * ============================================================================
 * Handles authentication helper functions using AWS Amplify Gen 2 Auth APIs.
 * Functions:
 *  - getAuthHeader(): Fetches JWT ID Token from active Cognito session for API Gateway authorization header.
 *  - checkAuthSession(): Validates current Cognito user session state.
 *  - loginUser(): Signs in user via Cognito User Pool configured in Amplify Gen 2.
 *  - logoutUser(): Signs out user and invalidates current session.
 */

import { signIn, signOut, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';

/**
 * Retrieves the authorization header containing the Cognito JWT ID Token for Gen 2 API Gateway requests.
 */
export async function getAuthHeader() {
  try {
    const session = await fetchAuthSession();
    // API Gateway Cognito Authorizer requires ID Token (containing 'aud' claim matching Client ID)
    const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
    if (token) {
      console.log('[Amplify Gen 2 Auth] Successfully extracted JWT ID Token for Authorization header.');
      return { Authorization: `Bearer ${token}` };
    }
    console.warn('[Amplify Gen 2 Auth] No active tokens found in Cognito session.');
  } catch (err) {
    console.error('[Amplify Gen 2 Auth] Error fetching Auth session tokens:', err);
  }
  return {};
}

/**
 * Checks if a valid user session exists in Amplify Gen 2 Cognito User Pool.
 */
export async function checkAuthSession() {
  try {
    const user = await getCurrentUser();
    if (user) {
      return true;
    }
  } catch {
    const sessionAuth = sessionStorage.getItem('apex_admin_auth');
    return sessionAuth === 'true';
  }
  return false;
}

/**
 * Authenticates user credentials against Amplify Gen 2 Cognito User Pool.
 */
export async function loginUser(username, password) {
  await signIn({ username, password });
  return { success: true, mode: 'cognito' };
}

/**
 * Signs out active user from Amplify Gen 2 Cognito session.
 */
export async function logoutUser() {
  try {
    await signOut();
  } catch (err) {
    console.warn('[Amplify Gen 2 Auth] Amplify signOut error:', err);
  }
}
