"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioRecorderStatus = "idle" | "recording" | "paused" | "stopped" | "unsupported";

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<AudioRecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("unsupported");
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.start(1000);
      setStatus("recording");
    } catch {
      setError("microphone unavailable");
      setStatus("idle");
      cleanupStream();
    }
  }, [cleanupStream]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state !== "recording") return;
    recorderRef.current.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current?.state !== "paused") return;
    recorderRef.current.resume();
    setStatus("recording");
  }, []);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setStatus("stopped");
      return undefined;
    }

    const mimeType = recorder.mimeType || "audio/webm";

    const audio = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        resolve(blob);
      };
      recorder.stop();
    });

    cleanupStream();
    recorderRef.current = null;
    setStatus("stopped");
    return audio;
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    error,
    isRecording: status === "recording",
    status,
    pause,
    resume,
    start,
    stop,
  };
}
