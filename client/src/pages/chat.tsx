import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, LogOut, User, MessageCircle, Clock, Send } from "lucide-react";
import { Link } from "wouter";

interface ChatMessage {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
  };
}

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages } = useQuery({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });

  const { data: onlineCount } = useQuery({
    queryKey: ["/api/chat/count"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !socket || !user) return;

    const message = {
      type: "chat_message",
      userId: user.id,
      content: messageInput.trim(),
    };

    socket.send(JSON.stringify(message));
    setMessageInput("");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isCurrentUser = (userId: string) => {
    return userId === user?.id;
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Revelsy</h1>
                <p className="text-xs text-text-secondary">Grade 6 Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">Grade 6 Student</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 text-text-secondary hover:text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <nav className="p-6 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <User className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/assignments">
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <Clock className="mr-3 h-4 w-4" />
                Assignments
              </Button>
            </Link>
            
            <Link href="/chat">
              <Button variant="default" className="w-full justify-start">
                <MessageCircle className="mr-3 h-4 w-4" />
                Class Chat
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <User className="mr-3 h-4 w-4" />
                My Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Class Chat</h2>
            <p className="text-text-secondary">Connect with your classmates and discuss schoolwork.</p>
          </div>

          <Card className="h-96 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-semibold text-text-primary">Grade 6 Class Chat</CardTitle>
                  <p className="text-sm text-text-secondary">
                    Students online: {onlineCount?.count || 0}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  <span className="text-sm text-secondary font-medium">Live</span>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      isCurrentUser(message.userId) ? "justify-end" : ""
                    }`}
                  >
                    {!isCurrentUser(message.userId) && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {getInitials(message.user?.firstName, message.user?.lastName)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex-1 ${isCurrentUser(message.userId) ? "flex justify-end" : ""}`}>
                      <div>
                        <div className={`flex items-center space-x-2 mb-1 ${
                          isCurrentUser(message.userId) ? "justify-end" : ""
                        }`}>
                          <span className="text-xs text-text-secondary">
                            {formatTime(message.createdAt)}
                          </span>
                          <span className="text-sm font-medium text-text-primary">
                            {isCurrentUser(message.userId) 
                              ? "You" 
                              : `${message.user?.firstName} ${message.user?.lastName}`
                            }
                          </span>
                        </div>
                        <div className={`rounded-lg px-3 py-2 max-w-md ${
                          isCurrentUser(message.userId)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-text-primary"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>

                    {isCurrentUser(message.userId) && (
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {getInitials(user?.firstName, user?.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-text-secondary py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!messageInput.trim()}
                  className="bg-primary text-white hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
