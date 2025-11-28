"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { AddNumber } from "@/lib/api";
import { useRouter } from "next/navigation";

const PhoneVerificationPage = () => {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    if (!phone) return alert("Please enter your phone number");
    // Here you can call your backend to send OTP
    const data = await AddNumber(phone);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col gap-6 w-full max-w-sm p-6">
        <h1 className="text-white text-3xl font-bold text-center">
          Add Mobile Number
        </h1>
        <Input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          required
          onChange={(e) => setPhone(e.target.value)}
          className="bg-black text-white border border-white placeholder-white focus:ring-white focus:border-white"
        />
        <Button
          onClick={handleVerify}
          className="bg-white text-black hover:bg-gray-200"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
