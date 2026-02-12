import stemFlowLogo from "@assets/WhatsApp_Image_2026-02-12_at_21.06.10_1770926836861.jpeg";

interface StemFlowLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "default" | "light";
}

export function StemFlowLogo({ size = "md", showText = true, className = "", variant = "default" }: StemFlowLogoProps) {
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
        className={`${showText ? sizeClasses[size] : iconOnlySizes[size]} w-auto object-contain ${variant === "light" ? "brightness-[10] contrast-50" : ""}`}
        data-testid="logo-stemflow"
      />
    </div>
  );
}

export function StemFlowSlogan({ className = "" }: { className?: string }) {
  return (
    <p className={`font-medium italic tracking-wide ${className}`}>
      Scroll. Learn. Level Up.
    </p>
  );
}
