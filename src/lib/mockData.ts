import { Product, Edit } from './types';

export const mockProducts: Product[] = [
  { id: 'p001', brand: 'Agolde', name: 'Cargo Wide-Leg Jeans', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', price: 198, originalPrice: 265, tags: ['wide leg', 'cargo', 'denim', 'blue', 'jeans', 'pants'], isBookmarked: false },
  { id: 'p002', brand: 'Toteme', name: 'Straight-Cut Trousers', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d05?w=400&h=500&fit=crop', price: 320, tags: ['straight leg', 'trousers', 'tailored', 'black', 'pants'], isBookmarked: false },
  { id: 'p003', brand: 'Aritzia', name: 'Effortless Pant', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop', price: 110, originalPrice: 148, tags: ['relaxed fit', 'wide leg', 'beige', 'cream', 'pants', 'casual'], isBookmarked: false },
  { id: 'p004', brand: 'Acne Studios', name: 'Loose-Fit Jeans', imageUrl: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&h=500&fit=crop', price: 380, tags: ['relaxed fit', 'loose', 'denim', 'blue', 'jeans', 'baggy'], isBookmarked: false },
  { id: 'p005', brand: 'Reformation', name: 'Maroon High-Rise Jeans', imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop', price: 158, tags: ['maroon', 'burgundy', 'high rise', 'straight leg', 'jeans', 'colored'], isBookmarked: false },
  { id: 'p006', brand: "Levi's", name: '501 Straight Jeans', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&seed=6', price: 89, tags: ['straight leg', 'denim', 'blue', 'jeans', 'classic'], isBookmarked: false },
  { id: 'p007', brand: 'Zara', name: 'Wide Leg Cargo Trousers', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop', price: 69, originalPrice: 99, tags: ['wide leg', 'cargo', 'khaki', 'olive', 'trousers', 'pants'], isBookmarked: false },
  { id: 'p008', brand: 'COS', name: 'Relaxed Pleated Trousers', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop', price: 125, tags: ['relaxed fit', 'pleated', 'trousers', 'gray', 'grey', 'tailored'], isBookmarked: false },
  { id: 'p009', brand: 'Mango', name: 'Burgundy Flared Pants', imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop', price: 59, originalPrice: 79, tags: ['flared', 'burgundy', 'maroon', 'red', 'pants', 'wide leg'], isBookmarked: false },
  { id: 'p010', brand: 'H&M', name: 'Baggy Low-Rise Jeans', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop', price: 39, tags: ['baggy', 'low rise', 'denim', 'blue', 'jeans', 'relaxed fit'], isBookmarked: false },
  { id: 'p011', brand: 'Frame', name: 'Le High Straight', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d05?w=400&h=500&fit=crop&seed=11', price: 245, tags: ['straight leg', 'high rise', 'denim', 'blue', 'jeans', 'classic'], isBookmarked: false },
  { id: 'p012', brand: 'Weekday', name: 'Barrel Leg Trousers', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop', price: 75, originalPrice: 95, tags: ['barrel', 'wide leg', 'relaxed fit', 'beige', 'cream', 'trousers'], isBookmarked: false },
];

export const curatedEdits: Edit[] = [
  { label: 'Wide Leg', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop', tag: 'Trending' },
  { label: 'Maroon & Burgundy', imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=750&fit=crop', tag: 'Color Story' },
  { label: 'Cargo Everything', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop', tag: 'Street' },
  { label: 'Straight Leg', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d05?w=600&h=750&fit=crop', tag: 'Classic' },
  { label: 'Relaxed Fit', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop', tag: 'Casual' },
  { label: 'High Rise', imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&h=750&fit=crop', tag: 'Editorial' },
];

export const brands = ['Toteme', 'Agolde', 'Acne Studios', 'Frame', 'Reformation', 'COS', 'Aritzia', "Levi's", 'Zara', 'Weekday', 'Mango', 'H&M Studio', 'Bottega', 'Jacquemus', 'Nanushka'];

export const prompts = [
  'baggy linen pants in earthy tones...',
  'something maroon and wide leg...',
  'cargo pants with a relaxed fit...',
  'straight leg jeans, classic blue...',
  'elevated basics under $100...',
  'oversized and effortless...',
];

export function searchProducts(allProducts: Product[], filters: string[]): Product[] {
  if (filters.length === 0) return allProducts;
  return allProducts.filter(p =>
    filters.some(f => p.tags.some(t => t.toLowerCase().includes(f.toLowerCase())))
  );
}
