import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, PageRoute } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Filter, Clock, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

interface QuizDiscoveryProps {
  onNavigate: (page: PageRoute, quizId?: number) => void;
}

export const QuizDiscovery: React.FC<QuizDiscoveryProps> = ({ onNavigate }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuizzes = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setLoadingMore(true);
      
      const params: any = {
        page,
        per_page: 12
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      
      const response = await api.quizzes.getExplore(params);
      
      if (response.success) {
        const newQuizzes = response.data || [];
        setQuizzes(prev => reset || page === 1 ? newQuizzes : [...prev, ...newQuizzes]);
        setHasMore(response.pagination?.has_more || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to load quizzes", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchQuizzes(1, true);
  }, [fetchQuizzes]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchQuizzes(1, true);
  }, [fetchQuizzes]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchQuizzes(currentPage + 1);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesRes = await api.quizzes.getCategories();
        if (categoriesRes.success) {
          setCategories(['All', ...categoriesRes.data]);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadData();
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Remove client-side filtering since it's now handled by the API
  const filteredQuizzes = quizzes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Quizzes</h1>
          <p className="text-slate-500 mt-1">Find the perfect quiz to challenge yourself</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden md:flex">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 sm:text-sm"
            placeholder="Search for quizzes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === category
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-slate-100">
              <div className="h-40 bg-slate-100 rounded-xl mb-4"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-slate-100 rounded-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="group hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 flex flex-col h-full">
              <div className="h-48 relative overflow-hidden bg-slate-100">
                {quiz.thumbnail && (quiz.thumbnail.startsWith('http') || quiz.thumbnail.startsWith('/')) ? (
                  <img
                    src={quiz.thumbnail}
                    alt={quiz.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-5xl">
                    {quiz.thumbnail || '📝'}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md
                    ${quiz.difficulty === 'Easy' ? 'bg-green-500/90' :
                      quiz.difficulty === 'Medium' ? 'bg-yellow-500/90' : 'bg-red-500/90'}`}>
                    {quiz.difficulty}
                  </span>
                </div>
              </div>

              <CardContent className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1 block">
                    {quiz.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{quiz.total_questions} Qs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{quiz.time_limit || 15} mins</span>
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors"
                    variant="outline"
                    onClick={() => onNavigate('quiz-details', quiz.id)}
                  >
                    Start Quiz <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No quizzes found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
          <Button variant="outline" className="mt-6" onClick={() => {
            handleSearch('');
            handleCategoryChange('All');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Load More Button */}
      {!isLoading && filteredQuizzes.length > 0 && hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="px-8 py-3"
          >
            {loadingMore ? 'Loading...' : 'Load More Quizzes'}
          </Button>
        </div>
      )}
    </div>
  );
};