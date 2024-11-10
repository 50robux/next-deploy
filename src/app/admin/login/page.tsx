'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BOOT_MESSAGES = [
    { text: '\x1b[32mNEXUS-OS v7.2.1 CLASSIFIED TERMINAL\x1b[0m', delay: 100 },
    { text: '[KERNEL] Loading secure modules...', delay: 50 },
    { text: '[SYSTEM] Quantum encryption activated', delay: 50 },
    { text: '\nnexus-terminal login: ', delay: 50 },
];

export default function AdminLoginPage() {
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phase, setPhase] = useState<'boot' | 'username' | 'password'>('boot');
    const [messages, setMessages] = useState<string[]>([]);
    const [showCursor, setShowCursor] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleEnter();
            } else if (e.key === 'Backspace') {
                setInput(prev => prev.slice(0, -1));
            } else if (e.key.length === 1) {
                setInput(prev => prev + e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, input, username]);

    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 600);
        return () => clearInterval(cursorTimer);
    }, []);

    useEffect(() => {
        let timeoutIds: NodeJS.Timeout[] = [];
        let currentDelay = 0;

        BOOT_MESSAGES.forEach((message, index) => {
            const timeoutId = setTimeout(() => {
                setMessages(prev => [...prev, message.text]);
                if (index === BOOT_MESSAGES.length - 1) {
                    setPhase('username');
                }
            }, currentDelay);

            currentDelay += message.delay;
            timeoutIds.push(timeoutId);
        });

        return () => timeoutIds.forEach(id => clearTimeout(id));
    }, []);

    const handleEnter = async () => {
        if (phase === 'username') {
            setUsername(input);
            setInput('');
            setMessages(prev => [...prev, input, '']);
            setPhase('password');
        } else if (phase === 'password') {
            const attemptedPassword = input;
            setInput('');

            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: attemptedPassword }),
                });
                const data = await res.json();

                if (data.success) {
                    setMessages(prev => [
                        ...prev,
                        '\x1b[32m[ACCESS GRANTED]\x1b[0m',
                        'Initializing secure session...'
                    ]);
                    setTimeout(() => {
                        router.refresh();
                        router.replace('/admin/videos');
                        console.log("Redirecting to admin page")
                    }, 500);
                } else {
                    setMessages(prev => [
                        ...prev,
                        '\x1b[31m[ACCESS DENIED]\x1b[0m',
                        '\nnexus-terminal login: '
                    ]);
                    setPhase('username');
                    setUsername('');
                    setPassword('');
                }
            } catch (error) {
                setMessages(prev => [
                    ...prev,
                    '\x1b[31m[SYSTEM ERROR]\x1b[0m',
                    '\nnexus-terminal login: '
                ]);
                setPhase('username');
                setUsername('');
                setPassword('');
            }
        }
    };

    return (
        <div
            className="min-h-screen bg-black text-green-400 font-mono text-sm cursor-text select-none"
            ref={containerRef}
        >
            <div>
                {/* Messages */}
                <div className="whitespace-pre-line">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            dangerouslySetInnerHTML={{
                                __html: message
                                    .replace(/\x1b\[32m/g, '<span class="text-green-500">')
                                    .replace(/\x1b\[31m/g, '<span class="text-red-500">')
                                    .replace(/\x1b\[0m/g, '</span>')
                            }}
                        />
                    ))}
                </div>

                {/* Current Input Line */}
                <div className="flex">
                    {phase === 'password' ? (
                        <>
                            <span>{username}@nexus-terminal's key: </span>
                            <span className="inline-flex">
                                {'*'.repeat(input.length)}
                                <span
                                    className={`inline-block w-2 h-5 bg-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </span>
                        </>
                    ) : (
                        <div className="flex">
                            <span>{input}</span>
                            <span
                                className={`inline-block w-2 h-5 bg-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
        body {
          background: black;
          margin: 0;
          padding: 0;
        }
        ::selection {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }
      `}</style>
        </div>
    );
}