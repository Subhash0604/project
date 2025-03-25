'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { CarFront, User } from 'lucide-react';

export function MainNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <CarFront className="h-6 w-6" />
          <span className="font-bold text-xl">HopNGo</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className=''>Find Rides</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 w-[400px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/rides"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Search Rides</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Find available rides that match your route and schedule
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/rides"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Offer a Ride</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Share your journey and help others travel sustainably
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>How It Works</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 w-[400px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-passengers"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">For Passengers</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Learn how to find and book rides safely
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-drivers"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">For Drivers</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Learn how to offer rides and manage bookings
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <User className="h-5 w-5 mr-2" />
              Login
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
