import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';

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
        <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center p-4 max-w-md mx-auto z-50">
          <GlassCard variant="focal" glowColor="red" className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] mx-auto">
              <CameraOff className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-xl text-[#F5F7FA]">
                Tracking Engine Reset Required
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                The camera or vision engine encountered a transient graphics interrupt.
              </p>
            </div>

            <GlassButton
              onClick={this.handleReset}
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Restart Camera Tracking
            </GlassButton>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
