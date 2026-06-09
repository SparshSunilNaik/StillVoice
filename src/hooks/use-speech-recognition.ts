"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
}

type RecordingStatus = "idle" | "listening" | "paused" | "stopped" | "unsupported";

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const transcript = [finalTranscript, interimTranscript].filter(Boolean).join(" ").trim();

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let committed = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          committed += `${text.trim()} `;
        } else {
          interim += text;
        }
      }

      if (committed) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${committed}`.trim();
        setFinalTranscript(finalTranscriptRef.current);
      }

      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      setError(event.error.replace(/-/g, " "));
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // Browsers can reject immediate restarts while the engine settles.
        }
      }
    };

    return recognition;
  }, []);

  const start = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) {
      setStatus("unsupported");
      return;
    }

    setError(null);
    setStatus("listening");
    shouldRestartRef.current = true;
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError("microphone unavailable");
    }
  }, [createRecognition]);

  const pause = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setInterimTranscript("");
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterimTranscript("");
    setStatus("stopped");
  }, []);

  useEffect(() => {
    if (status !== "listening") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    elapsedSeconds,
    error,
    isListening: status === "listening",
    isPaused: status === "paused",
    status,
    transcript,
    start,
    pause,
    resume,
    stop,
  };
}
