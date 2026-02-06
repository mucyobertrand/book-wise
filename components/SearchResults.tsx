// components/SearchResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchBooks } from '@/lib/actions/book';
import BookCard from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  videoUrl: string;
  summary: string;
  createdAt: Date | null;
}

interface SearchResponse {
  books: Book[];
  total: number;
  hasMore: boolean;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure this only runs on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = {
          query: searchParams.get('query') || undefined,
          genre: searchParams.get('genre') || undefined,
          minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
          sortBy: (searchParams.get('sortBy') as 'title' | 'author' | 'rating' | 'date' | undefined) || 'title',
          sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || 'asc',
        };

        const response = await searchBooks(params);
        
        if (response?.success && response.data) {
          setResults(response.data);
        } else {
          setError(response?.error || 'Failed to fetch results');
          setResults(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, isMounted]);

  if (!isMounted) {
    return null; // or return a skeleton loader
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!results?.books?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-400">No books found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-light-200 mt-[-6] hidden">
          {results.total} {results.total === 1 ? 'book' : 'books'} found
        </h3>
      </div>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </ul>

      {results.hasMore && (
        <div className="mt-8 text-center">
          <button
            className="px-6 py-2 bg-dark-100 hover:bg-dark-200 rounded-full text-sm font-medium transition-colors"
            onClick={() => {
              // Implement pagination here
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}