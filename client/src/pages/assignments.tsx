import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { GraduationCap, LogOut, User, MessageCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Assignments() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: assignments } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/assignments/stats"],
    enabled: isAuthenticated,
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await apiRequest("POST", "/api/assignments", formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      });
      // Reset form
      setTitle("");
      setSubject("");
      setDescription("");
      setFile(null);
      // Refresh assignments list
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    if (description) formData.append("description", description);
    if (file) formData.append("file", file);

    submitMutation.mutate(formData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5 text-text-secondary hover:text-primary" />
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
              <Button variant="ghost" className="w-full justify-start text-text-secondary hover:bg-gray-100">
                <User className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/assignments">
              <Button variant="default" className="w-full justify-start">
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
            <h2 className="text-2xl font-bold text-text-primary mb-2">My Assignments</h2>
            <p className="text-text-secondary">Submit your homework and track your progress.</p>
          </div>

          {/* Assignment Submission Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Submit New Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="social">Social Studies</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="file">Upload File</Label>
                  <FileUpload onFileSelect={setFile} />
                </div>
                
                <div>
                  <Label htmlFor="description">Additional Notes</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any additional notes or comments..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="w-full bg-secondary text-white hover:bg-green-600"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Assignment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Assignment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments && assignments.length > 0 ? (
                      assignments.map((assignment: any) => (
                        <tr key={assignment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-text-primary">{assignment.title}</div>
                            {assignment.description && (
                              <div className="text-sm text-text-secondary">{assignment.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">
                            {assignment.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {assignment.submittedAt ? formatDate(assignment.submittedAt) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {assignment.grade || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-text-secondary">
                          No assignments submitted yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
