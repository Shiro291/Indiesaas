import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * The admin secret key used for admin authentication
 * 
 * @type {string}
 */
export const ADMIN_SECRET_KEY = "13June2003";

/**
 * Check if the current user is an admin
 * 
 * This function checks if the current user is authenticated and potentially an admin
 * 
 * @returns {Promise<boolean>} A boolean indicating whether the user is an admin
 * 
 * @todo In a real implementation, this should check if the user has an admin role in the database
 */
export async function isAdmin(): Promise<boolean> {
  // First check if user is authenticated
  const cookieStore = cookies();
  const headersInstance = new Headers();
  headersInstance.append('cookie', cookieStore.toString());
  
  const session = await auth.api.getSession({
    headers: headersInstance
  });

  if (!session) {
    return false;
  }

  // In a real implementation, you might want to check if the user has an admin role
  // For now, we'll just return true if they're authenticated
  // The actual admin check with secret key would happen during the login process
  return true; // This will be updated to check for actual admin role
}

/**
 * Verify admin access using the secret key
 * 
 * This function checks if the provided secret key matches the admin secret key
 * 
 * @param {string} secretKey - The secret key to verify
 * @returns {boolean} A boolean indicating whether the secret key is valid
 */
export function verifyAdminSecret(secretKey: string): boolean {
  return secretKey === ADMIN_SECRET_KEY;
}

/**
 * Check admin access with secret key
 * 
 * This function verifies both the secret key and the user's authentication status
 * 
 * @param {string} secretKey - The secret key to verify
 * @returns {Promise<boolean>} A boolean indicating whether the admin access is valid
 */
export async function checkAdminAccess(secretKey: string): Promise<boolean> {
  if (!verifyAdminSecret(secretKey)) {
    return false;
  }

  return await isAdmin();
}