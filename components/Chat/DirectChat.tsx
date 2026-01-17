import { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ArrowLeft, MessageCircle, Search, Plus } from 'lucide-react';
import { api } from '../../services/api';
import Pusher from 'pusher-js';
import { ENV } from '../../src/config/env';

interface DirectChatProps {
  onBack: () => void;
  initialUserId?: number;
}

interface Conversation {
  user_id: number;
  user_name: string;
  avatar: string | null;
  avatar_initials: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  avatar: string | null;
  avatar_initials: string;
  is_own: boolean;
  created_at: string;
}

export function DirectChat({ onBack, initialUserId }: DirectChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.user_name.toLowerCase().includes(conversationSearch.toLowerCase())
    );
  }, [conversations, conversationSearch]);

  useEffect(() => {
    fetchConversations();
    setupPusher();
    
    if (initialUserId) {
      fetchUserAndMessages(initialUserId);
    }

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [initialUserId]);

  const setupPusher = async () => {
    try {
      const response = await api.profile.get();
      
      if (response.success) {
        const userId = response.data.id;
        
        pusherRef.current = new Pusher(ENV.PUSHER_KEY, { cluster: ENV.PUSHER_CLUSTER });
        const channel = pusherRef.current.subscribe(`direct-chat.${userId}`);
        
        channel.bind('new-message', (data: any) => {
          setMessages(prev => {
            if (prev.some(msg => msg.id === data.id)) return prev;
            return [...prev, { ...data, is_own: false }];
          });
          fetchConversations();
        });
      }
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.chat.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.teams.searchUsers(query);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const fetchUserAndMessages = async (userId: number) => {
    try {
      const response = await api.chat.getMessages(userId);
      if (response.success) {
        setMessages(response.data.messages);
        setSelectedUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedUser) return;

    setSending(true);
    try {
      const response = await api.chat.sendMessage(selectedUser.id, newMessage);
      if (response.success) {
        setMessages(prev => [...prev, { ...response.data, is_own: true }]);
        setNewMessage('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-violet-600 font-semibold mb-4">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-3xl font-black text-slate-900">Messages</h1>
          <p className="text-slate-500">Chat with your team members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className={`lg:col-span-1 ${selectedUser ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-slate-800">Conversations</h2>
                  <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-slate-200 rounded-lg transition">
                    <Plus className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
                {showSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white rounded-lg mt-1 max-h-60 overflow-y-auto z-10 shadow-xl border border-slate-200">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              fetchUserAndMessages(user.id);
                              setSearchQuery('');
                              setSearchResults([]);
                              setShowSearch(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition text-left"
                          >
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-slate-900 font-medium">{user.name}</div>
                              {user.teams && user.teams.length > 0 && <div className="text-slate-500 text-xs">{user.teams.join(', ')}</div>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="overflow-y-auto" style={{maxHeight: '600px'}}>
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                    <MessageCircle className="w-16 h-16 mb-4" />
                    <p>{conversationSearch ? 'No matches found' : 'No conversations yet'}</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.user_id}
                      onClick={() => fetchUserAndMessages(conv.user_id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition border-b border-slate-100 ${selectedUser?.id === conv.user_id ? 'bg-violet-50' : ''}`}
                    >
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.user_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.avatar_initials}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="text-slate-900 font-semibold">{conv.user_name}</h3>
                        <p className="text-slate-500 text-sm truncate">{conv.last_message}</p>
                      </div>
                      <span className="text-slate-400 text-xs">{conv.last_message_time}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-2 ${!selectedUser ? 'hidden lg:block' : 'block'}`}>
            {selectedUser ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col" style={{height: '600px'}}>
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <button onClick={() => setSelectedUser(null)} className="lg:hidden p-2 hover:bg-slate-200 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.avatar_initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-slate-900 font-bold">{selectedUser.name}</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.is_own ? 'flex-row-reverse' : ''}`}>
                      {msg.avatar ? (
                        <img src={msg.avatar} alt={msg.sender_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {msg.avatar_initials}
                        </div>
                      )}
                      <div className={`flex flex-col max-w-[75%] ${msg.is_own ? 'items-end' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2 ${msg.is_own ? 'bg-violet-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                          <p className="text-sm break-words">{msg.message}</p>
                        </div>
                        <span className="text-slate-400 text-xs mt-1 px-2">{msg.created_at}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={sendMessage}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center" style={{height: '600px'}}>
                <div className="text-center text-slate-400">
                  <MessageCircle className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-xl font-semibold">Select a conversation</p>
                  <p className="text-sm">Choose a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
