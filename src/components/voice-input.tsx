"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, StopCircle, Loader2, Sparkles } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export function VoiceInput({ onTranscript, placeholder = "Speak to create task or event..." }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    if (transcript) {
      setIsProcessing(true);
      // Simulate AI processing
      setTimeout(() => {
        onTranscript(transcript);
        setTranscript("");
        setIsProcessing(false);
      }, 1000);
    }
  }, [transcript, onTranscript]);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
          isListening
            ? "bg-red-500/10 border-red-500/30 animate-pulse"
            : "bg-zinc-900/50 border-white/[0.06] hover:border-white/10"
        }`}
      >
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500 text-white"
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <StopCircle className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          {isListening ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-red-400">Listening...</span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-sm text-violet-400">AI processing...</span>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">{placeholder}</p>
          )}
          {transcript && (
            <p className="text-sm text-white mt-1">&quot;{transcript}&quot;</p>
          )}
        </div>
      </div>

      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-zinc-500">
            Try saying: &quot;Schedule a meeting with John tomorrow at 2pm for 1 hour&quot;
          </p>
        </div>
      )}
    </div>
  );
}