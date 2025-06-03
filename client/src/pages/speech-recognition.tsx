import { useState, useMemo } from 'react';
import { Mic, MicOff, Trash2, Copy, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { ErrorModal } from '@/components/ErrorModal';
import { SuccessToast } from '@/components/SuccessToast';

const languages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
];

const browserSupport = [
  { name: 'Chrome 25+', status: 'supported' },
  { name: 'Edge 79+', status: 'supported' },
  { name: 'Safari', status: 'limited' },
  { name: 'Firefox', status: 'not-supported' },
];

export default function SpeechRecognition() {
  const [language, setLanguage] = useState('en-US');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    resetError
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    language
  });

  const wordCount = useMemo(() => {
    const words = finalTranscript.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length === 1 && words[0] === '' ? 0 : words.length;
  }, [finalTranscript]);

  const characterCount = useMemo(() => {
    return finalTranscript.length;
  }, [finalTranscript]);

  const handleToggleRecording = () => {
    if (!isSupported) {
      setShowErrorModal(true);
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCopyToClipboard = async () => {
    if (finalTranscript.trim()) {
      try {
        await navigator.clipboard.writeText(finalTranscript.trim());
        setShowSuccessToast(true);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    resetError();
    if (isSupported) {
      startListening();
    }
  };

  const getStatusIndicator = () => {
    if (isListening) {
      return (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-50">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-600">Listening...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-600">Ready to Listen</span>
      </div>
    );
  };

  const getErrorMessage = () => {
    if (!isSupported) {
      return 'Speech recognition is not supported in this browser. Please try Chrome or Edge.';
    }
    
    switch (error) {
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone permissions and try again.';
      case 'no-speech':
        return 'No speech detected. Please try speaking again.';
      case 'audio-capture':
        return 'Microphone not found. Please check your microphone connection.';
      case 'network':
        return 'Network error. Please check your internet connection.';
      default:
        return error ? `Recognition error: ${error}` : 'An unknown error occurred.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Speech Recognition</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-secondary' : 'bg-red-500'}`}></div>
              <span>{isSupported ? 'Web Speech API Ready' : 'Not Supported'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Recording Control Card */}
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Status Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  {getStatusIndicator()}
                </div>

                {/* Main Recording Button */}
                <div className="relative">
                  <Button
                    size="lg"
                    className={`w-24 h-24 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-primary hover:bg-blue-700 text-white'
                    }`}
                    onClick={handleToggleRecording}
                  >
                    <Mic className="w-6 h-6" />
                  </Button>
                  
                  {/* Recording Animation Rings */}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-30 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-20 animate-pulse-slow"></div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isListening ? 'Listening...' : 'Click to Start Speaking'}
                  </h2>
                  <p className="text-gray-500">
                    {isListening 
                      ? 'Speak clearly into your microphone' 
                      : 'Your speech will be converted to text in real-time'
                    }
                  </p>
                </div>

                {/* Stop Button (only show when listening) */}
                {isListening && (
                  <div className="flex justify-center">
                    <Button 
                      variant="destructive"
                      onClick={stopListening}
                      className="flex items-center space-x-2 bg-red-500 hover:bg-red-600"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </Button>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    variant="outline"
                    onClick={clearTranscript}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </Button>
                  <Button 
                    className="bg-secondary hover:bg-emerald-600 text-white flex items-center space-x-2"
                    onClick={handleCopyToClipboard}
                    disabled={!finalTranscript.trim()}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcription Display Card */}
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Live Transcription</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{wordCount} words</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{characterCount} characters</span>
                  </div>
                </div>

                {/* Transcription Text Area */}
                <div className="min-h-32 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary transition-colors duration-200">
                  <div className="space-y-2">
                    {/* Final Transcription */}
                    <div className="text-gray-900 leading-relaxed">
                      {finalTranscript || 'Your transcribed text will appear here...'}
                    </div>
                    
                    {/* Interim Transcription (while speaking) */}
                    {interimTranscript && (
                      <div className="text-gray-400 italic animate-pulse">
                        {interimTranscript}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Click the microphone button again to stop recording
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browser Support Info */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Support</h3>
                <div className="space-y-3">
                  {browserSupport.map((browser) => (
                    <div key={browser.name} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        browser.status === 'supported' ? 'bg-secondary' :
                        browser.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{browser.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Requires microphone permissions for optimal performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500">
              Built with Web Speech API & React
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors duration-200">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal || !!error}
        onClose={() => {
          setShowErrorModal(false);
          resetError();
        }}
        onRetry={handleRetry}
        title="Speech Recognition Error"
        message={getErrorMessage()}
      />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showSuccessToast}
        onHide={() => setShowSuccessToast(false)}
        message="Text copied to clipboard!"
      />
    </div>
  );
}
