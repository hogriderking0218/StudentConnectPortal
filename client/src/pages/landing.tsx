import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, UserPlus } from "lucide-react";

export default function Landing() {
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-white text-2xl h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Revelsy</h1>
            <p className="text-text-secondary text-sm">Our Lady of Assumption College School</p>
            <p className="text-text-secondary text-xs">Student Portal - Grade 6</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Welcome to Your Learning Portal
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                Connect with your classmates, submit assignments, and track your progress
              </p>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors transform hover:scale-[1.02]"
            >
              Sign In to Get Started
            </Button>

            <div className="text-center">
              <p className="text-text-secondary text-sm">
                New to Revelsy? Your teacher will help you create an account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
