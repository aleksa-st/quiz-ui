'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Category {
  id: number;
  name: string;
}

interface CreateQuizProps {
  onClose: () => void;
  onSuccess: () => void;
  editQuiz?: any;
}

export default function CreateQuiz({ onClose, onSuccess, editQuiz }: CreateQuizProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    total_questions: 10,
    total_points: 100,
    question_selection_mode: 'auto',
    type: 'public',
    status: 'published',
    max_attempt: 3,
    start_datetime: '',
    end_datetime: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      
      if (editQuiz) {
        try {
          const fullQuiz = await api.quizzes.getDetail(editQuiz.id);
          const quizData = fullQuiz.data;
          
          setFormData({
            name: quizData.title || '',
            description: quizData.description || '',
            category_id: quizData.category_id || '',
            total_questions: quizData.total_questions || 10,
            total_points: quizData.total_points || 100,
            question_selection_mode: 'auto',
            type: quizData.type || 'public',
            status: quizData.status || 'published',
            max_attempt: quizData.max_attempt || 3,
            start_datetime: quizData.start_datetime || '',
            end_datetime: quizData.end_datetime || '',
          });
        } catch (error) {
          console.error('Failed to load full quiz data:', error);
        }
      }
    };
    
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.quizzes.getCategories();
      const categoryObjects = response.data.map((name: string, index: number) => ({
        id: index + 1,
        name: name
      }));
      setCategories(categoryObjects);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editQuiz) {
        // Update existing quiz
        console.log('Update quiz:', editQuiz.id, formData);
      } else {
        await api.quizzes.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_id') || name.includes('questions') || name.includes('points') || name.includes('attempt') 
        ? parseInt(value) || '' 
        : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{editQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quiz Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>


          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Questions</label>
              <input
                type="number"
                name="total_questions"
                value={formData.total_questions}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                name="total_points"
                value={formData.total_points}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Attempts</label>
              <input
                type="number"
                name="max_attempt"
                value={formData.max_attempt}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (editQuiz ? 'Updating...' : 'Creating...') : (editQuiz ? 'Update Quiz' : 'Create Quiz')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}