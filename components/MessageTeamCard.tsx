"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  SendHorizontal, 
  Smile, 
  Image, 
  Monitor, 
  Paperclip, 
  AtSign, 
  FileText
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { MessageTeamCardSkeleton } from '@/components/skeletons/SkeletonBase';


export default function MessageTeamCard() {
  const {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    messages,
    handleSendMessage
  } = useDashboard();

  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat container on load / post
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedTeamId]);

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const activeMessages = messages.filter(m => m.teamId === selectedTeamId);

  const handleSend = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(selectedTeamId, inputText.trim());
    setInputText('');
    setShowEmojis(false);
  }, [inputText, handleSendMessage, selectedTeamId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const appendEmoji = useCallback((emoji: string) => {
    setInputText(prev => prev + emoji);
  }, []);

  // Show skeleton while teams/messages are loading
  if (teams.length === 0) return <MessageTeamCardSkeleton />;

  const emojiShortcuts = ['👍', '🙌', '❤️', '🔥', '🎉', '💡', '✅', '👀'];

  return (
    <div id="message-team-card" className="w-full flex flex-col font-sans select-none">
      {/* Header matching screenshot styling */}
      <div className="flex items-center justify-between pb-[10px] border-b-2 border-gray-200/90 mb-3">
        <h2 className="text-[15px] font-bold text-[#1e2022] font-display">Message Team</h2>

        {/* Beautiful four-dot grip icon */}
        <div className="flex gap-0.5 justify-center text-[#9ca3af] opacity-60">
          <div className="flex flex-col gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </div>
        </div>
      </div>

      {/* Row sub-heading: Team dropdown selector | Open Conversation link */}
      <div className="flex items-center justify-between mb-2 relative">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-indigo-600 transition-all pointer-events-auto cursor-pointer"
          >
            <span>Team {activeTeam ? activeTeam.name : 'Marketing'}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2.2]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-7 left-0 z-20 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 flex flex-col">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTeamId(t.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                    t.id === selectedTeamId ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'
                  }`}
                >
                  Team {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="text-xs font-bold text-[#4e5bf2] hover:text-[#2d39b8] underline underline-offset-4 decoration-[1.5px] decoration-[#4e5bf2] transition-colors pointer-events-auto cursor-pointer">
          Open conversation
        </button>
      </div>

      {/* Message Chat Feed Section */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-[120px] max-h-[250px] overflow-y-auto mb-3 pr-1 scrollbar-none"
      >
        <div className="flex flex-col gap-2">
          {activeMessages.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 italic">
              No conversations. Share a quick tip!
            </div>
          ) : (
            activeMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col text-[13px]">
                <span className="text-[9px] text-gray-400 font-bold block mb-0.5">{msg.timestamp}</span>
                <span className="text-xs font-bold text-[#1e2022] block mb-0.5">{msg.senderName}</span>
                <p className="text-xs font-medium text-gray-600 leading-relaxed block pr-3">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message input line + Toolbar */}
      <form onSubmit={handleSend} className="bg-white border border-[#e0e6ed] hover:border-gray-300 focus-within:border-gray-400 rounded-xl px-2.5 py-2.5 flex flex-col gap-1 transition-all">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Join conversation..."
          className="w-full text-xs font-medium bg-transparent resize-none focus:outline-none min-h-[38px] text-gray-800"
        />

        <div className="flex items-center justify-between pt-1 select-none text-gray-400">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-1 hover:text-gray-600 transition-colors relative cursor-pointer"
              title="Add emojis"
            >
              <Smile className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
            
            <button
              type="button"
              onClick={() => appendEmoji('📷 ')}
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Upload image"
            >
              <Image className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => appendEmoji('💻 ')}
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Screen share link"
            >
              <Monitor className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Attach file"
            >
              <Paperclip className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => appendEmoji('@')}
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Mention member"
            >
              <AtSign className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Add document"
            >
              <FileText className="w-[16px] h-[16px] stroke-[2.2]" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="text-gray-400 hover:text-[#4e5bf2] disabled:opacity-35 transition-colors cursor-pointer"
          >
            <SendHorizontal className="w-[16px] h-[16px] stroke-[2.2]" />
          </button>
        </div>

        {showEmojis && (
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-dotted border-gray-100 animate-fadeIn select-none">
            {emojiShortcuts.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => appendEmoji(emoji)}
                className="hover:scale-125 transition-transform text-sm p-1 hover:bg-slate-100/80 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
