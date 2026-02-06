// app/(root)/search/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchParams } from '@/lib/actions/book';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Extract search params for initial values
  const initialParams: Partial<SearchParams> = {
    query: searchParams.get('query') || undefined,
    genre: searchParams.get('genre') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'title' | 'author' | 'rating' | 'date' | undefined) || 'title',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || 'asc',
  };

  // Ensure this only runs on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or return a skeleton loader
  }

  return (
    <div className="w-full py-[-7px]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="font-bebas-neue md:text-2xl lg:text-lg font-semibold text-light-100 mb-4">
            Discover Your Next Great Read:
          </h1>
          <p className="text-6xl font-semibold text-light-100 max-w-2xl">
            Explore and Search for <span className='text-light-200'>Any Book</span> In Our Library
          </p>
        </div>


        <div className="mb-3">
          <SearchForm initialParams={initialParams} />
        </div>

        <div className="w-full mt-[12%] mb-[5%] md:mt-[25%]">
          <SearchResults />
        </div>
      </div>
    </div>
  );
}