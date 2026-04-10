import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { mockConversations, mockMessages, Conversation, Message } from '../../lib/mock-data';
import { Search, Send, MoreVertical, Archive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv =>
    conv.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for active conversation
  const activeMessages = activeConversation
    ? messages.filter(msg => msg.conversationId === activeConversation.id)
    : [];

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: 'buyer1',
      senderName: 'Ahmad Construction',
      senderRole: 'buyer',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages([...messages, message]);
    
    // Update last message in conversation
    setConversations(conversations.map(conv =>
      conv.id === activeConversation.id
        ? { ...conv, lastMessage: newMessage, lastMessageTime: message.timestamp }
        : conv
    ));

    setNewMessage('');
  };

  // Mark conversation as read when opened
  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation);
    
    if (conversation.unreadCount > 0) {
      setConversations(conversations.map(conv =>
        conv.id === conversation.id
          ? { ...conv, unreadCount: 0 }
          : conv
      ));

      // Mark messages as read
      setMessages(messages.map(msg =>
        msg.conversationId === conversation.id
          ? { ...msg, read: true }
          : msg
      ));
    }
  };

  // Archive conversation
  const handleArchiveConversation = (conversationId: string) => {
    setConversations(conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, status: 'archived' as const }
        : conv
    ));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(conversations[0]);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-[#0F2854] mb-8">Messages</h1>

        <Card className="h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-[#E5E7EB] flex flex-col">
              <CardHeader className="border-b border-[#E5E7EB]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors border-b border-[#E5E7EB] ${
                      activeConversation?.id === conversation.id ? 'bg-[#BDE8F5]/20' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.supplierImage} alt={conversation.supplierName} />
                      <AvatarFallback className="bg-[#4988C4] text-white">
                        {conversation.supplierName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[#111827] truncate">
                          {conversation.supplierName}
                        </h3>
                        <span className="text-xs text-[#6B7280]">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-[#0F2854] text-white">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="flex items-center justify-center h-full text-[#6B7280]">
                    No conversations found
                  </div>
                )}
              </div>
            </div>

            {/* Messages Panel */}
            {activeConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activeConversation.supplierImage} alt={activeConversation.supplierName} />
                        <AvatarFallback className="bg-[#4988C4] text-white">
                          {activeConversation.supplierName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-[#111827]">
                          {activeConversation.supplierName}
                        </h2>
                        <p className="text-sm text-[#6B7280]">Supplier</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleArchiveConversation(activeConversation.id)}
                          className="text-[#6B7280]"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Messages List */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeMessages.map((message) => {
                    const isBuyer = message.senderRole === 'buyer';
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            isBuyer
                              ? 'bg-[#0F2854] text-white'
                              : 'bg-[#F3F4F6] text-[#111827]'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isBuyer ? 'text-[#BDE8F5]' : 'text-[#6B7280]'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-[#E5E7EB] p-4">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#0F2854] hover:bg-[#1C4D8D] px-6"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#6B7280]">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#E5E7EB]" />
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">No Conversation Selected</h3>
                  <p className="text-sm text-[#6B7280]">
                    Select a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}