'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const getValidationErrors = (nameValue: string, emailValue: string, messageValue: string) => {
        const newErrors = { name: '', email: '', message: '' };

        if (nameValue && nameValue.length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValue && !emailRegex.test(emailValue)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (messageValue && messageValue.length < 10) {
            newErrors.message = 'Message must be at least 10 characters.';
        }

        return newErrors;
    };

    const isFormValid =
        !errors.name &&
        !errors.email &&
        !errors.message &&
        !!formData.name &&
        !!formData.email &&
        !!formData.message;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        setErrors(getValidationErrors(newFormData.name, newFormData.email, newFormData.message));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = getValidationErrors(formData.name, formData.email, formData.message);
        setErrors(newErrors);
        if (newErrors.name || newErrors.email || newErrors.message) {
            return;
        }
        setSubmitted(true);
        toast({
            variant: 'success',
            title: 'Form submitted successfully!',
            description: "We've received your message and will get back to you soon.",
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <section className="relative py-12 md:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-background" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Get in{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                            Touch
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="p-8 rounded-lg border border-border bg-card/50">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                    <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name" name="name" placeholder="Your name"
                                            value={formData.name} onChange={handleChange} required
                                            className={`h-12 bg-input border-border text-foreground placeholder:text-muted-foreground ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email" name="email" type="email" placeholder="you@example.com"
                                            value={formData.email} onChange={handleChange} required
                                            className={`h-12 bg-input border-border text-foreground placeholder:text-muted-foreground ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message" name="message" placeholder="Your message..."
                                            value={formData.message} onChange={handleChange} required rows={5}
                                            className={`bg-input border-border text-foreground placeholder:text-muted-foreground resize-none ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!isFormValid}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed text-base font-bold"
                                    >
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <p className="text-muted-foreground mb-8">
                                    Reach out through the form, or use any of the methods below. We typically respond within one business day.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'support@skillforge.com' },
                                    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+1 (555) 123-4567' },
                                    { icon: <MapPin className="w-5 h-5" />, label: 'Office', value: 'San Francisco, CA 94105' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50">
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{item.label}</p>
                                            <p className="font-semibold">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
