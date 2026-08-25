export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Modifier {
  id: string;
  groupId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  dietaryTags: string[]; // e.g. ["vegan", "gluten-free"]
  allergens: string[]; // e.g. ["nuts", "dairy"]
  spiceLevel: number; // Max base spice level
  modifierGroups?: ModifierGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  items?: MenuItem[];
}

export interface SelectedModifier {
  id: string;
  name: string;
  price: number;
  groupName: string;
}

export interface CartItem {
  id: string; // unique cart entry key: menuItem.id + modifier selection serialization
  menuItem: MenuItem;
  quantity: number;
  protein?: string;
  spiceLevel?: "Mild" | "Medium" | "Hot";
  selectedModifiers: SelectedModifier[];
  singleItemPrice: number; // base price + modifiers
}

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImage: string;
  quantity: number;
  price: number;
  protein?: string;
  spiceLevel?: string;
  selectedModifiers: { name: string; price: number }[];
}

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  type: "PICKUP" | "DELIVERY";
  scheduledTime: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryStreet: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  deliveryFee: number;
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  createdAt: string;
  items: OrderItem[];
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "ARRIVED" | "NOSHOW" | "CANCELLED";

export interface Reservation {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: "INDOOR" | "OUTDOOR" | "PRIVATE";
  specialOccasion?: string;
  notes?: string;
  status: ReservationStatus;
  createdAt: string;
}

export type CateringStatus = "NEW" | "CONTACTED" | "QUOTE_SENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface CateringRequest {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  guestCount: number;
  eventDate: string;
  location: string;
  menuPreference: string;
  dietaryNeeds?: string;
  servicesNeeded: string[]; // e.g. ["staff", "buffet-setup"]
  notes?: string;
  estimatedPrice: number;
  status: CateringStatus;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  isActive: boolean;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  cardStyle: string;
  scheduledDate?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  schedule: string;
  salary?: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
  availability: string;
  status: "NEW" | "REVIEWED" | "INTERVIEWED" | "REJECTED" | "HIRED";
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface HimalayanEvent {
  id: string;
  title: string;
  location: string;
  type: string;
  schedule: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
}
