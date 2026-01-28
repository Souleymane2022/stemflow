import { Zap } from "lucide-react";

interface StemFlowLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function StemFlowLogo({ size = "md", showText = true, className = "" }: StemFlowLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="gradient-stem rounded-lg p-1.5 flex items-center justify-center">
        <Zap className={`${sizeClasses[size]} text-white fill-white`} />
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} gradient-stem-text`}>
          STEM FLOW
        </span>
      )}
    </div>
  );
}

export function StemFlowSlogan({ className = "" }: { className?: string }) {
  return (
    <p className={`text-muted-foreground font-medium ${className}`}>
      Scroll. Learn. Level Up.
    </p>
  );
}
