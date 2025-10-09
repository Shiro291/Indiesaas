import { NextRequest } from "next/server";
import { verifyAdminSecret } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * POST /api/admin/login
 * 
 * Authenticate admin access using secret key
 * 
 * @param {NextRequest} request - The incoming request object containing admin credentials
 * @returns {Response} A JSON response indicating authentication success or failure
 * 
 * Request Body:
 * - email: Admin email (not used in current implementation)
 * - password: Admin password (not used in current implementation)
 * - secretKey: Admin secret key for authentication
 * 
 * Response:
 * - 200: Success - Returns success message and verification status
 * - 403: Forbidden - Invalid secret key
 * - 500: Server error - Returns error message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, secretKey } = body;

    // Verify the secret key first
    if (!verifyAdminSecret(secretKey)) {
      return Response.json({ error: "Invalid secret key" }, { status: 403 });
    }

    // In a real application, you would authenticate the admin user
    // For this implementation, we'll assume the secret key is the main security
    // and proceed with normal authentication
    
    // This would typically be a call to the auth system
    // Since we're using Better Auth, we can't directly authenticate with email/password here
    // Instead, we'll check the secret key and let the frontend handle the rest
    return Response.json({ 
      success: true,
      message: "Admin access verified" 
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    return Response.json({ error: "Failed to verify admin access" }, { status: 500 });
  }
}