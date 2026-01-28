import stemFlowLogo from "@assets/a7f9fef0-ccda-4856-80a4-17e64300d515_1769637656263.png";

interface StemFlowLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function StemFlowLogo({ size = "md", showText = true, className = "" }: StemFlowLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  const iconOnlySizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={stemFlowLogo} 
        alt="STEMflow" 
        className={`${showText ? sizeClasses[size] : iconOnlySizes[size]} w-auto object-contain`}
        data-testid="logo-stemflow"
      />
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
