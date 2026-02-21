import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Search,
    Video,
    Link as LinkIcon,
    BookOpen,
    Clock,
    Filter,
    Star,
    Lock,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

const categories = ['All', 'GK', 'Current Affairs', 'Aptitude', 'History', 'Tamil Literature'];

export const Resources: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setIsLoading(true);
            try {
                const res = await api.publicData.getResources({
                    category: selectedCategory,
                    search: searchQuery
                });
                if (res.success) {
                    setResources(res.data);
                }
            } catch (error) {
                console.error("Error fetching resources:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResources, 300);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'link': return <LinkIcon className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-white pt-28 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-600 font-bold text-sm mb-6 border border-violet-100">
                        <Lock className="w-4 h-4" />
                        <span>Premium Materials Accessible to All Students</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        Learning <span className="text-violet-600">Hub</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        Download GK capsules, monthly current affairs, and subject-specific notes curated by our experts.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-16 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="relative flex-grow w-full lg:w-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search resources by title or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-2 border-transparent focus:border-violet-500 focus:outline-none font-bold text-slate-700 shadow-sm transition-all text-lg"
                            />
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-4 rounded-2xl font-black text-sm transition-all ${selectedCategory === category
                                            ? 'bg-violet-600 text-white shadow-xl shadow-violet-200'
                                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resources Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => <div key={i} className="bg-slate-50 h-80 rounded-[2.5rem] animate-pulse"></div>)}
                    </div>
                ) : resources.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="group relative bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 hover:border-violet-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-violet-100/40 transition-all duration-500 flex flex-col"
                            >
                                {resource.is_premium && (
                                    <div className="absolute top-6 right-6 z-10 w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                )}
                                <div className="mb-8 relative rounded-3xl overflow-hidden aspect-video bg-slate-100">
                                    <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                        <span className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                            {getIcon(resource.type)} View Resource
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <span className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4">
                                        {resource.category}
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                                        {resource.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                        <Download className="w-4 h-4" />
                                        {resource.download_count} Downloads
                                    </div>
                                    <Button
                                        as="a"
                                        href={resource.file_url}
                                        target="_blank"
                                        size="lg"
                                        className="bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white rounded-xl font-black"
                                    >
                                        Download <Download className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">No resources found matching your search.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

