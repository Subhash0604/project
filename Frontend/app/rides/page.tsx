'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, Calendar, Clock, Users, Car, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RidesPage() {
  const rides = [
    {
      id: 1,
      driver: 'Sarah Johnson',
      from: 'San Francisco',
      to: 'Los Angeles',
      date: '2025-04-15',
      time: '09:00 AM',
      seats: 3,
      price: 45,
      car: 'Tesla Model 3',
      rating: 4.8,
    },
    {
      id: 2,
      driver: 'Michael Chen',
      from: 'Los Angeles',
      to: 'San Diego',
      date: '2025-04-15',
      time: '10:30 AM',
      seats: 2,
      price: 30,
      car: 'Toyota Prius',
      rating: 4.9,
    },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Search Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="From" className="pl-10" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="To" className="pl-10" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="date" className="pl-10" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Select>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Search</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$100</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Departure Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">Reset Filters</Button>
            </CardContent>
          </Card>

          {/* Rides List */}
          <div className="lg:col-span-3 space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{ride.driver}</h3>
                          <p className="text-sm text-muted-foreground">{ride.car}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{ride.from} → {ride.to}</span>
                        </div>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {ride.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {ride.time}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {ride.seats} seats available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-between">
                      <div className="text-2xl font-bold">${ride.price}</div>
                      <Button>Book Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}