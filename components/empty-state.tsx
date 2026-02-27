'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    ctaText?: string;
    ctaAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    message,
    ctaText,
    ctaAction
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center text-center py-[60px] px-[40px] space-y-[12px]"
        >
            <div className="bg-muted/30 p-8 rounded-full mb-2">
                <Icon className="w-[80px] h-[80px] text-muted-foreground/40 stroke-[1.5px]" />
            </div>
            <h2 className="text-[24px] font-bold text-foreground">
                {title}
            </h2>
            <p className="text-[16px] text-muted-foreground max-w-md">
                {message}
            </p>
            {ctaText && ctaAction && (
                <div className="pt-4">
                    <Button
                        onClick={ctaAction}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12"
                    >
                        {ctaText}
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
