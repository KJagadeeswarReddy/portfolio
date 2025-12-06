import { getPostBySlug, getPosts } from '@/lib/store';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
