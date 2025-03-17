'use client';

import { Car, MapPin, CreditCard, ThumbsUp, Clock, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

const Drivers = () => {
  const steps = [
    {
      icon: <MapPin className="w-12 h-12 text-blue-600" />,
      title: "Enter Your Destination",
      description: "Tell us where you want to go and when you need to travel. Simply enter your pickup location and destination in our user-friendly app. The system will then provide you with available ride options, ensuring you have a seamless experience."
    },
    {
      icon: <Car className="w-12 h-12 text-blue-600" />,
      title: "Match with Drivers",
      description: "Browse available rides and choose your preferred driver. Each driver profile includes ratings, reviews, and estimated time of arrival, allowing you to make an informed decision about your ride."
    },
    {
      icon: <CreditCard className="w-12 h-12 text-blue-600" />,
      title: "Book & Pay",
      description: "Secure your ride with our easy payment system. Choose from multiple payment options, including credit/debit cards, digital wallets, and cash (where available). A transparent pricing model ensures you know the fare upfront."
    },
    {
      icon: <ThumbsUp className="w-12 h-12 text-blue-600" />,
      title: "Enjoy Your Ride",
      description: "Travel comfortably and save money while reducing carbon emissions. Our drivers are trained to provide excellent service, ensuring you reach your destination safely and on time."
    },
    {
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: "Real-Time Tracking",
      description: "Stay updated with real-time tracking of your ride. Know exactly when your driver will arrive and follow your journey on the map for added convenience and safety."
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      title: "Safety & Security",
      description: "All our drivers undergo background checks and vehicle inspections to ensure your safety. Additionally, you can share your ride details with friends and family for extra peace of mind."
    },
    {
      icon: <Star className="w-12 h-12 text-blue-600" />,
      title: "Rate & Review",
      description: "Provide feedback after your ride to help us maintain high-quality service. Rate your driver and share your experience to improve the ride-sharing community."
    }
  ];

  return (
    <div className="relative py-16 px-6 sm:px-12 lg:px-20 text-white bg-cover bg-center" style={{ backgroundImage: "url('/bg-rideshare.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-12">How It Works for Passengers</h2>
        <p className="text-lg text-gray-300 mb-8">Our ride-sharing platform is designed to make traveling easy, efficient, and affordable. Follow these simple steps to book your next ride effortlessly.</p>
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
        <p className="mt-12 text-lg text-gray-300">With just a few taps, you can book a safe and reliable ride to your destination. Join thousands of satisfied passengers and enjoy a seamless travel experience today!</p>
        <p className="mt-6 text-lg text-gray-300">Experience stress-free travel with our trusted ride-sharing service. Whether you're commuting to work, heading to an event, or exploring a new city, we've got you covered with professional drivers, secure payments, and real-time tracking.</p>
      </div>
    </div>
  );
}

export default Drivers;
