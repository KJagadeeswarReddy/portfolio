'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { BlogPost, savePost } from '@/lib/store';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  let slug = formData.get('slug') as string;

  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const newPost: BlogPost = {
    id: `post_${Date.now()}`,
    title,
    slug,
    content,
    excerpt,
    published: false,
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };

  await savePost(newPost);

  revalidatePath('/admin/posts');
  redirect('/admin/posts');
}
