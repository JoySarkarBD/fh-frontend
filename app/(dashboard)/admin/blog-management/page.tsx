"use client";

import {
  useArticles,
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useUpdateArticleMutation,
} from "@/actions/hooks/article.hooks";
import {
  ArticleCategory,
  IArticleResponse,
  articleToBlog,
} from "@/services/article";
import Card from "@/components/shared/Card/Card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiEdit3, FiTrash2, FiX } from "react-icons/fi";

const UploadCloud = () => (
  <svg
    width='28'
    height='28'
    viewBox='0 0 24 24'
    fill='none'
    stroke='#5a9e7c'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <polyline points='16 16 12 12 8 16' />
    <line x1='12' y1='12' x2='12' y2='21' />
    <path d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' />
  </svg>
);

type QuillInstance = {
  root?: { innerHTML?: string };
  setText?: (text: string) => void;
  clipboard?: {
    dangerouslyPasteHTML?: (html: string) => void;
  };
};

type QuillConstructor = new (
  el: HTMLElement,
  options?: Record<string, unknown>,
) => QuillInstance;

const CATEGORY_OPTIONS: Array<{ value: ArticleCategory; label: string }> = [
  { value: "SELLING_TIPS", label: "Selling Tips" },
  { value: "BUYING_GUIDE", label: "Buying Guide" },
  // Keep backend enum value as-is. Schema currently defines MARKET_ANALYSI.
  { value: "MARKET_ANALYSI", label: "Market Analysis" },
];

const formatDateForInput = (raw?: string): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const stripHtml = (value: string): string => {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const temp = document.createElement("div");
  temp.innerHTML = value;
  return (temp.textContent || temp.innerText || "").replace(/\s+/g, " ").trim();
};

const resolveArticleImagePreview = (
  article?: IArticleResponse | null,
): string | null => {
  if (!article) return null;
  const mapped = articleToBlog(article);
  return mapped.image || null;
};

const BlogModal = ({
  isOpen,
  onClose,
  mode,
  initialArticle,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialArticle?: IArticleResponse | null;
  onSubmit: (payload: {
    title: string;
    category: ArticleCategory;
    publishDate?: string;
    blogDetails: string;
    image?: File;
  }) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const [blogTitle, setBlogTitle] = useState(
    mode === "edit" && initialArticle ? initialArticle.title : "",
  );
  const [category, setCategory] = useState<ArticleCategory | "">(
    mode === "edit" && initialArticle ? initialArticle.category : "",
  );
  const [publishDate, setPublishDate] = useState(
    mode === "edit" && initialArticle
      ? formatDateForInput(initialArticle.publishDate)
      : "",
  );
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    mode === "edit" ? resolveArticleImagePreview(initialArticle) : null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<QuillInstance | null>(null);
  const [didSetInitialHtml, setDidSetInitialHtml] = useState(false);
  const [isQuillReady, setIsQuillReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setBlogTitle(mode === "edit" && initialArticle ? initialArticle.title : "");
    setCategory(
      mode === "edit" && initialArticle ? initialArticle.category : "",
    );
    setPublishDate(
      mode === "edit" && initialArticle
        ? formatDateForInput(initialArticle.publishDate)
        : "",
    );
    setUploadedImage(
      mode === "edit" ? resolveArticleImagePreview(initialArticle) : null,
    );
    setSelectedFile(null);
    setDidSetInitialHtml(false);
    setIsQuillReady(false);
  }, [isOpen, mode, initialArticle]);

  useEffect(() => {
    if (!isOpen) return;

    const loadQuill = async () => {
      if (typeof window === "undefined") return;

      try {
        const QuillModule = await import("quill");
        const QuillCtor = (QuillModule?.default ??
          QuillModule) as unknown as QuillConstructor;

        if (!document.querySelector('link[href*="quill.snow.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cdn.jsdelivr.net/npm/quill@2.0.0/dist/quill.snow.css";
          document.head.appendChild(link);
        }

        setTimeout(() => {
          if (quillRef.current && !quillInstanceRef.current) {
            try {
              quillInstanceRef.current = new QuillCtor(quillRef.current, {
                theme: "snow",
                placeholder: "Enter blog details",
                modules: {
                  toolbar: [
                    [{ font: [] }],
                    [{ size: ["small", false, "large", "huge"] }],
                    ["bold", "italic", "underline", "strike"],
                    ["blockquote", "code-block"],
                    ["link", "image"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ["clean"],
                  ],
                },
              });
              setIsQuillReady(true);
            } catch (err) {
              console.error("Quill initialization failed:", err);
            }
          }
        }, 100);
      } catch (err) {
        console.error("Failed to load Quill editor:", err);
      }
    };

    loadQuill();

    return () => {
      quillInstanceRef.current = null;
      setIsQuillReady(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !isQuillReady ||
      !quillInstanceRef.current ||
      didSetInitialHtml
    )
      return;

    const initialHtml =
      mode === "edit" && initialArticle ? initialArticle.blogDetails : "";
    if (initialHtml) {
      quillInstanceRef.current.clipboard?.dangerouslyPasteHTML?.(initialHtml);
    } else {
      quillInstanceRef.current.setText?.("");
    }
    setDidSetInitialHtml(true);
  }, [isOpen, isQuillReady, mode, initialArticle, didSetInitialHtml]);

  useEffect(() => {
    return () => {
      if (uploadedImage && uploadedImage.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const setPreviewImage = (file: File) => {
    if (uploadedImage && uploadedImage.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImage);
    }
    const preview = URL.createObjectURL(file);
    setUploadedImage(preview);
    setSelectedFile(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setPreviewImage(file);
  };

  const handleClose = () => {
    setBlogTitle("");
    setCategory("");
    setPublishDate("");
    quillInstanceRef.current?.setText?.("");
    quillInstanceRef.current = null;
    if (uploadedImage && uploadedImage.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setSelectedFile(null);
    onClose();
  };

  const handleDone = async () => {
    const content = quillInstanceRef.current?.root?.innerHTML ?? "";
    const cleanTitle = blogTitle.trim();
    const plainContent = stripHtml(content);

    if (!cleanTitle) {
      window.alert("Article title is required.");
      return;
    }
    if (!category) {
      window.alert("Category is required.");
      return;
    }
    if (!plainContent) {
      window.alert("Blog details are required.");
      return;
    }
    if (mode === "add" && !selectedFile) {
      window.alert("Image is required.");
      return;
    }

    await onSubmit({
      title: cleanTitle,
      category,
      publishDate: publishDate || undefined,
      blogDetails: content,
      image: selectedFile || undefined,
    });

    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='bg-white rounded-xl border-2 border-[#D1CEC6] w-full max-w-2xl mx-4 shadow-xl h-205 overflow-auto'>
          <div className='flex items-center justify-between px-6 py-5 border-b border-[#D1CEC6]'>
            <h2 className='text-2xl font-semibold text-gray-800'>
              {mode === "add" ? "Add" : "Edit"} Blog
            </h2>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600'>
              <FiX size={22} />
            </button>
          </div>

          <div className='px-6 py-5 space-y-5'>
            <div>
              <label className='block text-sm text-gray-600 mb-2'>Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                  dragOver
                    ? "border-[#5a9e7c] bg-[#f0faf4]"
                    : "border-[#D1CEC6] bg-[#fafafa]"
                }`}>
                {uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt='Uploaded'
                    className='w-full h-full object-cover'
                    height={200}
                    width={200}
                  />
                ) : (
                  <>
                    <div className='w-12 h-12 rounded-full bg-[#e8f4ef] flex items-center justify-center mb-2'>
                      <UploadCloud />
                    </div>
                    <span className='text-sm text-gray-600 font-medium'>
                      Click to upload image
                    </span>
                    <span className='text-xs text-gray-400 mt-1'>
                      PNG, JPG up to 10MB
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageUpload}
              />
            </div>

            <div>
              <label className='block text-sm text-gray-600 mb-2'>
                Blog Title
              </label>
              <input
                type='text'
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder='Enter blog title'
                className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4A90B8]'
              />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label className='block text-sm text-gray-600 mb-2'>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ArticleCategory)
                  }
                  className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4A90B8]'>
                  <option value='' disabled>
                    Select category
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-2'>
                  Publish Date
                </label>
                <input
                  type='date'
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className='w-full border border-[#D1CEC6] rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4A90B8]'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-gray-600 mb-2'>
                Blog Details
              </label>
              <div className='border border-[#D1CEC6] rounded-lg overflow-hidden'>
                <div ref={quillRef} style={{ minHeight: "160px" }} />
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 px-6 py-4 border-t border-[#D1CEC6]'>
            <button
              onClick={handleClose}
              className='px-5 py-2 rounded-lg border border-[#D1CEC6] text-gray-600 text-sm hover:bg-gray-50'>
              Cancel
            </button>
            <button
              onClick={() => void handleDone()}
              disabled={isSubmitting}
              className='px-5 py-2 rounded-lg bg-[#5F8E7E] text-white text-sm hover:bg-[#4e7a6c]'>
              {isSubmitting ? "Saving..." : "Done"}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #d1cec6;
          background: #fafafa;
        }
        .ql-container.ql-snow {
          border: none;
          font-size: 14px;
        }
        .ql-editor {
          min-height: 140px;
          padding: 12px 16px;
          color: #374151;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </>
  );
};

export default function Page() {
  const router = useRouter();
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<IArticleResponse | null>(null);

  const { data, isLoading, isError, error } = useArticles();
  const createArticleMutation = useCreateArticleMutation();
  const updateArticleMutation = useUpdateArticleMutation();
  const deleteArticleMutation = useDeleteArticleMutation();

  const articles = useMemo(() => data?.data ?? [], [data]);

  const openAddModal = () => {
    setSelectedArticle(null);
    setModalMode("add");
  };

  const openEditModal = (article: IArticleResponse) => {
    setSelectedArticle(article);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedArticle(null);
  };

  const handleSubmit = async (payload: {
    title: string;
    category: ArticleCategory;
    publishDate?: string;
    blogDetails: string;
    image?: File;
  }) => {
    if (modalMode === "edit" && selectedArticle) {
      const id = selectedArticle._id || selectedArticle.id;
      if (!id) {
        window.alert("Article id is missing.");
        return;
      }

      await updateArticleMutation.mutateAsync({ id, data: payload });
      return;
    }

    if (!payload.image) {
      window.alert("Image is required.");
      return;
    }

    await createArticleMutation.mutateAsync({
      ...payload,
      image: payload.image,
    });
  };

  const handleDelete = async (article: IArticleResponse) => {
    const id = article._id || article.id;
    if (!id) {
      window.alert("Article id is missing.");
      return;
    }

    const shouldDelete = window.confirm(
      `Delete article \"${article.title}\"? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    await deleteArticleMutation.mutateAsync(id);
  };

  const isSubmitting =
    createArticleMutation.isPending || updateArticleMutation.isPending;

  const handleViewDetails = (article: IArticleResponse) => {
    const id = article._id || article.id;
    if (!id) {
      window.alert("Article id is missing.");
      return;
    }

    router.push(`/blog/${id}`);
  };

  return (
    <div className='bg-white rounded-xl border border-[#D1CEC6]'>
      <div className='px-6 py-5'>
        <div className='flex md:flex-row flex-col items-center justify-between  border-b border-[#D1CEC6] pb-3'>
          <div className='text-xl md:text-2xl mb-3 md:mb-0 '>
            Blog Management
          </div>
          <div className='flex gap-2'>
            <button
              onClick={openAddModal}
              className='px-6 py-2.5 bg-(--primary) text-base text-white rounded-lg hover:bg-(--primary-hover) transition-colors cursor-pointer'>
              + Add Blog
            </button>
          </div>
        </div>
      </div>

      <div className='md:mx-5 px-4 md:px-8 mt-8 my-12'>
        {isLoading && (
          <div className='text-center py-8'>Loading articles...</div>
        )}

        {isError && (
          <div className='text-center py-8 text-red-600'>
            {error instanceof Error
              ? error.message
              : "Failed to load articles."}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (articles.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>No Articles</div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 justify-between lg:grid-cols-4'>
              {articles.map((article) => {
                const blog = articleToBlog(article);
                const articleId = article._id || article.id;

                return (
                  <Card
                    key={articleId}
                    id={articleId}
                    imageUrl={blog.image || "/blog.jpg"}
                    badge={blog.category}
                    title={blog.title}
                    subtitle={stripHtml(blog.blogDetails || blog.description)}
                    type='blog'
                    date={blog.date || "No date"}
                    primaryActionLabel='View Details'
                    onPrimaryAction={() => handleViewDetails(article)}>
                    <div className='mt-auto flex items-center gap-2 mb-2'>
                      <button
                        onClick={() => openEditModal(article)}
                        className='flex items-center gap-1 px-3 py-1.5 text-sm border border-[#D1CEC6] rounded-lg hover:bg-[#f7f7f5]'>
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => void handleDelete(article)}
                        disabled={deleteArticleMutation.isPending}
                        className='flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60'>
                        <FiTrash2 size={16} />
                        {deleteArticleMutation.isPending ? "Deleting..." : ""}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
      </div>

      {modalMode && (
        <BlogModal
          isOpen={true}
          onClose={closeModal}
          mode={modalMode}
          initialArticle={selectedArticle}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
