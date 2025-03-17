'use client'
import {Calendar, Users, Wallet, Star} from "lucide-react"
const Drivers = ()=>{
   const steps = [
    {
      icon: <Calendar className="w-12 h-12 text-green-500" />,
      title: "Post Your Journey",
      description: "Share your travel plans and available seats"
    },
    {
      icon: <Users className="w-12 h-12 text-green-500" />,
      title: "Get Passengers",
      description: "Accept ride requests from verified passengers"
    },
    {
      icon: <Wallet className="w-12 h-12 text-green-500" />,
      title: "Earn Money",
      description: "Receive payments automatically after completing rides"
    },
    {
      icon: <Star className="w-12 h-12 text-green-500" />,
      title: "Build Reputation",
      description: "Get reviews and build your driver profile"
    }
  ];

  return (
    <div className="py-12 md:py-16 lg:py-20 xl:py-24 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works for Drivers</h2>
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="bg-green-50 p-4 rounded-full mb-4">
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