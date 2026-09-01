// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Stethoscope, 
  Users, 
  Calendar, 
  Clock, 
  Shield, 
  Award, 
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

// Social icons - these are the correct names in lucide-react
// Note: Some versions may not have social icons. Let's use simple alternatives.
const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Easily manage patient records, medical history, and appointments all in one place.'
    },
    {
      icon: Stethoscope,
      title: 'Doctor Dashboard',
      description: 'Doctors can view schedules, patient information, and manage appointments efficiently.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Intelligent appointment scheduling with real-time availability and automatic reminders.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted data and HIPAA compliant practices.'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant notifications and updates about appointments and patient status.'
    },
    {
      icon: Award,
      title: 'Quality Care',
      description: 'Deliver exceptional patient care with our comprehensive healthcare management tools.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Patients' },
    { number: '500+', label: 'Expert Doctors' },
    { number: '50K+', label: 'Appointments' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Cardiologist',
      content: 'MediCare has transformed how I manage my practice. The intuitive interface and powerful features save me hours every day.'
    },
    {
      name: 'John Smith',
      role: 'Hospital Administrator',
      content: 'Managing a large hospital has never been easier. MediCare provides everything we need in one comprehensive platform.'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Pediatrician',
      content: 'The patient management system is exceptional. I can easily track patient history and provide better care.'
    }
  ];

  // Simple social icon components using SVG
  const SocialIcon = ({ children, href, label }) => (
    <a 
      href={href} 
      className="text-gray-400 hover:text-white transition-colors"
      aria-label={label}
    >
      {children}
    </a>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold gradient-text">MediCare</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary-500 transition-colors">Testimonials</a>
            <a href="#contact" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</a>
            <Link to="/login" className="btn-primary">
              Get Started
            </Link>
          </div>
          <Link to="/login" className="md:hidden btn-primary text-sm px-4 py-2">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </span>
                <span className="text-sm font-medium text-primary-700">Healthcare Management Platform</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text">Modern Healthcare</span>
                <br />
                <span className="text-gray-800">Management System</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline your hospital operations with our comprehensive healthcare management platform. 
                Manage patients, appointments, and medical records with ease.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="btn-primary text-lg flex items-center gap-2 group">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="btn-secondary text-lg">
                  Learn More
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Trusted by 1000+ healthcare professionals</span>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative hidden lg:block animate-fade-in">
              <div className="relative">
                <div className="glass-card rounded-3xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Total Patients</p>
                        <p className="text-2xl font-bold text-primary-600">2,847</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Today's Appointments</p>
                        <p className="text-2xl font-bold text-green-600">24</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Available Doctors</p>
                        <p className="text-2xl font-bold text-purple-600">12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text">Powerful Features</h2>
            <p className="text-xl text-gray-600 mt-4">Everything you need to run your healthcare facility efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text">What Our Users Say</h2>
            <p className="text-xl text-gray-600 mt-4">Real testimonials from healthcare professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Management?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of healthcare professionals who trust MediCare
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Contact/Footer Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-8 h-8 text-primary-400" />
                <span className="text-2xl font-bold">MediCare</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Modern healthcare management system for hospitals and clinics.
              </p>
              <div className="flex gap-4 mt-6">
                {/* Social icons using simple text instead of icons */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  📘
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  🐦
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  💼
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  📸
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@medicare.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Healthcare Blvd, NY</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Get updates on new features</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-500 rounded-r-lg hover:bg-primary-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;