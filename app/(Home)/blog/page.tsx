"use client";

import { useArticles } from "@/actions/hooks/article.hooks";
import BlogCard from "@/components/blog/BlogCard";
import PageTitle from "@/components/shared/pagetitle/PageTitle";
import { articleToBlog } from "@/services/article";

const Page = () => {
  const { data, isLoading, isError, error } = useArticles();
  const blogs = (data?.data ?? []).map(articleToBlog);

  return (
    <div>
      <PageTitle
        title='Blog and Articles'
        subtitle='Insights and tips from our experts'
      />
      <div className='max-w-460 mx-auto px-8 mt-8 my-12'>
        {isLoading && (
          <div className='text-center py-6'>Loading articles...</div>
        )}
        {isError && (
          <div className='text-center py-6 text-red-600'>
            {error instanceof Error
              ? error.message
              : "Failed to load articles."}
          </div>
        )}
        {!isLoading && !isError && blogs.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>No Articles</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 justify-between lg:grid-cols-4'>
            {blogs.map((blog) => (
              <BlogCard blog={blog} key={blog.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
