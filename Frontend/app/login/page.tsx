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
import Link from "next/link";
import { Car } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import useAuthStore from "../../store/useAuthStore";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      const userFromServer = await response.json();

      useAuthStore.setState({
        user: {
          uid: userFromServer.uid,
          email: userFromServer.email,
          displayName: userFromServer.name,
          photoURL: userFromServer.picture,
          phone: userFromServer.phone,
        },
      });

      if (!userFromServer.phone) {
        router.push("/verify-phone");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      console.error("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get Firebase auth token
      const token = await user.getIdToken();

      // Call backend to create/fetch MongoDB user
      const response = await fetch("http://localhost:8000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }

      // ⭐ Get user from backend (contains phone)
      const userFromServer = await response.json();

      // ⭐ Save user in Zustand
      useAuthStore.setState({
        user: {
          uid: userFromServer.uid,
          email: userFromServer.email,
          displayName: userFromServer.name,
          photoURL: userFromServer.picture,
          phone: userFromServer.phone,
        },
      });

      // ⭐ If the user has not added phone → Force OTP verification
      if (!userFromServer.phone) {
        router.push("/verify-phone");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Email Sign-In Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
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
              />
            </div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              disabled={isLoading}
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </Button>
            <Button
              className="w-full"
              type="submit"
              onClick={handleEmailSignIn}
            >
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
