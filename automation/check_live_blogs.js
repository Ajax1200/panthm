async function checkBlogs() {
  try {
    const res = await fetch("https://panthm-backend.vercel.app/api/blogs/published?page=1&limit=9");
    const data = await res.json();
    console.log("Success:", data.success);
    console.log("Total Count:", data.totalCount);
    console.log("Total Pages:", data.totalPages);
    console.log("Current Page:", data.currentPage);
    console.log("Blogs length:", data.blogs ? data.blogs.length : 'none');
    if (data.blogs) {
      data.blogs.forEach((b, i) => {
        console.log(`${i+1}: ${b.title} (slug: ${b.slug}, date: ${b.publishDate || b.createdAt}, category: ${b.categoryId?.name})`);
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkBlogs();
