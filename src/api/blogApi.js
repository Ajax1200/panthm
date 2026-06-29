const API_BASE_URL = "https://api.panthm.com";

/**
 * Fetch published blogs with pagination and optional category filter
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Blogs per page
 * @param {string} [category] - Optional category name filter
 * @returns {Promise<{success: boolean, blogs: Array, totalCount: number, currentPage: number, totalPages: number}>}
 */
export const fetchPublishedBlogsPaginated = async (page = 1, limit = 9, category = "", search = "") => {
  const params = new URLSearchParams({ page, limit });
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  const response = await fetch(`${API_BASE_URL}/api/blogs/published?${params}`);
  if (!response.ok) throw new Error("Failed to fetch published blogs");
  return response.json();
};

/**
 * Fetch all published blogs (used by homepage slider — no pagination)
 * @returns {Promise<{success: boolean, blogs: Array}>}
 */
export const fetchPublishedBlogs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/blogs/published?limit=6`);
  if (!response.ok) throw new Error("Failed to fetch published blogs");
  return response.json();
};

/**
 * Fetch a single blog by slug
 * @param {string} slug - The blog slug
 * @returns {Promise<{success: boolean, blog: Object}>}
 */
export const fetchBlogBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/api/blogs/slug/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch blog");
  return response.json();
};

