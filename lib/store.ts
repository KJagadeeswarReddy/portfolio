import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const DOCS_FILE = path.join(DATA_DIR, 'documents.json');
const DOCS_DIR = path.join(DATA_DIR, 'documents');

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR);
}
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, '[]');
}
if (!fs.existsSync(DOCS_FILE)) {
  fs.writeFileSync(DOCS_FILE, '[]');
}

// --- Posts ---

export async function getPosts(): Promise<BlogPost[]> {
  const data = fs.readFileSync(POSTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug);
}

export async function savePost(post: BlogPost): Promise<void> {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.push(post);
  }
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

export async function deletePost(id: string): Promise<void> {
  const posts = await getPosts();
  const newPosts = posts.filter((p) => p.id !== id);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(newPosts, null, 2));
}

// --- Documents ---

export async function getDocuments(): Promise<DocumentMeta[]> {
  const data = fs.readFileSync(DOCS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveDocumentMeta(doc: DocumentMeta): Promise<void> {
  const docs = await getDocuments();
  docs.push(doc);
  fs.writeFileSync(DOCS_FILE, JSON.stringify(docs, null, 2));
}

export async function deleteDocument(id: string): Promise<void> {
  const docs = await getDocuments();
  const doc = docs.find((d) => d.id === id);
  if (doc) {
    const filePath = path.join(DOCS_DIR, doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  const newDocs = docs.filter((d) => d.id !== id);
  fs.writeFileSync(DOCS_FILE, JSON.stringify(newDocs, null, 2));
}

export function getDocumentPath(filename: string): string {
  return path.join(DOCS_DIR, filename);
}
