import { db } from "@/database/db"
import { categories } from "@/database/schema"
import { eq, inArray } from "drizzle-orm"

interface CreateCategoryRequest {
    name: string
    description?: string
}

interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    id: number
}

export class CategoryService {
    /**
     * Create a new category
     */
    async createCategory(request: CreateCategoryRequest) {
        const [newCategory] = await db
            .insert(categories)
            .values({
                name: request.name,
                description: request.description,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning()

        return newCategory
    }

    /**
     * Update an existing category
     */
    async updateCategory(request: UpdateCategoryRequest) {
        const [updatedCategory] = await db
            .update(categories)
            .set({
                name: request.name,
                description: request.description,
                updatedAt: new Date()
            })
            .where(eq(categories.id, request.id))
            .returning()

        return updatedCategory
    }

    /**
     * Get all categories
     */
    async getCategories() {
        return await db.query.categories.findMany({
            orderBy: (categories, { asc }) => [asc(categories.name)]
        })
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: number) {
        return await db.query.categories.findFirst({
            where: eq(categories.id, id)
        })
    }

    /**
     * Delete a category
     */
    async deleteCategory(id: number) {
        await db.delete(categories).where(eq(categories.id, id))
    }

    /**
     * Get categories by IDs
     */
    async getCategoriesByIds(ids: number[]) {
        return await db.query.categories.findMany({
            where: inArray(categories.id, ids)
        })
    }
}

export const categoryService = new CategoryService()
