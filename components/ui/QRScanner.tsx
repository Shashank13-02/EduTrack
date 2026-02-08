'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScanSuccess, onScanFailure, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScannerInitialised, setIsScannerInitialised] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create an instance of the scanner
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const startScanner = async () => {
            try {
                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await scanner.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        // Success callback
                        onScanSuccess(decodedText);
                        // Stop scanner after success to prevent multiple scans
                        stopScanner();
                    },
                    (errorMessage) => {
                        // Failure callback (often frequent during search, so we handle it silently unless passed)
                        if (onScanFailure) onScanFailure(errorMessage);
                    }
                );
                setIsScannerInitialised(true);
            } catch (err: any) {
                console.error('Failed to start scanner:', err);
                setError(err.message || 'Failed to access camera. Please ensure permissions are granted.');
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <Camera className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Scan QR Code</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border-2 border-dashed border-primary/50">
                        <div id="qr-reader" className="w-full h-full"></div>

                        {!isScannerInitialised && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 space-y-3">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                                <p className="text-sm font-medium">Initialising Camera...</p>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-400 space-y-4">
                                <X className="w-12 h-12" />
                                <p className="text-sm font-semibold">{error}</p>
                                <Button size="sm" onClick={onClose} variant="secondary">Close</Button>
                            </div>
                        )}

                        {isScannerInitialised && (
                            <div className="absolute inset-0 border-[30px] border-black/30 pointer-events-none">
                                <div className="w-full h-full border-2 border-white/50 relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>

                                    {/* Scanning Animation Line */}
                                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Point your camera at the attendance QR code displayed by your teacher.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 10%; }
                    100% { top: 90%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 2s linear infinite;
                }
                #qr-reader {
                    border: none !important;
                }
                #qr-reader__scan_region video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                #qr-reader__dashboard {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
