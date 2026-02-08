'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    decimals?: number;
}

export function AnimatedCounter({
    value,
    duration = 1.5,
    className = '',
    suffix = '',
    decimals = 0
}: AnimatedCounterProps) {
    const counterRef = useRef<HTMLSpanElement>(null);
    const previousValueRef = useRef(0);

    useEffect(() => {
        if (!counterRef.current) return;

        const counter = { val: previousValueRef.current };

        gsap.to(counter, {
            val: value,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                if (counterRef.current) {
                    counterRef.current.textContent = counter.val.toFixed(decimals);
                }
            },
        });

        previousValueRef.current = value;
    }, [value, duration, decimals]);

    return (
        <span className={className}>
            <span ref={counterRef}>0</span>
            {suffix}
        </span>
    );
}
