import React from 'react';
import { Loader2, FileText, Video, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  phase: 'script' | 'video' | 'complete';
  progress?: number;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  phase, 
  progress = 0, 
  message 
}) => {
  const getPhaseIcon = () => {
    switch (phase) {
      case 'script':
        return <FileText className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin" />;
    }
  };

  const getPhaseMessage = () => {
    if (message) return message;
    
    switch (phase) {
      case 'script':
        return 'Generating podcast script with AI...';
      case 'video':
        return `Generating videos for scenes... ${Math.round(progress)}%`;
      case 'complete':
        return 'Generation complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center space-x-3">
        {phase !== 'complete' && <Loader2 className="w-6 h-6 animate-spin text-blue-500" />}
        {getPhaseIcon()}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700">{getPhaseMessage()}</p>
        
        {phase === 'video' && progress > 0 && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className={`flex items-center space-x-1 ${phase === 'script' || phase === 'complete' ? 'text-green-500' : ''}`}>
            {phase === 'script' || phase === 'complete' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
            )}
            <span>Script Generation</span>
          </div>
          
          <div className={`flex items-center space-x-1 ${phase === 'video' ? 'text-blue-500' : phase === 'complete' ? 'text-green-500' : 'text-gray-400'}`}>
            {phase === 'complete' ? (
              <CheckCircle className="w-4 h-4" />
            ) : phase === 'video' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
            )}
            <span>Video Generation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;