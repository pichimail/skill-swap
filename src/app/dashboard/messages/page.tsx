'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8 h-[calc(100vh-72px)] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm"
      >
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">No messages yet</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Your inbox is currently empty. Once you match with a learning partner, your chat history will appear here securely.
        </p>
        <button 
          disabled
          className="px-6 py-2.5 bg-muted text-muted-foreground text-sm font-medium rounded-lg cursor-not-allowed"
        >
          Waiting for matches...
        </button>
      </motion.div>
    </div>
  );
}
