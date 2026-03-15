const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Shape returned by the Django API (snake_case)
interface BlogPostAPI {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  read_time: string;
  cover_image: string;
  published: boolean;
  published_at: string;
  updated_at: string;
}

// Shape consumed by Next.js components (camelCase)
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  coverImage: string;
  date: string; // ISO datetime string — passes through formatDate()
}

function mapPost(api: BlogPostAPI): BlogPost {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    description: api.description,
    content: api.content,
    category: api.category,
    readTime: api.read_time,
    coverImage: api.cover_image,
    date: api.published_at,
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: BlogPostAPI[] = await res.json();
    return data.map(mapPost);
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: BlogPostAPI = await res.json();
    return mapPost(data);
  } catch {
    return null;
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
