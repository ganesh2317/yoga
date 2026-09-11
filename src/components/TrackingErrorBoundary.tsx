import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';
import { Surface } from './ui/Surface';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TrackingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TrackingErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 max-w-md mx-auto z-50">
          <Surface variant="raised" className="p-6 text-center space-y-4 border-poor/40">
            <div className="w-14 h-14 rounded-2xl bg-poor-soft border border-poor flex items-center justify-center text-poor mx-auto">
              <CameraOff className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-xl text-text">
                Tracking Engine Reset Required
              </h3>
              <p className="text-xs text-text-3 leading-relaxed">
                The camera or vision engine encountered a transient graphics interrupt.
              </p>
            </div>

            <Button
              onClick={this.handleReset}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restart Camera Tracking
            </Button>
          </Surface>
        </div>
      );
    }

    return this.props.children;
  }
}
