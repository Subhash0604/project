'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { offerRide } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import useOfferRideStore from '../../store/useOfferRideStore';

export default function OfferRidePage() {
  const router = useRouter();
  const {
    user,
    date,
    loading,
    rideData,
    setUser,
    setDate,
    setRideData,
    setLoading,
    resetRideData,
  } = useOfferRideStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, setUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rideData.from || !rideData.to || !rideData.time || !rideData.availableSeats || !rideData.pricePerSeat || !date || !rideData.carDetails.model || !rideData.carDetails.licensePlate || !rideData.carDetails.color) {
      alert('Some fields are empty or invalid. Please check your input.');
      return;
    }

    try {
      setLoading(true);
      await offerRide({ ...rideData, date: date ? format(date, 'yyyy-MM-dd') : '' });
      alert('Ride offered successfully!');
      resetRideData();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error offering ride:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.error || 'Failed to offer ride'}`);
      }
    } finally {
      setLoading(false);
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
                  <Input id="from" name="from" value={rideData.from} onChange={(e) => setRideData('from', e.target.value)} placeholder="Enter pickup location" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">Destination</Label>
                  <Input id="to" name="to" value={rideData.to} onChange={(e) => setRideData('to', e.target.value)} placeholder="Enter destination" required />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
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
                  <Input id="time" name="time" type="time" value={rideData.time} onChange={(e) => setRideData('time', e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Available Seats</Label>
                  <Input id="seats" name="seats" type="number" min="1" max="8" value={rideData.availableSeats} onChange={(e) => setRideData('availableSeats', Number(e.target.value))} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price per Seat</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" value={rideData.pricePerSeat} onChange={(e) => setRideData('pricePerSeat', Number(e.target.value))} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carModel">Car Model</Label>
                  <Input id="carModel" name="carModel" value={rideData.carDetails.model} onChange={(e) => setRideData('carDetails', { ...rideData.carDetails, model: e.target.value })} placeholder="Enter car model" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input id="licensePlate" name="licensePlate" value={rideData.carDetails.licensePlate} onChange={(e) => setRideData('carDetails', { ...rideData.carDetails, licensePlate: e.target.value })} placeholder="Enter license plate" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carColor">Car Color</Label>
                  <Input id="carColor" name="carColor" value={rideData.carDetails.color} onChange={(e) => setRideData('carDetails', { ...rideData.carDetails, color: e.target.value })} placeholder="Enter car color" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Publishing..." : "Publish Ride"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
