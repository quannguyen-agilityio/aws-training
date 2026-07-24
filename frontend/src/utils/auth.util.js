import { signIn, signOut, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';

export async function getAuthHeader() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (err) {
    console.warn('No active Cognito Auth session:', err);
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
    console.warn('Amplify signOut error:', err);
  }
}
