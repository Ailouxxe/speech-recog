import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessToastProps {
  isVisible: boolean;
  onHide: () => void;
  message: string;
}

export function SuccessToast({ isVisible, onHide, message }: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up z-50">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
