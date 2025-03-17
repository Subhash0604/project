'use client'
import {Car, MapPin, CreditCard, ThumbsUp, } from "lucide-react";

const Drivers = ()=>{
    const steps = [
    {
      icon: <MapPin className="w-12 h-12 text-blue-500" />,
      title: "Enter Your Destination",
      description: "Tell us where you want to go and when you need to travel"
    },
    {
      icon: <Car className="w-12 h-12 text-blue-500" />,
      title: "Match with Drivers",
      description: "Browse available rides and choose your preferred driver"
    },
    {
      icon: <CreditCard className="w-12 h-12 text-blue-500" />,
      title: "Book & Pay",
      description: "Secure your ride with our easy payment system"
    },
    {
      icon: <ThumbsUp className="w-12 h-12 text-blue-500" />,
      title: "Enjoy Your Ride",
      description: "Travel comfortably and save money while reducing carbon emissions"
    }
  ];

  return (
    <div className="py-12 md:py-16 lg:py-20 xl:py-24  px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works for Passengers</h2>
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Drivers;