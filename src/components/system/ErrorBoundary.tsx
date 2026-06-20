import { Button } from "@/components/ui";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] uncaught error:", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="bg-bg flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-ink text-2xl font-bold">問題が発生しました</p>
          <p className="text-ink/60 text-sm">
            予期しないエラーが発生しました。再読み込みするか、ホームに戻ってください。
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => window.location.reload()}>
            再読み込み
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              window.location.hash = "#/";
              window.location.reload();
            }}
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }
}
