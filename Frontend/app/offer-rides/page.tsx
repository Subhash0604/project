'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { offerRide } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Car, DollarSign, Tag } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function OfferRidePage() {
  const [user, setUser] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const rideData = {
      from: formData.get("from")?.toString().trim() || "",
      to: formData.get("to")?.toString().trim() || "",
      date: date ? format(date, "yyyy-MM-dd") : "",
      time: formData.get("time")?.toString() || "",
      availableSeats: Number(formData.get("seats")) || 0,
      pricePerSeat: Number(formData.get("price")) || 0,
      carDetails: {
        model: formData.get("carModel")?.toString().trim() || "",
        licensePlate: formData.get("licensePlate")?.toString().trim() || "",
        color: formData.get("carColor")?.toString().trim() || "",
      },
    };

    if (Object.values(rideData).some((val) => val === "" || val === 0)) {
      alert("Some fields are empty or invalid. Please check your input.");
      return;
    }

     try {
      const response = await offerRide(rideData);
      alert("Ride offered successfully!");

      form.reset();
      setDate(null);
      router.push("/dashboard");
      } catch (error: any) {
        console.error("Error offering ride:", error);
        if (error.response) {
          console.error(" API Response:", error.response.data);
          alert(`Error: ${error.response.data.error || "Failed to offer ride"}`);
        }
      }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Offer a Ride</CardTitle>
            <CardDescription>Share your journey details with potential passengers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="from">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="from" name="from" className="pl-8" placeholder="Enter pickup location" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="to" name="to" className="pl-8" placeholder="Enter destination" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="time" name="time" type="time" className="pl-8" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Available Seats</Label>
                  <div className="relative">
                    <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="seats" name="seats" type="number" min="1" max="8" className="pl-8" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price per Seat</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="price" name="price" type="number" min="0" step="0.01" className="pl-8" required />
                  </div>
                </div>

                {/* Car Details Fields */}
                <div className="space-y-2">
                  <Label htmlFor="carModel">Car Model</Label>
                  <Input id="carModel" name="carModel" placeholder="e.g., Honda Civic" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input id="licensePlate" name="licensePlate" placeholder="e.g., ABC-1234" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carColor">Car Color</Label>
                  <Input id="carColor" name="carColor" placeholder="e.g., Black" required />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Publishing..." : "Publish Ride"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
