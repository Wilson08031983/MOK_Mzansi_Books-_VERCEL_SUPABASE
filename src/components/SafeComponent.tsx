import React, { Component, ReactNode } from 'react';
import { safeExecute, safeGet } from '@/utils/safeAccess';

interface SafeComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SafeComponentState {
  hasError: boolean;
  error?: Error;
}

/**
 * A higher-order component that provides safe rendering with error boundaries
 * and safe prop access for child components
 */
export class SafeComponent extends Component<SafeComponentProps, SafeComponentState> {
  constructor(props: SafeComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeComponentState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeComponent caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      safeExecute(() => this.props.onError!(error, errorInfo));
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium mb-2">Something went wrong</h3>
          <p className="text-red-600 text-sm">
            An error occurred while rendering this component. Please try refreshing the page.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for safe component rendering with error handling
 */
export const useSafeRender = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const safeRender = React.useCallback((renderFn: () => ReactNode) => {
    try {
      return renderFn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown rendering error');
      console.error('Safe render error:', error);
      setError(error);
      return (
        <div className="p-2 text-red-600 text-sm border border-red-200 rounded">
          Rendering error: {error.message}
        </div>
      );
    }
  }, []);

  const clearError = React.useCallback(() => setError(null), []);

  return { safeRender, error, clearError };
};

/**
 * Higher-order component for wrapping components with safe rendering
 */
export function withSafeComponent<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function SafeWrappedComponent(props: P) {
    return (
      <SafeComponent fallback={fallback}>
        <WrappedComponent {...props} />
      </SafeComponent>
    );
  };
}

/**
 * Safe props access utility for components
 */
export const useSafeProps = <T extends object>(props: T) => {
  return React.useMemo(() => {
    const safeProps = {} as T;
    
    Object.keys(props).forEach(key => {
      safeProps[key as keyof T] = safeGet(props[key as keyof T], undefined);
    });
    
    return safeProps;
  }, [props]);
};

export default SafeComponent;