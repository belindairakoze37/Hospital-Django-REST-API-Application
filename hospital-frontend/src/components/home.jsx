// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Shield, Users, Calendar, Clock, Award, Phone, Mail, MapPin, CheckCircle, Star, ChevronRight } from 'lucide-react';

const Home = () => {
  const stats = [
    { number: '10K+', label: 'Active Patients' },
    { number: '500+', label: 'Expert Doctors' },
    { number: '50K+', label: 'Appointments' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-primary-600">MediCare</span>
                <span className="text-xs text-gray-500 block">Hospital Management System</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/85 to-primary-900/90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Better Care,</span>
                <br />
                <span className="text-white">Better Health</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-lg">
                Streamline hospital operations and deliver exceptional patient care with our comprehensive healthcare management platform.
              </p>

              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span>HOSPITAL</span>
                </div>
                <span>•</span>
                <span>24/7 Emergency Care</span>
              </div>
            </div>

            {/* Right Content - Welcome Card */}
            <div className="relative animate-fade-in">
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Welcome to MediCare</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Experience world-class healthcare management designed for hospitals, clinics, and healthcare professionals. Streamline your operations and enhance patient care with our intuitive platform.
                  </p>
                 
                </div>

                <div className="space-y-3">
                  <Link 
                    to="/login"
                    className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Sign In
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    By continuing, you agree to our Terms of Use and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      
     

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">MediCare</span>
                  <span className="text-xs text-gray-400 block">Hospital Management</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Providing trusted care 24 hours a day – from emergency to specialized treatment.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Services</a></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>+256761714327</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>info@medicare.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>123 Healthcare Blvd, Kampala</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-3">Subscribe for health tips & updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-r-lg hover:shadow-lg transition-all duration-300 text-sm font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 MediCare. All rights reserved. Made with ❤️ for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;