'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiTool } from 'react-icons/fi';
import { Student } from '../types';
import { getStudents } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCall?: {
    name: string;
    arguments: any;
  } | null;
}

const ToolCallDisplay = ({ toolCall }: { toolCall: NonNullable<Message['toolCall']> }) => (
  <div className="mb-2 w-full max-w-sm">
    <div className="text-xs text-text-muted flex items-center gap-2 bg-gray-50 border border-border rounded-lg p-2 overflow-hidden">
      <FiTool className="flex-shrink-0" />
      <span className="font-semibold">{toolCall.name}:</span>
      <span className="font-mono text-accent-blue truncate">
        {`Sending "${toolCall.arguments.text}" to ${toolCall.arguments.studentName}`}
      </span>
    </div>
  </div>
);

export default function ClassroomChat({ currentInstruction }: { currentInstruction: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingContext, setIsFetchingContext] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsFetchingContext(true);
      try {
        const studentData = await getStudents('1'); // Hardcoded to classroom '1'
        setStudents(studentData);
      } catch (error) {
        console.error("Failed to fetch students for chat context:", error);
        setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't load the student data. Please try refreshing the page." }]);
      } finally {
        setIsFetchingContext(false);
      }
    };
    fetchStudents();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // We will create this API route next
      const response = await fetch('/api/classroom-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          students: students,
          currentInstruction: currentInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const assistantMessage: Message = await response.json();
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-card p-0 flex flex-col h-[500px]">
      <div className="p-4 border-b border-border">
        <h3 className="text-xl font-bold font-formal flex items-center gap-2">
          <FiCpu />
          Classroom Assistant
        </h3>
        <p className="text-sm text-text-muted">Ask about trends or get a summary of your class.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {isFetchingContext && (
            <div className="flex justify-center items-center h-full">
              <p className="text-text-muted">Loading student context...</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               {msg.role === 'assistant' && msg.toolCall && (
                <ToolCallDisplay toolCall={msg.toolCall} />
              )}
              <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-accent-blue text-white' : 'bg-gray-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="rounded-lg px-4 py-2 bg-gray-100">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isFetchingContext ? "Loading context..." : "E.g., 'Who needs the most help?'"}
            className="input-field flex-grow"
            disabled={isLoading || isFetchingContext}
          />
          <button onClick={handleSend} className="btn-primary p-2" disabled={isLoading || isFetchingContext}>
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 