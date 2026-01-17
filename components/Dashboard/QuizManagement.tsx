'use client';

import { useState, useEffect, useCallback } from 'react';
import CreateQuiz from '../Quiz/CreateQuiz';
import { api } from '@/services/api';

export default function QuizManagement() {
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);


  const checkPermissions = async () => {
    try {
      const response = await api.quizzes.canCreate();
      setCanCreate(response.data?.can_create || false);
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setCanCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = useCallback(async (page = 1, searchTerm = '', reset = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      const response = await api.quizzes.getExplore({ 
        page, 
        per_page: 20,
        search: searchTerm,
        created_by_me: true 
      });
      
      if (response.success) {
        const newQuizzes = response.data || [];
        setQuizzes(prev => reset || page === 1 ? newQuizzes : [...prev, ...newQuizzes]);
        setHasMore(response.pagination?.has_more || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1);
    loadQuizzes(1, searchTerm, true);
  }, [loadQuizzes]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadQuizzes(currentPage + 1, search);
    }
  };

  useEffect(() => {
    setLoading(false); // Show UI immediately
    checkPermissions();
    loadQuizzes();
  }, [loadQuizzes]);

  const handleQuizCreated = () => {
    setShowCreateQuiz(false);
    loadQuizzes(1, search, true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Quiz Management</h2>
        <button
          onClick={() => setShowCreateQuiz(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Create Quiz
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
                  <div className="flex gap-4 mt-2">
                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                    <div className="h-4 w-16 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-12 bg-slate-200 rounded"></div>
                  <div className="h-6 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{search ? 'No quizzes found.' : 'No quizzes created yet.'}</p>
          {!search && <p className="text-sm">Click "Create Quiz" to get started!</p>}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {quizzes.map((quiz: any) => (
              <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{quiz.title || quiz.name || 'Untitled Quiz'}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Questions: {quiz.questions_count || quiz.total_questions || 0}</span>
                      <span>Subject: {quiz.subject || 'Unknown'}</span>
                      <span>Difficulty: {quiz.difficulty || 'Easy'}</span>
                      <span>Rating: {quiz.rating || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQuiz(quiz);
                        setShowCreateQuiz(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this quiz?')) {
                          console.log('Delete quiz:', quiz.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {showCreateQuiz && (
        <CreateQuiz
          onClose={() => {
            setShowCreateQuiz(false);
            setEditingQuiz(null);
          }}
          onSuccess={handleQuizCreated}
          editQuiz={editingQuiz}
        />
      )}
    </div>
  );
}