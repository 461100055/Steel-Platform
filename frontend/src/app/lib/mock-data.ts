// Mock data for Steel Platform

// Steel product images from Unsplash
const steelSheetsStacked = 'https://images.unsplash.com/photo-1720036236694-d0a231c52563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHNoZWV0cyUyMHN0YWNrZWQlMjBpbmR1c3RyaWFsfGVufDF8fHx8MTc3MzQzNDUwOXww&ixlib=rb-4.1.0&q=80&w=1080';
const steelBlock = 'https://images.unsplash.com/photo-1758846946188-12316e71c680?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMG1ldGFsJTIwYmxvY2tzJTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3NzM0MzQ1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080';
const steelCoilsFactory = 'https://images.unsplash.com/photo-1720036237038-802f50cdfd9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMGNvaWxzJTIwZmFjdG9yeSUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzM0MzQ1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080';
const steelCoilsWarehouse = 'https://images.unsplash.com/photo-1720036237038-802f50cdfd9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMGNvaWxzJTIwZmFjdG9yeSUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzM0MzQ1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080';
const steelPlatesStacked = 'https://images.unsplash.com/photo-1573247373996-cea1f3e6adf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHBsYXRlcyUyMHN0YWNrZWQlMjBtZXRhbHxlbnwxfHx8fDE3NzM0MzQ1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080';
const steelRebar = 'https://images.unsplash.com/photo-1763263385516-953ae09448f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHJlYmFyJTIwY29uc3RydWN0aW9ufGVufDF8fHx8MTc3MzQwNDc0OHww&ixlib=rb-4.1.0&q=80&w=1080';
const steelPipesWarehouse = 'https://images.unsplash.com/photo-1763950865873-41f63536825b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHBpcGVzJTIwd2FyZWhvdXNlJTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3NzM0MzQ1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080';
const steelBeams = 'https://images.unsplash.com/photo-1593111415629-479b8c735255?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMGJlYW1zJTIwY29uc3RydWN0aW9ufGVufDF8fHx8MTc3MzM4ODg0M3ww&ixlib=rb-4.1.0&q=80&w=1080';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  moq: number;
  unit: string;
  deliveryTime: string;
  supplierId: string;
  supplierName: string;
  rating: number;
  image: string;
  description: string;
  specifications: {
    grade?: string;
    thickness?: string;
    width?: string;
    length?: string;
    coating?: string;
  };
  inventory: number;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Made to Order';
  badge?: string;
}

export interface Supplier {
  id: string;
  name: string;
  rating: number;
  totalOrders: number;
  city: string;
  categories: string[];
  image: string;
  description: string;
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  supplierName: string;
}

export interface RFQ {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
  date: string;
  requiredDate: string;
  buyerName?: string;
  supplierName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'supplier';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'supplier' | 'admin';
  company?: string;
  phone: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
  lastActive: string;
  totalOrders?: number;
  totalSpent?: number;
  totalSales?: number;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Hot Rolled Steel Coil',
    category: 'Steel Coils',
    price: 2500,
    moq: 10,
    unit: 'ton',
    deliveryTime: '15-20 days',
    supplierId: '1',
    supplierName: 'Saudi Steel Industries',
    rating: 4.8,
    image: steelCoilsFactory,
    description: 'High-quality hot rolled steel coils suitable for industrial applications',
    specifications: {
      grade: 'ASTM A36',
      thickness: '2-10mm',
      width: '1000-2000mm',
      coating: 'None'
    },
    inventory: 500,
    stockStatus: 'In Stock'
  },
  {
    id: '2',
    name: 'Galvanized Steel Sheet',
    category: 'Steel Sheets',
    price: 3200,
    moq: 5,
    unit: 'ton',
    deliveryTime: '10-15 days',
    supplierId: '2',
    supplierName: 'Al Rajhi Steel',
    rating: 4.6,
    image: steelSheetsStacked,
    description: 'Premium galvanized steel sheets with excellent corrosion resistance',
    specifications: {
      grade: 'SGCC',
      thickness: '0.3-3mm',
      width: '900-1500mm',
      coating: 'Z275'
    },
    inventory: 300,
    stockStatus: 'In Stock',
    badge: 'Best Seller'
  },
  {
    id: '3',
    name: 'Stainless Steel Plate 304',
    category: 'Stainless Steel',
    price: 8500,
    moq: 2,
    unit: 'ton',
    deliveryTime: '20-25 days',
    supplierId: '3',
    supplierName: 'Eastern Steel Co.',
    rating: 4.9,
    image: steelPlatesStacked,
    description: 'High-grade stainless steel plates for food and pharmaceutical industries',
    specifications: {
      grade: '304',
      thickness: '1-50mm',
      width: '1000-2500mm',
      coating: 'None'
    },
    inventory: 150,
    stockStatus: 'In Stock'
  },
  {
    id: '4',
    name: 'Steel Rebar Grade 60',
    category: 'Construction Steel',
    price: 2200,
    moq: 20,
    unit: 'ton',
    deliveryTime: '5-10 days',
    supplierId: '1',
    supplierName: 'Saudi Steel Industries',
    rating: 4.7,
    image: steelRebar,
    description: 'Construction-grade steel rebar for concrete reinforcement',
    specifications: {
      grade: 'Grade 60',
      thickness: '10-32mm',
      length: '12m'
    },
    inventory: 1000,
    stockStatus: 'In Stock'
  },
  {
    id: '5',
    name: 'Cold Rolled Steel Coil',
    category: 'Steel Coils',
    price: 2800,
    moq: 8,
    unit: 'ton',
    deliveryTime: '15-20 days',
    supplierId: '2',
    supplierName: 'Al Rajhi Steel',
    rating: 4.5,
    image: steelCoilsWarehouse,
    description: 'Precision cold rolled steel coils for automotive applications',
    specifications: {
      grade: 'SPCC',
      thickness: '0.3-3mm',
      width: '900-1500mm'
    },
    inventory: 400,
    stockStatus: 'Low Stock'
  },
  {
    id: '6',
    name: 'Steel I-Beam 300mm',
    category: 'Structural Steel',
    price: 2600,
    moq: 15,
    unit: 'ton',
    deliveryTime: '12-18 days',
    supplierId: '3',
    supplierName: 'Eastern Steel Co.',
    rating: 4.8,
    image: steelBeams,
    description: 'Heavy-duty I-beams for structural construction projects',
    specifications: {
      grade: 'S275JR',
      thickness: '300mm',
      length: '12m'
    },
    inventory: 250,
    stockStatus: 'Made to Order'
  },
  {
    id: '7',
    name: 'Steel Pipes & Tubes',
    category: 'Steel Pipes',
    price: 2400,
    moq: 12,
    unit: 'ton',
    deliveryTime: '10-15 days',
    supplierId: '1',
    supplierName: 'Saudi Steel Industries',
    rating: 4.7,
    image: steelPipesWarehouse,
    description: 'High-quality steel pipes and tubes for various industrial applications',
    specifications: {
      grade: 'ASTM A53',
      thickness: '2-8mm',
      length: '6-12m'
    },
    inventory: 600,
    stockStatus: 'In Stock'
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Saudi Steel Industries',
    rating: 4.8,
    totalOrders: 1250,
    city: 'Riyadh',
    categories: ['Steel Coils', 'Construction Steel', 'Steel Pipes'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    description: 'Leading steel manufacturer in Saudi Arabia with over 30 years of experience'
  },
  {
    id: '2',
    name: 'Al Rajhi Steel',
    rating: 4.6,
    totalOrders: 980,
    city: 'Jeddah',
    categories: ['Steel Sheets', 'Galvanized Steel', 'Steel Coils'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    description: 'Premium quality steel products with nationwide delivery'
  },
  {
    id: '3',
    name: 'Eastern Steel Co.',
    rating: 4.9,
    totalOrders: 1450,
    city: 'Dammam',
    categories: ['Stainless Steel', 'Structural Steel', 'Special Alloys'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    description: 'Specialized in high-grade stainless steel and structural products'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    productName: 'Hot Rolled Steel Coil',
    quantity: 50,
    total: 125000,
    status: 'delivered',
    date: '2026-02-15',
    supplierName: 'Saudi Steel Industries'
  },
  {
    id: 'ORD002',
    productName: 'Galvanized Steel Sheet',
    quantity: 20,
    total: 64000,
    status: 'shipped',
    date: '2026-03-01',
    supplierName: 'Al Rajhi Steel'
  },
  {
    id: 'ORD003',
    productName: 'Steel Rebar Grade 60',
    quantity: 100,
    total: 220000,
    status: 'processing',
    date: '2026-03-05',
    supplierName: 'Saudi Steel Industries'
  }
];

export const mockRFQs: RFQ[] = [
  {
    id: 'RFQ001',
    productName: 'Stainless Steel Plate 304',
    quantity: 10,
    unit: 'ton',
    targetPrice: 80000,
    status: 'quoted',
    date: '2026-03-03',
    requiredDate: '2026-04-01',
    supplierName: 'Eastern Steel Co.'
  },
  {
    id: 'RFQ002',
    productName: 'Cold Rolled Steel Coil',
    quantity: 30,
    unit: 'ton',
    targetPrice: 82000,
    status: 'pending',
    date: '2026-03-06',
    requiredDate: '2026-04-05',
    supplierName: 'Al Rajhi Steel'
  }
];

export const categories = [
  'Steel Coils',
  'Steel Sheets',
  'Stainless Steel',
  'Construction Steel',
  'Structural Steel',
  'Steel Pipes',
  'Galvanized Steel',
  'Special Alloys'
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    supplierId: '1',
    supplierName: 'Saudi Steel Industries',
    supplierImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    lastMessage: 'Thank you for your order! We will start processing it immediately.',
    lastMessageTime: '2026-03-07T10:30:00',
    unreadCount: 2,
    status: 'active'
  },
  {
    id: 'conv2',
    supplierId: '2',
    supplierName: 'Al Rajhi Steel',
    supplierImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    lastMessage: 'The galvanized steel sheets are ready for shipment.',
    lastMessageTime: '2026-03-06T14:20:00',
    unreadCount: 0,
    status: 'active'
  },
  {
    id: 'conv3',
    supplierId: '3',
    supplierName: 'Eastern Steel Co.',
    supplierImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    lastMessage: 'We can offer a 5% discount for bulk orders over 50 tons.',
    lastMessageTime: '2026-03-05T09:15:00',
    unreadCount: 1,
    status: 'active'
  }
];

export const mockMessages: Message[] = [
  // Conversation with Saudi Steel Industries
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'Hello, I would like to inquire about the Hot Rolled Steel Coil. What is your current lead time?',
    timestamp: '2026-03-06T09:00:00',
    read: true
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: '1',
    senderName: 'Saudi Steel Industries',
    senderRole: 'supplier',
    content: 'Hello! Thank you for your interest. Our current lead time is 15-20 days. For orders over 100 tons, we can expedite to 10-15 days.',
    timestamp: '2026-03-06T09:45:00',
    read: true
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'Perfect! I need 50 tons. Can you provide the certification documents as well?',
    timestamp: '2026-03-06T10:30:00',
    read: true
  },
  {
    id: 'msg4',
    conversationId: 'conv1',
    senderId: '1',
    senderName: 'Saudi Steel Industries',
    senderRole: 'supplier',
    content: 'Absolutely! We provide full mill test certificates, material certificates, and quality inspection reports with every order.',
    timestamp: '2026-03-06T11:00:00',
    read: true
  },
  {
    id: 'msg5',
    conversationId: 'conv1',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'Great! I will proceed with the order.',
    timestamp: '2026-03-07T08:00:00',
    read: true
  },
  {
    id: 'msg6',
    conversationId: 'conv1',
    senderId: '1',
    senderName: 'Saudi Steel Industries',
    senderRole: 'supplier',
    content: 'Thank you for your order! We will start processing it immediately.',
    timestamp: '2026-03-07T10:30:00',
    read: false
  },
  
  // Conversation with Al Rajhi Steel
  {
    id: 'msg7',
    conversationId: 'conv2',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'Hi, I am interested in the Galvanized Steel Sheet. What coating options do you have?',
    timestamp: '2026-03-05T14:00:00',
    read: true
  },
  {
    id: 'msg8',
    conversationId: 'conv2',
    senderId: '2',
    senderName: 'Al Rajhi Steel',
    senderRole: 'supplier',
    content: 'Hello! We offer Z275, Z350, and AZ150 coatings. The Z275 is our most popular option for general applications.',
    timestamp: '2026-03-05T15:30:00',
    read: true
  },
  {
    id: 'msg9',
    conversationId: 'conv2',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'The Z275 coating sounds good. When can you ship if I place an order today?',
    timestamp: '2026-03-06T10:00:00',
    read: true
  },
  {
    id: 'msg10',
    conversationId: 'conv2',
    senderId: '2',
    senderName: 'Al Rajhi Steel',
    senderRole: 'supplier',
    content: 'The galvanized steel sheets are ready for shipment.',
    timestamp: '2026-03-06T14:20:00',
    read: true
  },
  
  // Conversation with Eastern Steel Co.
  {
    id: 'msg11',
    conversationId: 'conv3',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'Do you offer volume discounts for Stainless Steel Plate 304?',
    timestamp: '2026-03-04T11:00:00',
    read: true
  },
  {
    id: 'msg12',
    conversationId: 'conv3',
    senderId: '3',
    senderName: 'Eastern Steel Co.',
    senderRole: 'supplier',
    content: 'Yes, we do! For orders over 20 tons, we offer 3% discount. For orders over 50 tons, the discount is 5%.',
    timestamp: '2026-03-04T13:30:00',
    read: true
  },
  {
    id: 'msg13',
    conversationId: 'conv3',
    senderId: 'buyer1',
    senderName: 'Ahmad Construction',
    senderRole: 'buyer',
    content: 'That is excellent! I am planning a bulk order for next month.',
    timestamp: '2026-03-05T08:00:00',
    read: true
  },
  {
    id: 'msg14',
    conversationId: 'conv3',
    senderId: '3',
    senderName: 'Eastern Steel Co.',
    senderRole: 'supplier',
    content: 'We can offer a 5% discount for bulk orders over 50 tons.',
    timestamp: '2026-03-05T09:15:00',
    read: false
  }
];

export const mockUsers: User[] = [
  // Buyers
  {
    id: 'USR001',
    name: 'Ahmed Al-Farsi',
    email: 'ahmed.farsi@construction.sa',
    role: 'buyer',
    company: 'Al-Farsi Construction Co.',
    phone: '+966 50 123 4567',
    city: 'Riyadh',
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2026-03-10T09:30:00',
    totalOrders: 45,
    totalSpent: 2850000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR002',
    name: 'Fatima Al-Zahrani',
    email: 'fatima@buildingpro.sa',
    role: 'buyer',
    company: 'Building Pro Industries',
    phone: '+966 55 234 5678',
    city: 'Jeddah',
    status: 'active',
    joinedDate: '2024-03-20',
    lastActive: '2026-03-09T14:15:00',
    totalOrders: 32,
    totalSpent: 1920000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR003',
    name: 'Mohammed Al-Rashid',
    email: 'mohammed.r@infratech.sa',
    role: 'buyer',
    company: 'InfraTech Solutions',
    phone: '+966 53 345 6789',
    city: 'Dammam',
    status: 'active',
    joinedDate: '2024-06-10',
    lastActive: '2026-03-08T11:45:00',
    totalOrders: 28,
    totalSpent: 1680000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR004',
    name: 'Sara Al-Otaibi',
    email: 'sara@modernbuild.sa',
    role: 'buyer',
    company: 'Modern Build',
    phone: '+966 54 456 7890',
    city: 'Riyadh',
    status: 'active',
    joinedDate: '2025-01-05',
    lastActive: '2026-03-07T16:20:00',
    totalOrders: 15,
    totalSpent: 850000,
    verificationStatus: 'pending'
  },
  {
    id: 'USR005',
    name: 'Khalid Al-Mutairi',
    email: 'khalid@steelworks.sa',
    role: 'buyer',
    company: 'SteelWorks LLC',
    phone: '+966 56 567 8901',
    city: 'Mecca',
    status: 'inactive',
    joinedDate: '2023-08-15',
    lastActive: '2026-01-20T10:00:00',
    totalOrders: 8,
    totalSpent: 420000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR006',
    name: 'Noura Al-Qahtani',
    email: 'noura@constructplus.sa',
    role: 'buyer',
    company: 'Construct Plus',
    phone: '+966 57 678 9012',
    city: 'Medina',
    status: 'suspended',
    joinedDate: '2025-02-10',
    lastActive: '2026-02-28T08:30:00',
    totalOrders: 5,
    totalSpent: 180000,
    verificationStatus: 'unverified'
  },
  
  // Suppliers
  {
    id: 'USR007',
    name: 'Abdullah Al-Harbi',
    email: 'abdullah@saudisteel.sa',
    role: 'supplier',
    company: 'Saudi Steel Industries',
    phone: '+966 11 234 5678',
    city: 'Riyadh',
    status: 'active',
    joinedDate: '2023-05-10',
    lastActive: '2026-03-10T10:00:00',
    totalOrders: 1250,
    totalSales: 18500000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR008',
    name: 'Nasser Al-Rajhi',
    email: 'nasser@alrajhisteel.sa',
    role: 'supplier',
    company: 'Al Rajhi Steel',
    phone: '+966 12 345 6789',
    city: 'Jeddah',
    status: 'active',
    joinedDate: '2023-07-20',
    lastActive: '2026-03-09T15:30:00',
    totalOrders: 980,
    totalSales: 15200000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR009',
    name: 'Ibrahim Al-Ghamdi',
    email: 'ibrahim@easternsteel.sa',
    role: 'supplier',
    company: 'Eastern Steel Co.',
    phone: '+966 13 456 7890',
    city: 'Dammam',
    status: 'active',
    joinedDate: '2023-03-15',
    lastActive: '2026-03-10T08:45:00',
    totalOrders: 1450,
    totalSales: 22800000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR010',
    name: 'Faisal Al-Dosari',
    email: 'faisal@modernsteel.sa',
    role: 'supplier',
    company: 'Modern Steel Products',
    phone: '+966 14 567 8901',
    city: 'Khobar',
    status: 'active',
    joinedDate: '2024-02-01',
    lastActive: '2026-03-08T12:00:00',
    totalOrders: 420,
    totalSales: 6800000,
    verificationStatus: 'verified'
  },
  {
    id: 'USR011',
    name: 'Turki Al-Shammari',
    email: 'turki@primesteel.sa',
    role: 'supplier',
    company: 'Prime Steel Industries',
    phone: '+966 15 678 9012',
    city: 'Riyadh',
    status: 'inactive',
    joinedDate: '2024-08-10',
    lastActive: '2025-12-15T14:30:00',
    totalOrders: 125,
    totalSales: 1950000,
    verificationStatus: 'pending'
  },
  
  // Admins
  {
    id: 'USR012',
    name: 'Omar Al-Fahad',
    email: 'omar.fahad@steelplatform.sa',
    role: 'admin',
    phone: '+966 50 111 2222',
    city: 'Riyadh',
    status: 'active',
    joinedDate: '2023-01-01',
    lastActive: '2026-03-10T11:00:00',
    verificationStatus: 'verified'
  },
  {
    id: 'USR013',
    name: 'Layla Al-Mansour',
    email: 'layla.mansour@steelplatform.sa',
    role: 'admin',
    phone: '+966 55 222 3333',
    city: 'Jeddah',
    status: 'active',
    joinedDate: '2023-02-15',
    lastActive: '2026-03-09T17:00:00',
    verificationStatus: 'verified'
  },
  {
    id: 'USR014',
    name: 'Yousef Al-Subai',
    email: 'yousef@steelplatform.sa',
    role: 'admin',
    phone: '+966 54 333 4444',
    city: 'Dammam',
    status: 'active',
    joinedDate: '2023-06-01',
    lastActive: '2026-03-10T09:00:00',
    verificationStatus: 'verified'
  }
];