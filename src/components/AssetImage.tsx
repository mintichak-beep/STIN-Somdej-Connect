import { useState, useEffect } from "react";

// Predefined map of local assets for mapping network/failed URLs
const LOCAL_ASSET_MAP = {
  teacher: "/src/assets/images/teacher.jpg",
  student: "/src/assets/images/student.jpg",
  medical_bg: "/src/assets/images/medical_premium_background_1784633086843.jpg",
  collage: "/src/assets/images/medical_collage_final_1784631894405.jpg",
  hospital: "/src/assets/images/icon_hospital_building_1784608290017.jpg",
  bed: "/src/assets/images/icon_bed_1784608451331.jpg",
  dormitory: "/src/assets/images/icon_dormitory_1784608355644.jpg",
  van: "/src/assets/images/icon_hospital_van_1784608370692.jpg",
  slip: "/src/assets/images/icon_receipt_1784608464454.jpg",
  default: "/src/assets/images/icon_hospital_building_1784608290017.jpg"
};

// Help map keywords to fallbacks
function getLocalFallback(src: string | undefined, alt: string | undefined): string {
  const combined = `${src || ""} ${alt || ""}`.toLowerCase();
  if (combined.includes("teacher") || combined.includes("instructor") || combined.includes("faculty")) {
    return LOCAL_ASSET_MAP.teacher;
  }
  if (combined.includes("student") || combined.includes("nursing_student") || combined.includes("pupil")) {
    return LOCAL_ASSET_MAP.student;
  }
  if (combined.includes("van") || combined.includes("bus") || combined.includes("transport") || combined.includes("trip")) {
    return LOCAL_ASSET_MAP.van;
  }
  if (combined.includes("slip") || combined.includes("payment") || combined.includes("receipt") || combined.includes("billing")) {
    return LOCAL_ASSET_MAP.slip;
  }
  if (combined.includes("dorm") || combined.includes("room") || combined.includes("bed")) {
    return LOCAL_ASSET_MAP.dormitory;
  }
  if (combined.includes("hospital") || combined.includes("building") || combined.includes("clinic")) {
    return LOCAL_ASSET_MAP.hospital;
  }
  if (combined.includes("medical") || combined.includes("collage") || combined.includes("background")) {
    return LOCAL_ASSET_MAP.medical_bg;
  }
  return LOCAL_ASSET_MAP.default;
}

export interface AssetImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Option to force a specific local fallback type
  fallbackType?: keyof typeof LOCAL_ASSET_MAP;
}

export function AssetImage({ src, alt, fallbackType, onError, ...props }: AssetImageProps) {
  // Check if the source is a network/external url or is a placeholder URL
  const isNetworkOrPlaceholder = (url: string | undefined): boolean => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.includes("placeholder") ||
      lower.includes("unsplash") ||
      lower.includes("dummyimage") ||
      lower.includes("picsum") ||
      lower.includes("via.placeholder")
    );
  };

  const getInitialSrc = () => {
    if (isNetworkOrPlaceholder(src)) {
      if (fallbackType && LOCAL_ASSET_MAP[fallbackType]) {
        return LOCAL_ASSET_MAP[fallbackType];
      }
      return getLocalFallback(src, alt);
    }
    return src || getLocalFallback(src, alt);
  };

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc());

  useEffect(() => {
    setCurrentSrc(getInitialSrc());
  }, [src, alt, fallbackType]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const fallback = fallbackType && LOCAL_ASSET_MAP[fallbackType]
      ? LOCAL_ASSET_MAP[fallbackType]
      : getLocalFallback(src, alt);

    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleImageError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
