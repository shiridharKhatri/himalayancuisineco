import { CuisineLoader } from "@/components/ui/CuisineLoader";

export default function Loading() {
  return (
    <CuisineLoader
      variant="momo"
      size="fullscreen"
      message="Steaming fresh Himalayan dishes..."
      submessage="Bringing authentic Nepalese mountain flavors to your table"
    />
  );
}
