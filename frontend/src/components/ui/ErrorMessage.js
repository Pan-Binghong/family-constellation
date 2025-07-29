import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({ 
  title = '出现错误',
  message,
  onRetry,
  onDismiss,
  type = 'error',
  className = ''
}) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  };

  const styles = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        rounded-2xl border p-6 ${styles.container} ${className}
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${styles.title}`}>
            {title}
          </h3>
          
          {message && (
            <p className={`mt-2 text-sm ${styles.message}`}>
              {message}
            </p>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={onRetry}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  重试
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  size="small"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  关闭
                </Button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors ${styles.icon}`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorMessage;