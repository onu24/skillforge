'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'name') {
            if (!value) error = 'Name required';
            else if (value.length < 2) error = 'Name must be at least 2 characters';
        }
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'Email required';
            else if (!emailRegex.test(value)) error = 'Invalid email address';
        }
        if (name === 'message') {
            if (!value) error = 'Message required';
            else if (value.length < 10) error = 'Message too short (min 10 characters)';
        }
        return error;
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
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = {
            name: validateField('name', formData.name),
            email: validateField('email', formData.email),
            message: validateField('message', formData.message)
        };
        setErrors(newErrors);

        if (newErrors.name || newErrors.email || newErrors.message) return;

        setIsSubmitting(true);

        try {
            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSubmitted(true);
            toast({
                variant: 'success',
                title: 'Message sent successfully!',
                description: "We'll respond within 24 hours.",
            });

            // Revert back after a few seconds to show form again (optional, for demo)
            setTimeout(() => {
                setFormData({ name: '', email: '', message: '' });
                setErrors({ name: '', email: '', message: '' });
                setSubmitted(false);
            }, 3000);

        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Failed to send message',
                description: 'Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Breadcrumbs />

            <section className="relative py-12 md:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-background to-background" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        Get in{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#0097A7]">
                            Touch
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground leading-relaxed"
                    >
                        Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
                    </motion.p>
                </div>
            </section>

            <section className="py-16 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="p-8 rounded-2xl border border-border bg-card/50 shadow-sm relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 text-emerald-500">Message Sent!</h3>
                                        <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-bold mb-4">Send us a message</h2>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="name">Full Name</Label>
                                                {formData.name && !errors.name && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <Input
                                                id="name" name="name" placeholder="Your name"
                                                value={formData.name} onChange={handleChange}
                                                className={cn(
                                                    "h-12 bg-input border-border text-foreground transition-all",
                                                    errors.name && "border-red-500 focus-visible:ring-red-500/20",
                                                    formData.name && !errors.name && "border-emerald-500/50"
                                                )}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="email">Email Address</Label>
                                                {formData.email && !errors.email && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <Input
                                                id="email" name="email" type="email" placeholder="you@example.com"
                                                value={formData.email} onChange={handleChange}
                                                className={cn(
                                                    "h-12 bg-input border-border text-foreground transition-all",
                                                    errors.email && "border-red-500 focus-visible:ring-red-500/20",
                                                    formData.email && !errors.email && "border-emerald-500/50"
                                                )}
                                            />
                                            {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="message">Message</Label>
                                                {formData.message && !errors.message && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <Textarea
                                                id="message" name="message" placeholder="How can we help?"
                                                value={formData.message} onChange={handleChange} rows={5}
                                                className={cn(
                                                    "bg-input border-border text-foreground resize-none transition-all",
                                                    errors.message && "border-red-500 focus-visible:ring-red-500/20",
                                                    formData.message && !errors.message && "border-emerald-500/50"
                                                )}
                                            />
                                            {errors.message && <p className="text-red-500 text-xs font-medium">{errors.message}</p>}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={!isFormValid || isSubmitting}
                                            className="w-full h-12 text-base font-bold shadow-lg"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Sending...
                                                </span>
                                            ) : 'Send Message'}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <p className="text-muted-foreground mb-8 text-lg">
                                    Reach out through the form, or use any of the methods below. We typically respond within one business day.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { icon: <Mail className="w-6 h-6" />, label: 'Email Support', value: 'support@skillforge.com' },
                                    { icon: <Phone className="w-6 h-6" />, label: 'Customer Helpline', value: '+1 (555) 123-4567' },
                                    { icon: <MapPin className="w-6 h-6" />, label: 'Headquarters', value: 'San Francisco, CA 94105' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50 transition-hover hover:border-[#00BCD4]/30 group">
                                        <div className="w-12 h-12 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center text-[#00BCD4] flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                                            <p className="font-bold text-lg">{item.value}</p>
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
