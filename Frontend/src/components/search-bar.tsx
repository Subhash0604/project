import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchBarProps {
  onSearch: (searchParams: {
    from: string;
    to: string;
    date: string;
    passengers: string;
  }) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    onSearch({
      from: formData.get('from') as string,
      to: formData.get('to') as string,
      date: formData.get('date') as string,
      passengers: formData.get('passengers') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="from" placeholder="From" className="pl-10" />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="to" placeholder="To" className="pl-10" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="date" type="date" className="pl-10" />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Select name="passengers">
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
        <Button type="submit" className="w-full">Search</Button>
      </div>
    </form>
  );
}