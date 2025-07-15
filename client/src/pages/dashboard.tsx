import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Mail, MessageCircle, User, GraduationCap, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/assignments/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentAssignments } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: isAuthenticated,
  });

  const { data: recentMessages } = useQuery({
    queryKey: ["/api/chat/messages"],
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

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
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
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageCircle className="h-5 w-5 text-text-secondary hover:text-primary" />
                  {recentMessages && recentMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Math.min(recentMessages.length, 9)}
                    </span>
                  )}
                </Button>
              </Link>
              
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
              <Button variant="default" className="w-full justify-start">
                <User className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/assignments">
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <Clock className="mr-3 h-4 w-4" />
                Assignments
                {stats && stats.pending > 0 && (
                  <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link href="/chat">
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <MessageCircle className="mr-3 h-4 w-4" />
                Class Chat
                {recentMessages && recentMessages.length > 0 && (
                  <span className="ml-auto bg-secondary text-white text-xs px-2 py-1 rounded-full">
                    {Math.min(recentMessages.length, 9)}
                  </span>
                )}
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
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-text-secondary">Here's what's happening in your class today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Pending Assignments</p>
                    <p className="text-2xl font-bold text-text-primary">{stats?.pending || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="text-accent text-xl h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Completed This Week</p>
                    <p className="text-2xl font-bold text-text-primary">{stats?.completed || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-secondary text-xl h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">New Messages</p>
                    <p className="text-2xl font-bold text-text-primary">{recentMessages?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="text-primary text-xl h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">Recent Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAssignments && recentAssignments.length > 0 ? (
                    recentAssignments.slice(0, 3).map((assignment: any) => (
                      <div key={assignment.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                        assignment.status === 'pending' ? 'bg-red-50 border-red-200' :
                        assignment.status === 'submitted' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {assignment.status === 'pending' && <Clock className="text-destructive h-4 w-4" />}
                          {assignment.status === 'submitted' && <Clock className="text-warning h-4 w-4" />}
                          {assignment.status === 'graded' && <CheckCircle className="text-secondary h-4 w-4" />}
                          <div>
                            <p className="font-medium text-text-primary">{assignment.title}</p>
                            <p className={`text-sm ${
                              assignment.status === 'pending' ? 'text-destructive' :
                              assignment.status === 'submitted' ? 'text-warning' :
                              'text-secondary'
                            }`}>
                              {assignment.status === 'pending' && 'Due soon'}
                              {assignment.status === 'submitted' && 'Submitted'}
                              {assignment.status === 'graded' && 'Graded'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          assignment.status === 'pending' ? 'bg-destructive text-white' :
                          assignment.status === 'submitted' ? 'bg-warning text-white' :
                          'bg-secondary text-white'
                        }`}>
                          {assignment.status === 'pending' && 'Urgent'}
                          {assignment.status === 'submitted' && 'Pending'}
                          {assignment.status === 'graded' && 'Complete'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-center py-4">No assignments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">Class Chat Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages && recentMessages.length > 0 ? (
                    recentMessages.slice(0, 3).map((msg: any) => (
                      <div key={msg.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getInitials(msg.user?.firstName, msg.user?.lastName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{msg.user?.firstName} {msg.user?.lastName}</span>{" "}
                            <span className="text-text-secondary">{formatTimeAgo(msg.createdAt)}</span>
                          </p>
                          <p className="text-sm text-text-secondary">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-center py-4">No messages yet</p>
                  )}
                </div>
                
                <Link href="/chat">
                  <Button className="w-full mt-4 bg-primary text-white hover:bg-blue-600">
                    Join Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
