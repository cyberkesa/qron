'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceSearch = ({
  onResult,
  onError,
  className = '',
  disabled = false,
}: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка поддержки Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          onResult(finalTranscript.trim());
          setTranscript('');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setTranscript('');

        let errorMessage = 'Ошибка распознавания речи';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Речь не обнаружена. Попробуйте еще раз.';
            break;
          case 'audio-capture':
            errorMessage = 'Микрофон недоступен. Проверьте настройки.';
            break;
          case 'not-allowed':
            errorMessage =
              'Доступ к микрофону запрещен. Разрешите использование микрофона.';
            break;
          case 'network':
            errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            break;
          case 'language-not-supported':
            errorMessage = 'Язык не поддерживается.';
            break;
        }

        if (onError) {
          onError(errorMessage);
        }
      };
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onResult, onError, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || disabled) return;

    try {
      recognitionRef.current.start();

      // Автоматическая остановка через 10 секунд
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) {
        onError('Не удалось запустить распознавание речи');
      }
    }
  }, [isListening, disabled, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    recognitionRef.current.stop();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return null; // Не показываем кнопку, если API не поддерживается
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`
          p-2 rounded-full transition-all duration-200 
          ${
            isListening
              ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        title={isListening ? 'Остановить запись' : 'Начать голосовой поиск'}
        aria-label={
          isListening ? 'Остановить запись' : 'Начать голосовой поиск'
        }
      >
        {isListening ? (
          <StopIcon className="h-5 w-5" />
        ) : (
          <MicrophoneIcon className="h-5 w-5" />
        )}
      </button>

      {/* Индикатор записи и транскрипт */}
      {isListening && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-gray-600 font-medium">
                Слушаю...
              </span>
            </div>

            {transcript && (
              <div className="text-sm text-gray-800 border-t border-gray-100 pt-2">
                {transcript}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              Говорите четко и громко
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
