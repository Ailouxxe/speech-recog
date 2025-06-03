import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  title: string;
  message: string;
}

export function ErrorModal({ isOpen, onClose, onRetry, title, message }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-slide-up">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{message}</p>
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={onRetry}
            >
              Retry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
