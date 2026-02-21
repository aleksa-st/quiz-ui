import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook, Twitter, Instagram, Youtube, Globe, CheckCircle2 } from 'lucide-react';

import { Settings } from '../../types';

interface ContactPageProps {
    settings: Settings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Mock API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    const socialPlatforms = [
        { Icon: Facebook, url: settings?.social_facebook },
        { Icon: Twitter, url: settings?.social_twitter },
        { Icon: Instagram, url: settings?.social_instagram },
        { Icon: Youtube, url: settings?.social_youtube },
        { Icon: Globe, url: settings?.social_globe || '#' }
    ].filter(p => p.url);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pt-20">
            {/* Header */}
            <section className="bg-violet-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Contact Us</h1>
                    <p className="text-xl text-violet-100 max-w-2xl mx-auto">
                        {settings?.welcome_message || "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                    </p>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                            {submitted ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4">Message Sent!</h2>
                                    <p className="text-slate-600 mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
                                    <Button onClick={() => setSubmitted(false)} variant="outline">
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                            <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                            <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                                        <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="Inquiry about Programs" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                        <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none" placeholder="How can we help you?"></textarea>
                                    </div>
                                    <Button type="submit" size="xl" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg" disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="ml-2 w-5 h-5" />
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col justify-center">
                            <h2 className="text-3xl font-black text-slate-900 mb-8">Get in Touch</h2>
                            <div className="space-y-8 mb-12">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center flex-shrink-0 text-violet-600">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Email Us</h4>
                                        <p className="text-slate-600">{settings?.contact_email || 'info@kalamschool.org'}</p>
                                        {settings?.contact_email_support && <p className="text-slate-600">{settings.contact_email_support}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center flex-shrink-0 text-violet-600">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Call Us</h4>
                                        <p className="text-slate-600">{settings?.contact_phone || '+91 98765 43210'}</p>
                                        <p className="text-slate-600">{settings?.contact_working_hours || 'Mon - Sat, 9:00 AM - 6:00 PM'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center flex-shrink-0 text-violet-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Our Location</h4>
                                        <p className="text-slate-600 leading-relaxed max-w-xs">{settings?.contact_address || 'Chennai, Tamil Nadu, India'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-violet-50 p-8 rounded-3xl border border-violet-100 mb-8">
                                <h4 className="font-black text-violet-900 mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" /> Quick Connect
                                </h4>
                                <p className="text-violet-800/70 mb-6">For immediate assistance, join our WhatsApp group or message us directly.</p>
                                <a href={settings?.whatsapp_url || '#'} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-[#25D366] hover:bg-[#20ba59] border-0 text-white font-bold w-full md:w-auto">
                                        Chat on WhatsApp
                                    </Button>
                                </a>
                            </div>

                            <div className="flex gap-4">
                                {socialPlatforms.map(({ Icon, url }, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-violet-600 hover:text-white transition-all">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Integration Placeholder */}
            <section className="h-96 w-full bg-slate-200 relative grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xl uppercase tracking-widest">
                    Google Maps Integration
                </div>
                {/* Real iframe could go here */}
            </section>
        </div>
    );
};

