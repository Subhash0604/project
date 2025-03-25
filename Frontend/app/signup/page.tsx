"use client";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { auth, googleProvider } from "../firebase";
import { Car } from "lucide-react";
import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import useAuthStore from "../../store/useAuthStore";
import { Separator } from "../../components/ui/separator";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgURL, setImgURL] = useState("https://res.cloudinary.com/dxvqusbka/image/upload/v1741281942/Person_yxz6w1.png");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const response = await fetch("http://localhost:8000/api/protected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }

      useAuthStore.setState({
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL || "/icons/person2.png",
        },
      });

      router.push('/');
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      console.error("Email and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("Invalid email format.");
      return;
    }

    try {
      console.log("Registering with:", email, password);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
        photoURL: imgURL,
      });

      useAuthStore.setState({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL: imgURL,
        },
      });

      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8000/api/protected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Registration Error:", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isSignup ? "Welcome back!" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isSignup ? "Enter your credentials to log in" : "Enter your details to create an account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignup && (
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              onClick={handleRegister}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                isSignup ? "Sign in" : "Create account"
              )}
            </Button>

            <div className="relative flex justify-center items-center my-6">
              <Separator className="flex-grow" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <Separator className="flex-grow" />
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              disabled={isLoading}
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              {isSignup ? "Sign in with Google" : "Sign up with Google"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isSignup ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => {
                setIsSignup((prev) => !prev);
                setError("");
              }}
              className="text-primary hover:underline cursor-pointer"
            >
              {isSignup ? "Create account" : "Sign in"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
