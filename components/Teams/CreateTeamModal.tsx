import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Loader2 } from 'lucide-react';

interface CreateTeamModalProps {
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        await onSubmit({ name, description });
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-black text-slate-900 mb-1">Create Team</h2>
                <p className="text-slate-500 mb-6">Start a new squad and invite your friends.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                            placeholder="e.g. Quiz Masters"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium resize-none h-24"
                            placeholder="What is this team about?"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1" // fixed typo "flex-1;"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Team'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
