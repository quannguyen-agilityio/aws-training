import { signIn, signOut, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';

export async function getAuthHeader() {
  try {
    const session = await fetchAuthSession();
    // API Gateway Cognito Authorizer requires ID Token (containing 'aud' claim matching Client ID)
    const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
    if (token) {
      console.log('[Auth] Successfully extracted JWT ID Token for Authorization header.');
      return { Authorization: `Bearer ${token}` };
    }
    console.warn('[Auth] No active tokens found in Cognito session.');
  } catch (err) {
    console.error('[Auth] Error fetching Auth session tokens:', err);
  }
  return {};
}

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

export async function loginUser(username, password) {
  await signIn({ username, password });
  return { success: true, mode: 'cognito' };
}

export async function logoutUser() {
  try {
    await signOut();
  } catch (err) {
    console.warn('[Auth] Amplify signOut error:', err);
  }
}
