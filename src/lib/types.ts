export interface Product {
  id: string;
  brand: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  tags: string[];
  isBookmarked: boolean;
}

export interface SearchFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// Legacy types — kept for ChatPanel component compatibility
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface FilterChip {
  id: string;
  label: string;
  isSelected: boolean;
}

export interface AiResponse {
  displayText: string;
  suggestedFilters: string[];
}

export interface Edit {
  label: string;
  imageUrl: string;
  tag: string;
}
