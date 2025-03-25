import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Clock, Users, Car } from 'lucide-react';

interface RideCardProps {
  ride: {
    id: number;
    driver: string;
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    price: number;
    car: string;
    rating: number;
  };
  onBook?: () => void;
}

export function RideCard({ ride, onBook }: RideCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
            <Button onClick={onBook}>Book Now</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}