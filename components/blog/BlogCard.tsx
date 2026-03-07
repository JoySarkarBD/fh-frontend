"use client";
import { Iblog } from "@/types/blog";
import React from "react";
import Card from "../shared/Card/Card";

interface BlogCardProps {
  blog: Iblog;
  variant?: "vertical" | "horizontal";
}

// Utility to strip HTML tags and collapse whitespace
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

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className=''>
      <Card
        key={blog.id}
        id={blog.id}
        imageUrl={blog.image || "/blog.jpg"}
        badge={blog.category}
        title={blog.title}
        subtitle={stripHtml(blog.blogDetails || blog.description)}
        type={"blog"}
        date={blog.date}
        primaryActionLabel='View Details'
      />
    </div>
  );
};

export default BlogCard;
