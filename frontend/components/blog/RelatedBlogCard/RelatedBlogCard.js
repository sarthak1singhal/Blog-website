import Link from "next/link";
import { API } from "../../../config";

const RelatedBlogCard = ({ blog }) => {
  console.log(blog);
  return (
    <div className="related-blog-card">
      <Link href={`/blogs/${blog.slug}`}>
        <a>
          <img
            className="related-blog-card__img"
            src={blog.imageUrl}
            alt={blog.title}
          />{" "}
        </a>
      </Link>
      <div className="related-blog-card__wrapper">
        <Link href={`/blogs/${blog.slug}`}>
          <a className="related-blog-card__title">{blog.title}</a>
        </Link>
        <p className="related-blog-card__posted-by">
          Posted by{" "}
          <Link href={`/profile/${blog.postedBy.username}`}>
            <a>
              <span>{blog.postedBy.name}</span>
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RelatedBlogCard;
