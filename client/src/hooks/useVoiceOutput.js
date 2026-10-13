import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React hook for Text-to-Speech (Voice Output)
 * Provides speech synthesis with Indian voice detection, markdown sanitization,
 * trackable playing states per message ID, and clean audio interruption.
 */
export function useVoiceOutput() {
  const [speakingId, setSpeakingId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text, id = 'global', lang = 'en') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Toggle off if currently speaking the same item
    if (isSpeaking && speakingId === id) {
      stop();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Strip markdown formatting, symbols, emojis, and code blocks for clean narration
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code example omitted.')
      .replace(/[*#`_~>\[\]\(\)\{\}\\|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92; // Slightly measured pace for school students
    utterance.pitch = 1.0;

    // Pick best matching voice (Odia / Hindi / Indian English)
    const matchingVoice = voices.find(v => {
      const vl = v.lang?.toLowerCase() || '';
      if (lang === 'or' && (vl.includes('or') || vl.includes('hi') || vl.includes('in'))) return true;
      if (vl.includes('en-in') || vl.includes('en_in')) return true;
      return false;
    });

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setSpeakingId(id);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setSpeakingId(null);
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setIsSpeaking(false);
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voices, isSpeaking, speakingId, stop]);

  return {
    isSpeaking,
    speakingId,
    speak,
    stop,
  };
}

export default useVoiceOutput;
