// components/SearchForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchParams } from '@/lib/actions/book';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const genres = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
  'Romance', 'Thriller', 'Biography', 'History', 'Science', 'Technology'
];

interface SearchFormProps {
  initialParams?: Partial<SearchParams>;
}

export default function SearchForm({ initialParams = {} }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(initialParams?.query || '');
  const [genre, setGenre] = useState(initialParams?.genre || 'all');
  const [minRating, setMinRating] = useState(initialParams?.minRating?.toString() || '0');
  const [sortBy, setSortBy] = useState<SearchParams['sortBy']>(initialParams?.sortBy || 'title');
  const [sortOrder, setSortOrder] = useState<SearchParams['sortOrder']>(initialParams?.sortOrder || 'asc');

  // Ensure this only runs on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    if (!isMounted) return;

    const params = new URLSearchParams();
    
    if (searchQuery) params.set('query', searchQuery);
    if (genre && genre !== 'all') params.set('genre', genre);
    if (minRating && minRating !== '0') params.set('minRating', minRating);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    
    router.push(`/search?${params.toString()}`);
  };

  // Update search when sort/filter changes
  useEffect(() => {
    if (!isMounted) return;
    updateSearchParams();
  }, [genre, minRating, sortBy, sortOrder, isMounted]);

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[75%] absolute ml-[12%] bg-[#232839] text-light-200 h-12 text-xl font-semibold"
            />
          </div>
          
          <div className="w-full md:w-48 bg-dark-100 absolute right-0 top-20">
            <Select
              

              onValueChange={(value) => {
                const [filterType, filterValue] = value.split(':');
                if (filterType === 'genre') {
                  setGenre(filterValue);
                } else if (filterType === 'rating') {
                  setMinRating(filterValue);
                } else if (filterType === 'sort') {
                  setSortBy(filterValue as SearchParams['sortBy']);
                } else if (filterType === 'order') {
                  setSortOrder(filterValue as SearchParams['sortOrder']);
                }
              }}
            >
              <SelectTrigger className="w-full bg-dark-100 overflow-auto text-light-200">
                <SelectValue placeholder="Filter by: " />
              </SelectTrigger>
              <SelectContent position="item-aligned" sideOffset={5} className="bg-dark-100 text-light-200">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-500">Genres</div>
                {['all', ...genres].map((g) => (
                  <SelectItem key={`genre:${g}`} value={`genre:${g}`}>
                    {g === 'all' ? 'All Genres' : g}
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1.5 text-sm font-medium text-gray-500 mt-2">Minimum Rating</div>
                {['0', '1', '2', '3', '4'].map((num) => (
                  <SelectItem key={`rating:${num}`} value={`rating:${num}`}>
                    {num === '0' ? 'Any Rating' : `${num}+ Stars`}
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1.5 text-sm font-medium text-gray-500 mt-2">Sort By</div>
                {[
                  { value: 'title', label: 'Title' },
                  { value: 'author', label: 'Author' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'date', label: 'Date Added' }
                ].map((item) => (
                  <SelectItem key={`sort:${item.value}`} value={`sort:${item.value}`}>
                    {item.label}
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1.5 text-sm font-medium text-gray-500 mt-2">Sort Order</div>
                <SelectItem value="order:asc">Ascending</SelectItem>
                <SelectItem value="order:desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="bg-light-200 hidden hover:bg-light-100 text-dark-900 w-full md:w-auto">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}