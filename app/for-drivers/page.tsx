'use client';

import { Calendar, Users, Wallet, Star, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Drivers = () => {
  const steps = [
    {
      icon: <Calendar className="w-12 h-12 text-green-600" />,
      title: "Post Your Journey",
      description: "Share your travel plans and available seats with potential passengers. Simply enter your trip details, including departure location, time, and the number of available seats."
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: "Get Passengers",
      description: "Receive ride requests from verified passengers. You have full control over who joins your ride by reviewing passenger profiles, ratings, and preferences."
    },
    {
      icon: <Wallet className="w-12 h-12 text-green-600" />,
      title: "Earn Money",
      description: "Set fair pricing for your ride and earn extra income effortlessly. Payments are processed securely through the platform, ensuring a hassle-free experience."
    },
    {
      icon: <Star className="w-12 h-12 text-green-600" />,
      title: "Build Reputation",
      description: "Receive ratings and reviews from passengers after each ride. A strong profile with positive feedback increases your chances of getting more ride requests."
    },
    {
      icon: <Clock className="w-12 h-12 text-green-600" />,
      title: "Real-Time Updates",
      description: "Stay informed with live tracking and updates. Keep passengers updated about your arrival time, route changes, and estimated time of arrival."
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-green-600" />,
      title: "Safety & Security",
      description: "We ensure all drivers and passengers undergo verification. Share your trip details with family or friends for added security and peace of mind."
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      title: "Complete & Get Paid",
      description: "Once you complete the ride, payments are processed automatically. Enjoy a seamless earning experience with instant transaction notifications."
    }
  ];

  return (
    <div className="relative py-16 px-6 sm:px-12 lg:px-20 text-white">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-12">How It Works for Drivers</h2>
        <p className="text-lg text-gray-300 mb-8">Become a trusted driver and earn money while sharing your journey with passengers. Our platform makes it easy to connect with riders and ensure a smooth experience.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-lg shadow-lg transform hover:scale-105 transition duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="bg-white p-5 rounded-full shadow-lg mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-200">{step.description}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-lg text-gray-300">Start your journey as a driver today and enjoy the benefits of flexible earnings, verified passengers, and secure transactions.</p>
        <p className="mt-6 text-lg text-gray-300">Drive with confidence, knowing our platform supports you with real-time updates, safety features, and seamless payments. Get started now!</p>
      </div>
    </div>
  );
}

export default Drivers;
