'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, Users, Car, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const upcomingRides = [
    {
      id: 1,
      from: 'San Francisco',
      to: 'Los Angeles',
      date: '2025-04-15',
      time: '09:00 AM',
      passengers: 2,
      price: 45,
    },
    {
      id: 2,
      from: 'Los Angeles',
      to: 'San Diego',
      date: '2025-04-18',
      time: '10:30 AM',
      passengers: 1,
      price: 30,
    },
  ];

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, John</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Distance Traveled</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,204 km</div>
              <p className="text-xs text-muted-foreground">+123 km from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342 kg</div>
              <p className="text-xs text-muted-foreground">+42 kg from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Rides</TabsTrigger>
            <TabsTrigger value="past">Past Rides</TabsTrigger>
            <TabsTrigger value="offered">Offered Rides</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingRides.map((ride) => (
              <Card key={ride.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{ride.from} → {ride.to}</span>
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
                          {ride.passengers} passenger(s)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold">${ride.price}</div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}