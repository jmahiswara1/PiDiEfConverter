import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind classes with clsx and tailwind-merge
 */
export function cx(...inputs) {
    return twMerge(clsx(inputs))
}
