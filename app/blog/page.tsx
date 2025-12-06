import Link from 'next/link';
import { getPosts, BlogPost } from '@/lib/store';

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Daily Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.length > 0 ? (
          posts.map((post: BlogPost) => (
            <Link href={`/blog/${post.slug}`} key={post.id}>
              <div className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 h-full">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{post.title}</h2>
                <p className="font-normal text-gray-700">{post.excerpt}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center col-span-full">No posts yet. Stay tuned!</p>
        )}
      </div>
    </div>
  )
}
