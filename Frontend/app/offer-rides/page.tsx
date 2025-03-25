
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Car, DollarSign } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function OfferRidePage() {
  const [user, setUser] = useState<any>(null);
  const [date, setDate] = useState<Date>();
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
    const formData = new FormData(e.currentTarget);
    
    const rideData = {
      from: formData.get('from'),
      to: formData.get('to'),
      date: date,
      time: formData.get('time'),
      seats: formData.get('seats'),
      price: formData.get('price'),
      distance: formData.get('distance'),
      description: formData.get('description'),
      driverId: user.uid,
      driverName: user.displayName
    };

    // TODO: Implement API call to save ride data
    console.log(rideData);
    
    // Redirect to dashboard after successful submission
    router.push('/dashboard');
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
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
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

                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <div className="relative">
                    <Car className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="distance" name="distance" type="number" min="0" className="pl-8" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Information</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Add any additional details about the ride..."
                />
              </div>

              <Button type="submit" className="w-full">
                Publish Ride
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
