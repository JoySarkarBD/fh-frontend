"use client";

import { useEffect } from "react";
import { useGetArticleById } from "@/actions/hooks/article.hooks";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// export default function BlogDetailsPage() {

export default function BlogDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: article, isLoading, isError, error } = useGetArticleById(id);
  // Ensure Quill's CSS is loaded for details page rendering
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !document.querySelector('link[href*="quill.snow.css"]')
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/quill@2.0.0/dist/quill.snow.css";
      document.head.appendChild(link);
    }
  }, []);

  // const stripHtml = (value: string): string => {
  //   if (!value) return "";
  //   if (typeof window === "undefined") {
  //     return value
  //       .replace(/<[^>]*>/g, " ")
  //       .replace(/\s+/g, " ")
  //       .trim();
  //   }

  //   const temp = document.createElement("div");
  //   temp.innerHTML = value;
  //   return (temp.textContent || temp.innerText || "")
  //     .replace(/\s+/g, " ")
  //     .trim();
  // };

  const formatDate = (raw?: string): string => {
    if (!raw) return "";

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isUsableUrl = (value: unknown): value is string =>
    typeof value === "string" &&
    (value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/"));

  const imageUrl: string = (() => {
    if (!article) return "/blog.jpg";

    if (typeof article.image === "object") {
      const imageValue = article.image?.image;
      return isUsableUrl(imageValue) ? imageValue : "/blog.jpg";
    }

    return isUsableUrl(article.image) ? article.image : "/blog.jpg";
  })();

  const displayDate = formatDate(article?.publishDate || article?.createdAt);

  return (
    <section className='md:mx-12.5 px-6 lg:px-8 md:px-8 py-10 md:py-14'>
      <div className='mb-6'>
        <Link href='/blog' className='text-sm underline text-[#5F8E7E]'>
          Back to all articles
        </Link>
      </div>

      {isLoading && <div className='text-center py-10'>Loading article...</div>}

      {isError && (
        <div className='text-center py-10 text-red-600'>
          {error instanceof Error ? error.message : "Failed to load article."}
        </div>
      )}

      {!isLoading && !isError && article && (
        <article className='rounded-xl border border-[#D1CEC6] overflow-hidden bg-white'>
          <div className='relative w-full h-72 md:h-136'>
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className='object-cover'
            />
          </div>

          <div className='p-6 md:p-8'>
            <div className='flex flex-wrap items-center gap-3 mb-4'>
              <span className='text-xs px-3 py-1 rounded-full bg-[#f0f6f3] text-[#4e7a6c] font-medium'>
                {article.category}
              </span>
              {displayDate && (
                <span className='text-sm text-gray-500'>{displayDate}</span>
              )}
            </div>

            <h1 className='text-3xl md:text-4xl font-semibold mb-5'>
              {article.title}
            </h1>

            {/* <p className='text-sm text-gray-500 mb-5'>
              {stripHtml(article.blogDetails)}
            </p> */}

            <div
              className='prose max-w-none prose-p:leading-7 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base prose-ul:list-disc prose-ol:list-decimal prose-li:ml-6 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:mx-auto prose-table:w-full prose-table:my-4 prose-th:bg-gray-100 prose-th:p-2 prose-td:p-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-strong:font-semibold prose-em:italic prose-a:text-blue-600 prose-a:underline prose-a:break-all prose-p:mb-4 prose-p:text-base prose-p:text-gray-700'
              dangerouslySetInnerHTML={{ __html: article.blogDetails }}
            />
          </div>
        </article>
      )}
    </section>
  );
}
