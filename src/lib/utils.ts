import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge class names using clsx and tailwind-merge
 * 
 * This function takes multiple class name inputs and merges them into a single
 * string, handling conflicts properly using tailwind-merge and supporting
 * conditional class application with clsx.
 * 
 * @param {...ClassValue[]} inputs - Multiple class name inputs to be merged
 * @returns {string} The merged class name string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
