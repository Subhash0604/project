'use client';

import { Calendar, Users, Wallet, Star, Car, CheckCircle, MapPin, Clock, Shield, Route, Fuel, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const Drivers = () => {
  const steps = [
    {
      icon: <Calendar className="w-12 h-12 text-blue-500" />,
      title: "Post Your Journey",
      description: "Share your travel plans and available seats to find passengers."
    },
    {
      icon: <Users className="w-12 h-12 text-blue-500" />,
      title: "Get Passengers",
      description: "Accept ride requests from verified passengers effortlessly."
    },
    {
      icon: <Wallet className="w-12 h-12 text-blue-500" />,
      title: "Earn Money",
      description: "Receive payments instantly after successfully completing a ride."
    },
    {
      icon: <Star className="w-12 h-12 text-blue-500" />,
      title: "Build Reputation",
      description: "Get reviews and establish trust with passengers for future rides."
    },
    {
      icon: <Car className="w-12 h-12 text-blue-500" />,
      title: "Drive on Your Terms",
      description: "Enjoy complete flexibility—drive whenever and wherever you want."
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
      title: "Safety First",
      description: "All passengers are verified, ensuring a secure ride-sharing experience."
    },
    {
      icon: <MapPin className="w-12 h-12 text-blue-500" />,
      title: "Smart Navigation",
      description: "Use our built-in navigation for hassle-free and optimized routes."
    },
    {
      icon: <Clock className="w-12 h-12 text-blue-500" />,
      title: "Punctual & Reliable",
      description: "Stay on schedule with ride reminders and timely notifications."
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-500" />,
      title: "24/7 Support",
      description: "Get round-the-clock assistance for any concerns while driving."
    },
    {
      icon: <Route className="w-12 h-12 text-blue-500" />,
      title: "Efficient Routing",
      description: "Optimize your routes to save time and fuel."
    },
    {
      icon: <Fuel className="w-12 h-12 text-blue-500" />,
      title: "Fuel Savings",
      description: "Share rides and cut down on fuel costs while earning money."
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-blue-500" />,
      title: "Instant Communication",
      description: "Easily chat with passengers for smooth coordination."
    }
  ];

  return (
    <div className="py-12 md:py-16 lg:py-20 xl:py-24 px-4 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 text-blue-700">How It Works for Drivers</h2>
      <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-8">
        Join a growing community of drivers who are earning money while making travel more affordable and eco-friendly.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-lg transition"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="bg-white p-4 rounded-full mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-gray-600 mt-12 text-lg max-w-3xl mx-auto">
        Driving with us is simple, secure, and rewarding. Sign up today and start making money on your own schedule.
        Whether you’re driving daily or occasionally, your car can help you earn while connecting people.
        Enjoy real-time support, optimized routes, and a safe ride-sharing experience.
      </p>
    </div>
  );
};

export default Drivers;