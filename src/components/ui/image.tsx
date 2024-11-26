import { useState } from "react";

interface ImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
  }
  
  export const Image: React.FC<ImageProps> = ({ 
    src, 
    alt, 
    className = '', 
    fallbackSrc = '/placeholder-image.jpg' 
  }) => {
    const [error, setError] = useState(false);
  
    return (
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  };