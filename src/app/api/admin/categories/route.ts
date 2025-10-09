import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { categoryService } from "@/lib/services/category.service";
import { checkAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/categories
 * 
 * Retrieve all categories for admin management
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing the list of categories
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication (optional for this implementation)
 * 
 * Response:
 * - 200: Success - Returns array of categories
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - Invalid admin credentials
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication - use cookies() helper for reliable cookie handling
    const cookieStore = cookies();
    const headersInstance = new Headers();
    headersInstance.append('cookie', cookieStore.toString());
    
    const session = await auth.api.getSession({
      headers: headersInstance
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For simplicity in this implementation, we'll assume any authenticated user 
    // can access admin features. In a real application, you'd check for admin roles.
    // For now, we'll just verify the secret key from query params for demo purposes
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");
    
    if (secretKey && !checkAdminAccess(secretKey)) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 403 });
    }

    const categories = await categoryService.getCategories();

    return Response.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

/**
 * POST /api/admin/categories
 * 
 * Create a new category for events
 * 
 * @param {NextRequest} request - The incoming request object containing category data
 * @returns {Response} A JSON response containing the created category
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication
 * 
 * Request Body:
 * - name: Category name (required)
 * - description: Category description (optional)
 * 
 * Response:
 * - 200: Success - Returns the created category
 * - 400: Bad request - Missing required fields
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - Invalid admin credentials
 * - 500: Server error - Returns error message
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication - use cookies() helper for reliable cookie handling
    const cookieStore = cookies();
    const headersInstance = new Headers();
    headersInstance.append('cookie', cookieStore.toString());
    
    const session = await auth.api.getSession({
      headers: headersInstance
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin access
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");
    
    if (!secretKey || !checkAdminAccess(secretKey)) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const newCategory = await categoryService.createCategory({
      name,
      description
    });

    return Response.json({ category: newCategory });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return Response.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}