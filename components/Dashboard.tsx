import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Reusing the logo data URI from other components for consistency
const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSIzNSIgZmlsbD0iYmxhY2siIGxldHRlci1zcGFjaW5nPSItMnB4Ij5aQVA8L3RleHQ+Cjwvc3ZnPg==";

type DashboardView = 'HOME' | 'PROMOTIONS' | 'ITEMS' | 'DESIGN_EXTRACTOR' | 'PROJECT_DETAILS' | 'MOBILE_PREVIEW' | 'ORDERS' | 'ONLINE' | 'CUSTOMERS' | 'REPORTS' | 'BANKING' | 'SETTINGS' | 'STAFF_MEMBERS' | 'STAFF_PERMISSIONS' | 'STAFF_ONBOARDING' | 'STAFF_SHIFTS' | 'STAFF_REQUESTS' | 'STAFF_PAYROLL' | 'STAFF_ANNOUNCEMENTS';
type SidebarContext = 'MAIN' | 'STAFF';
type SettingsView = 'GENERAL' | 'BUTTONS_FONTS' | 'NOTIFICATIONS' | 'SECURITY';

// --- DATA INTERFACES ---
interface PromotionData {
  id: string;
  name: string;
  initial: string;
  initialBg: string;
  initialText: string;
  type: string;
  typeBadge: string;
  channel: string;   
  location: string; 
  value: string;
  schedule: string;
  statusText: string;
  statusBadge: string;
  statusDot: string;
}

interface ItemData {
  id: string;
  name: string;
  sku: string;
  category: string; 
  channel: string;  
  location: string; 
  image: string;
  price: string;    
  stock: number;
  unit: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
}

interface DesignProjectData {
  id: string;
  name: string;
  description: string;
  date: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface StaffData {
  id: string;
  displayId: string;
  name: string;
  role: string;
  roleType: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  lastActive: string;
  avatar: string;
}

// --- GLOBAL CONFIG INTERFACES ---
interface GlobalConfig {
    fontFamily: string;
    primaryColor: string;
    borderRadius: number;
    paddingX: number;
    paddingY: number;
    buttonStyle: 'FLAT' | 'SOFT' | 'NEO' | 'GLOW';
}

// --- AI ANALYSIS INTERFACES ---
interface ColorPalette {
    name: string;
    hex: string;
    tailwindClass: string;
    usage: string;
}

interface TypeStyle {
    role: string; // H1, H2, P, Caption
    fontFamily: string;
    weight: string;
    size: string | number; // Updated to allow number
    sampleText: string;
}

interface ButtonStyle {
    label: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
}

interface BrandAnalysisResult {
    colors: ColorPalette[];
    typography: {
        primaryFont: string;
        styles: TypeStyle[];
    };
    components: {
        buttons: ButtonStyle[];
    }
}

// --- DATA GENERATION HELPERS ---

const NAMES_PREFIX = ['Summer', 'Winter', 'Flash', 'Holiday', 'Weekend', 'Special', 'New Year', 'Midnight', 'Clearance', 'Member'];
const NAMES_SUFFIX = ['Sale', 'Deal', 'Bonanza', 'Special', 'Discount', 'Offer', 'Blowout', 'Event', 'Promo', 'Markdown'];

const ITEM_NAMES = [
    'Wagyu Beef Burger', 'Truffle Fries', 'Caesar Salad', 'Grilled Salmon', 'Matcha Latte', 
    'Asahi Super Dry', 'Coca Cola', 'Spicy Tuna Roll', 'Miso Soup', 'Chicken Karage',
    'Edamame', 'Tempura Udon', 'Sashimi Platter', 'Green Tea Ice Cream', 'Beef Donburi'
];
const ITEM_CATS = ['Food', 'Beverage', 'Sides'];

const PROJECT_NAMES = ['Menu Redesign', 'Social Media Campaign', 'Email Blast Templates', 'Website Hero Assets', 'In-Store Signage', 'Loyalty App Icons', 'Packaging Refresh', 'Seasonal Billboard'];
const PROJECT_DESCS = ['Updating the main dinner menu layout', 'Assets for the Q4 instagram push', 'Responsive email templates for newsletter', 'High-res header images for landing page', 'Posters for the window display', 'Vector icons for the new rewards tier', 'New takeout bag and box designs', 'Highway billboard for summer promo'];

const MOCK_STAFF: StaffData[] = [
    { id: '1', displayId: '32432b', name: 'Tom Tran', role: 'Cashier', roleType: 'Primary', email: 'tom@two.vn', phone: '(657) 363-9270', status: 'Active', lastActive: '2 mins ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', displayId: '98123a', name: 'Jessica Smith', role: 'Manager', roleType: 'Full-time', email: 'jessica.s@zap.com', phone: '(555) 123-4567', status: 'Active', lastActive: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', displayId: '45678c', name: 'David Chen', role: 'Kitchen Staff', roleType: 'Part-time', email: 'david.c@zap.com', phone: '-', status: 'On Leave', lastActive: '3 days ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '4', displayId: '77219d', name: 'Maria Rodriguez', role: 'Server', roleType: 'Hourly', email: 'maria.r@zap.com', phone: '(555) 987-6543', status: 'Active', lastActive: 'Today', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '5', displayId: '22341e', name: 'Robert Fox', role: 'Chef', roleType: 'Head', email: 'robert.f@zap.com', phone: '(555) 234-5678', status: 'Inactive', lastActive: '2 weeks ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '6', displayId: '88901f', name: 'Emily White', role: 'Barista', roleType: 'Part-time', email: 'emily.w@zap.com', phone: '(555) 345-6789', status: 'Active', lastActive: '5 mins ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '7', displayId: '12398z', name: 'Michael Brown', role: 'Manager', roleType: 'Shift Lead', email: 'mike.b@zap.com', phone: '(555) 555-1212', status: 'Active', lastActive: '10 mins ago', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

// --- DEMO DATA ---
const DEMO_ANALYSIS: BrandAnalysisResult = {
    colors: [
        { name: "Ocean Blue", hex: "#0077B6", tailwindClass: "bg-blue-600", usage: "Primary Brand" },
        { name: "Coral", hex: "#FF7F50", tailwindClass: "bg-orange-400", usage: "Accent" },
        { name: "Slate", hex: "#334155", tailwindClass: "bg-slate-700", usage: "Text" },
        { name: "Light Gray", hex: "#F1F5F9", tailwindClass: "bg-slate-100", usage: "Background" },
        { name: "White", hex: "#FFFFFF", tailwindClass: "bg-white", usage: "Base" },
        { name: "Black", hex: "#000000", tailwindClass: "bg-black", usage: "Text" },
    ],
    typography: {
        primaryFont: "Inter, sans-serif",
        styles: [
            { role: "Heading 1", fontFamily: "Inter", weight: "Bold", size: "48", sampleText: "Big Title" },
            { role: "Body", fontFamily: "Inter", weight: "Regular", size: "16", sampleText: "Regular text paragraph." }
        ]
    },
    components: {
        buttons: [
            { label: "Primary Action", backgroundColor: "#0077B6", textColor: "#FFFFFF", borderRadius: "0.5rem" },
            { label: "Rounded Action", backgroundColor: "#FF7F50", textColor: "#FFFFFF", borderRadius: "9999px" },
            { label: "Dark Action", backgroundColor: "#334155", textColor: "#FFFFFF", borderRadius: "4px" }
        ]
    }
};

// --- SETTINGS OPTIONS ---
const FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Mono', value: 'monospace' },
];

const BRAND_COLORS = [
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Slate', value: '#334155' },
    { name: 'Black', value: '#000000' },
];

// --- NAVIGATION CONFIG ---
// Context 1: Main Navigation
const MAIN_NAV_ITEMS = [
    { id: 'HOME', label: 'Home', icon: 'home', view: 'HOME' },
    { id: 'ITEMS', label: 'Items & menus', icon: 'sell', view: 'ITEMS' },
    { id: 'PROMOTIONS', label: 'All Promotions', icon: 'campaign', view: 'PROMOTIONS' },
    { id: 'ORDERS', label: 'Orders & payments', icon: 'receipt_long', view: 'ORDERS' },
    { id: 'ONLINE', label: 'Online', icon: 'language', view: 'ONLINE' },
    { id: 'DESIGN_EXTRACTOR', label: 'Design Extractor', icon: 'format_paint', view: 'DESIGN_EXTRACTOR' },
    { id: 'CUSTOMERS', label: 'Customers', icon: 'badge', view: 'CUSTOMERS' },
    { id: 'REPORTS', label: 'Reports', icon: 'bar_chart', view: 'REPORTS' },
    { id: 'STAFF_ROOT', label: 'Staff', icon: 'group', view: 'STAFF_MEMBERS', contextSwitch: 'STAFF' },
    { id: 'BANKING', label: 'Banking', icon: 'account_balance', view: 'BANKING' },
    { id: 'SETTINGS', label: 'Settings', icon: 'settings', view: 'SETTINGS' },
];

// Context 2: Staff Sub-Navigation
const STAFF_NAV_GROUPS = [
    {
        title: 'Team',
        items: [
            { id: 'STAFF_MEMBERS', label: 'Team members', view: 'STAFF_MEMBERS' },
            { id: 'STAFF_PERMISSIONS', label: 'Permissions', view: 'STAFF_PERMISSIONS' },
            { id: 'STAFF_ONBOARDING', label: 'Onboarding', view: 'STAFF_ONBOARDING' },
        ]
    },
    {
        title: 'Scheduling',
        items: [
            { id: 'STAFF_SHIFTS', label: 'Shifts', view: 'STAFF_SHIFTS' },
            { id: 'STAFF_REQUESTS', label: 'Time off', view: 'STAFF_REQUESTS' },
        ]
    },
    {
        title: 'Time tracking',
        items: [
            { id: 'STAFF_PAYROLL', label: 'Payroll', view: 'STAFF_PAYROLL' },
        ]
    },
];

// --- HELPER STYLES ---

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'ACTIVE': case 'Active': return { statusBadge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', statusDot: 'bg-emerald-500' };
        case 'INACTIVE': case 'Inactive': return { statusBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', statusDot: 'bg-slate-500' };
        case 'SCHEDULED': return { statusBadge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', statusDot: 'bg-amber-500' };
        case 'OUT_OF_STOCK': return { statusBadge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', statusDot: 'bg-red-500' };
        case 'On Leave': return { statusBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', statusDot: 'bg-slate-400' };
        default: return { statusBadge: 'bg-slate-100 dark:bg-slate-800', statusDot: 'bg-slate-500' };
    }
};

const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
        case 'Food': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800';
        case 'Beverage': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800';
        case 'Sides': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800';
        default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
};

const getTypeBadgeStyle = (type: string) => {
    if (type === 'Discount') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800';
    else if (type === 'Coupon') return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800';
    return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800';
};

const generatePromotions = (count: number): PromotionData[] => {
    const data: PromotionData[] = [];
    const types = ['Discount', 'Coupon', 'Shipping'];
    const channels = ['POS', 'Kiosk', 'App', 'Web', 'All'];
    const locationPool = ['Downtown HQ', 'Westside Mall', 'Airport Terminal', 'North Station'];
    const statuses = ['ACTIVE', 'INACTIVE', 'SCHEDULED'];
    
    for (let i = 1; i <= count; i++) {
        const id = `PR-${String(i).padStart(3, '0')}`;
        const name = `${NAMES_PREFIX[Math.floor(Math.random() * NAMES_PREFIX.length)]} ${NAMES_SUFFIX[Math.floor(Math.random() * NAMES_SUFFIX.length)]} ${i}`;
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const value = type === 'Shipping' ? 'Free' : (type === 'Discount' ? `${Math.floor(Math.random() * 50) + 5}%` : `$${Math.floor(Math.random() * 20) + 5}.00`);
        const channel = channels[Math.floor(Math.random() * channels.length)];

        let location = 'All Locations';
        if (Math.random() > 0.6) location = locationPool[Math.floor(Math.random() * locationPool.length)];

        const typeBadge = getTypeBadgeStyle(type);
        const { statusBadge, statusDot } = getStatusStyles(status);

        const initial = name.charAt(0);
        const bgColors = ['bg-indigo-100', 'bg-purple-100', 'bg-blue-100', 'bg-pink-100', 'bg-orange-100', 'bg-emerald-100'];
        const textColors = ['text-primary', 'text-purple-600', 'text-blue-600', 'text-pink-600', 'text-orange-600', 'text-emerald-600'];
        const colorIdx = Math.floor(Math.random() * bgColors.length);

        data.push({
            id, name, initial, 
            initialBg: `${bgColors[colorIdx]} dark:bg-opacity-20`, 
            initialText: `${textColors[colorIdx]} dark:text-white`,
            type, typeBadge, channel, location, value,
            schedule: 'Jan 01 - Dec 31',
            statusText: status, statusBadge, statusDot
        });
    }
    return data;
};

const generateItems = (count: number): ItemData[] => {
    const data: ItemData[] = [];
    const itemImages = [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1618183145484-9a896d84a7e4?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1630384060421-a4323ce56d20?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=100&q=80'
    ];
    const channels = ['POS', 'Kiosk', 'App', 'Web', 'All'];
    const locationPool = ['Downtown HQ', 'Westside Mall', 'Airport Terminal', 'North Station'];

    for (let i = 1; i <= count; i++) {
        const id = `ITM-${String(i).padStart(3, '0')}`;
        const baseName = ITEM_NAMES[Math.floor(Math.random() * ITEM_NAMES.length)];
        const name = `${baseName} ${i}`; 
        const category = ITEM_CATS[Math.floor(Math.random() * ITEM_CATS.length)];
        const price = `$${(Math.random() * 30 + 5).toFixed(2)}`;
        const stock = Math.floor(Math.random() * 150);
        let status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' = 'ACTIVE';
        if (stock === 0) status = 'OUT_OF_STOCK';
        else if (Math.random() > 0.8) status = 'INACTIVE';

        const channel = channels[Math.floor(Math.random() * channels.length)];
        let location = 'All Locations';
        if (Math.random() > 0.6) location = locationPool[Math.floor(Math.random() * locationPool.length)];

        data.push({
            id, name, 
            sku: `${category.substring(0,2).toUpperCase()}-${String(i).padStart(4,'0')}`,
            category, channel, location,
            image: itemImages[Math.floor(Math.random() * itemImages.length)],
            price, stock, unit: 'ea', status
        });
    }
    return data;
};

const generateDesignProjects = (count: number): DesignProjectData[] => {
    const data: DesignProjectData[] = [];
    const statuses: ('ACTIVE' | 'INACTIVE')[] = ['ACTIVE', 'INACTIVE'];
    for (let i = 1; i <= count; i++) {
        data.push({
            id: `DP-${String(i).padStart(3, '0')}`,
            name: PROJECT_NAMES[Math.floor(Math.random() * PROJECT_NAMES.length)] + ` ${i}`,
            description: PROJECT_DESCS[Math.floor(Math.random() * PROJECT_DESCS.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }
    return data;
};

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- CONTENT MAPPING FOR PLACEHOLDERS ---
const PLACEHOLDER_CONTENT: Record<string, { title: string; description: string; buttonText: string; footerText: string; icon: string }> = {
    ORDERS: {
        title: "Create your first order",
        description: "Orders allow you to track sales, manage fulfillment, and process payments efficiently in one place.",
        buttonText: "Create order",
        footerText: "Orders are processed securely. Transaction fees may apply based on your payment gateway settings.",
        icon: "receipt_long"
    },
    ONLINE: {
        title: "Launch your Online Store",
        description: "Reach more customers by selling your products online. Setup is quick and integrates with your inventory.",
        buttonText: "Start setup",
        footerText: "Includes free hosting, SSL certificate, and integrated payments.",
        icon: "storefront"
    },
    CUSTOMERS: {
        title: "Add your first customer",
        description: "Build relationships with your customers. Track purchase history, loyalty points, and preferences.",
        buttonText: "Add customer",
        footerText: "Import customers from CSV or sync with your contacts.",
        icon: "person_add"
    },
    REPORTS: {
        title: "No reports generated yet",
        description: "Get insights into your business performance. Sales, inventory, and staff reports will appear here.",
        buttonText: "View sample report",
        footerText: "Reports update in real-time. Export data to PDF or CSV.",
        icon: "bar_chart"
    },
    BANKING: {
        title: "Connect your bank account",
        description: "Link a bank account to receive payouts from your sales. Manage transfers and view settlement history.",
        buttonText: "Link account",
        footerText: "Secure banking integration provided by Stripe and Plaid.",
        icon: "account_balance"
    }
    // SETTINGS is now handled separately
    // STAFF is now handled separately
};

// --- CONFIG FOR BUTTON CUSTOMIZER (DESIGN EXTRACTOR) ---
interface ButtonConfig {
    effect: 'FLAT' | 'SOFT' | 'NEO' | 'GLOW';
    bgColor: string;
    textColor: string;
    hoverOpacity: number;
    effectIntensity: number; // Updated from activeOpacity
    fontFamily: string;
    borderRadius: number;
    paddingX: number;
    paddingY: number;
}

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<DashboardView>('HOME');
  const [sidebarContext, setSidebarContext] = useState<SidebarContext>('MAIN');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>('BUTTONS_FONTS');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({'Team': true});

  // Data
  const [promotions, setPromotions] = useState<PromotionData[]>(() => generatePromotions(125));
  const [items, setItems] = useState<ItemData[]>(() => generateItems(125));
  const [designProjects, setDesignProjects] = useState<DesignProjectData[]>(() => generateDesignProjects(45));
  const [staffList, setStaffList] = useState<StaffData[]>(MOCK_STAFF);

  // Global Configuration State
  const initialGlobalConfig: GlobalConfig = {
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#8B5CF6', // Default Violet
      borderRadius: 9999, // Pill shape
      paddingX: 32,
      paddingY: 12,
      buttonStyle: 'FLAT'
  };

  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(initialGlobalConfig);
  const [draftConfig, setDraftConfig] = useState<GlobalConfig>(initialGlobalConfig);
  const [lastAppliedConfig, setLastAppliedConfig] = useState<GlobalConfig | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); 
  const [typeFilter, setTypeFilter] = useState<string>('ALL'); 
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL'); // For Staff

  // UI State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  // Modals
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', description: '', files: [] as File[] });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BrandAnalysisResult | null>(null);
  
  // Customizer State (Design Extractor specific, separates from Global)
  const [btnConfig, setBtnConfig] = useState<ButtonConfig>({
      effect: 'FLAT',
      bgColor: '#FF6B00',
      textColor: '#FFFFFF',
      hoverOpacity: 90,
      effectIntensity: 50,
      fontFamily: 'Inter, sans-serif',
      borderRadius: 12,
      paddingX: 32,
      paddingY: 10
  });

  const checkboxRef = useRef<HTMLInputElement>(null);

  // Initialize draft config when entering settings
  useEffect(() => {
      if (currentView === 'SETTINGS') {
          setDraftConfig(globalConfig);
      }
  }, [currentView, globalConfig]);

  // Initialize btnConfig when analysisResult loads
  useEffect(() => {
    if (analysisResult) {
        const primaryColor = analysisResult.colors.find(c => c.usage.toLowerCase().includes('primary'))?.hex || analysisResult.colors[0]?.hex || '#FF6B00';
        const primaryFont = analysisResult.typography.primaryFont || 'Inter, sans-serif';
        setBtnConfig(prev => ({
            ...prev,
            bgColor: primaryColor,
            fontFamily: primaryFont
        }));
    }
  }, [analysisResult]);

  // Reset pagination on view change
  useEffect(() => {
      setCurrentPage(1);
      setSearchQuery('');
      setSelectedIds(new Set());
      setStatusFilter('ALL');
      setTypeFilter('ALL');
      setCategoryFilter('ALL');
      setRoleFilter('ALL');
      setItemsPerPage(10);
  }, [currentView]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = () => { setActiveDropdown(null); setOpenFilterId(null); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const toggleGroup = (groupTitle: string) => {
      setExpandedGroups(prev => ({...prev, [groupTitle]: !prev[groupTitle]}));
  }

  const handleDropdownToggle = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenFilterId(openFilterId === id ? null : id);
      setActiveDropdown(null);
  };

  const handleRowActionToggle = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveDropdown(activeDropdown === id ? null : id);
      setOpenFilterId(null);
  };

  const handleNewItemClick = () => {
      if (currentView === 'DESIGN_EXTRACTOR') setIsNewProjectModalOpen(true);
      else if (currentView === 'STAFF_MEMBERS') alert("Create Employee Modal would open here.");
  };

  const handleLoadDemo = () => {
      setIsNewProjectModalOpen(false);
      setIsAnalyzing(true);
      setCurrentView('PROJECT_DETAILS');
      setTimeout(() => {
          setAnalysisResult(DEMO_ANALYSIS);
          const newProject: DesignProjectData = {
            id: `DP-${String(designProjects.length + 1).padStart(3, '0')}`,
            name: 'Demo Project',
            description: 'Loaded from sample data',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'ACTIVE'
          };
          setDesignProjects([newProject, ...designProjects]);
          setIsAnalyzing(false);
      }, 1500);
  };

  const handleCreateProject = async () => {
      setIsNewProjectModalOpen(false);
      setIsAnalyzing(true);
      setCurrentView('PROJECT_DETAILS');
      try {
          const imageParts = [];
          for (const file of newProjectForm.files) {
              const base64Data = await fileToBase64(file);
              imageParts.push({ inlineData: { data: base64Data, mimeType: file.type } });
          }
          if (imageParts.length === 0) console.warn("No files to analyze");

          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
            You are a Brand Design Expert. Analyze the uploaded brand guideline images. 
            Extract the following information and return it in valid JSON format ONLY:
            1. "colors": An array of the color palette. For each color, provide: "name", "hex", "tailwindClass", "usage".
            2. "typography": An object containing "primaryFont" and "styles" array (role, fontFamily, weight, size, sampleText).
            3. "components": An object containing "buttons" array (label, backgroundColor, textColor, borderRadius).
            Ensure the response is raw JSON without markdown code blocks.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: { parts: [...imageParts, { text: prompt }] }
          });

          let jsonText = response.text;
          if (jsonText && jsonText.startsWith('```json')) jsonText = jsonText.replace(/^```json/, '').replace(/```$/, '');
          else if (jsonText && jsonText.startsWith('```')) jsonText = jsonText.replace(/^```/, '').replace(/```$/, '');
          
          if (jsonText) {
            const result: BrandAnalysisResult = JSON.parse(jsonText);
            setAnalysisResult(result);
          } else {
            throw new Error("Empty response");
          }
          
          const newProject: DesignProjectData = {
            id: `DP-${String(designProjects.length + 1).padStart(3, '0')}`,
            name: newProjectForm.name || 'Untitled Project',
            description: newProjectForm.description || 'AI Extracted Project',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'ACTIVE'
          };
          setDesignProjects([newProject, ...designProjects]);
      } catch (error) {
          console.error("Error analyzing brand assets:", error);
          // Fallback to demo for smooth UX
          setAnalysisResult(DEMO_ANALYSIS);
          const newProject: DesignProjectData = {
            id: `DP-${String(designProjects.length + 1).padStart(3, '0')}`,
            name: newProjectForm.name || 'Untitled Project',
            description: newProjectForm.description || 'AI Extracted Project (Fallback)',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'ACTIVE'
          };
          setDesignProjects([newProject, ...designProjects]);
      } finally {
          setIsAnalyzing(false);
          setNewProjectForm({ name: '', description: '', files: [] });
      }
  };

  const handleFileDrop = (e: React.DragEvent) => {
      e.preventDefault(); setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setNewProjectForm(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.dataTransfer.files)] }));
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setNewProjectForm(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files || [])] }));
      }
  };

  const removeFile = (index: number) => {
      setNewProjectForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleBulkDelete = () => {
    const typeLabel = currentView === 'PROMOTIONS' ? 'promotions' : (currentView === 'ITEMS' ? 'items' : (currentView === 'STAFF_MEMBERS' ? 'staff members' : 'projects'));
    if (confirm(`Are you sure you want to delete ${selectedIds.size} ${typeLabel}?`)) {
        if (currentView === 'PROMOTIONS') setPromotions(prev => prev.filter(p => !selectedIds.has(p.id)));
        else if (currentView === 'ITEMS') setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
        else if (currentView === 'STAFF_MEMBERS') setStaffList(prev => prev.filter(i => !selectedIds.has(i.id)));
        else setDesignProjects(prev => prev.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
    }
  };

  const handleBulkStatus = (newStatus: string) => {
      if (currentView === 'PROMOTIONS') {
        setPromotions(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, statusText: newStatus, ...getStatusStyles(newStatus) } : p));
      } else if (currentView === 'ITEMS') {
        setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, status: newStatus as any } : i));
      } else if (currentView === 'DESIGN_EXTRACTOR') {
        setDesignProjects(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status: newStatus as any } : p));
      } else if (currentView === 'STAFF_MEMBERS') {
        setStaffList(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, status: newStatus as any } : s));
      }
      setSelectedIds(new Set());
  };

  const handleExport = () => {
    if (filteredData.length === 0) { alert("No data available to export."); return; }
    alert(`Exporting ${filteredData.length} items to CSV...`);
  };

  const exportConfigToCSV = () => {
    const csvRows = [
        ['Parameter', 'Value'],
        ['Effect', btnConfig.effect],
        ['Background Color', btnConfig.bgColor],
        ['Text Color', btnConfig.textColor],
        ['Font Family', btnConfig.fontFamily],
        ['Border Radius', `${btnConfig.borderRadius}px`],
        ['Padding X', `${btnConfig.paddingX}px`],
        ['Padding Y', `${btnConfig.paddingY}px`],
        ['Hover Opacity', `${btnConfig.hoverOpacity}%`],
        ['Effect Intensity', `${btnConfig.effectIntensity}%`],
        ['Primary Font', analysisResult?.typography.primaryFont || 'N/A'],
    ];
    
    if (analysisResult?.colors) {
        analysisResult.colors.forEach(c => {
            csvRows.push([`Color: ${c.name}`, c.hex]);
        });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "zap_app_config.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- SETTINGS ACTIONS ---
  const applyGlobalConfig = () => {
      setLastAppliedConfig(globalConfig);
      setGlobalConfig(draftConfig);
      alert('Settings applied globally!');
  };

  const rollbackGlobalConfig = () => {
      if (lastAppliedConfig) {
          setGlobalConfig(lastAppliedConfig);
          setDraftConfig(lastAppliedConfig);
          setLastAppliedConfig(null);
          alert('Settings rolled back to previous version.');
      }
  };

  // Filter Logic
  const getFilteredData = () => {
      if (currentView === 'PROMOTIONS') {
          return promotions.filter(p => {
              return (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
                     (statusFilter === 'ALL' || p.statusText === statusFilter) &&
                     (typeFilter === 'ALL' || p.type === typeFilter);
          });
      } else if (currentView === 'ITEMS') {
          return items.filter(i => {
              return (i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
                     (statusFilter === 'ALL' || i.status === statusFilter) &&
                     (categoryFilter === 'ALL' || i.category === categoryFilter);
          });
      } else if (currentView === 'DESIGN_EXTRACTOR') {
          return designProjects.filter(p => {
             return (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (statusFilter === 'ALL' || p.status === statusFilter);
          });
      } else if (currentView === 'STAFF_MEMBERS') {
          return staffList.filter(s => {
              return (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
                     (statusFilter === 'ALL' || s.status === statusFilter) &&
                     (roleFilter === 'ALL' || s.role === roleFilter);
          });
      }
      return [];
  };

  const filteredData = getFilteredData();
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSelected = new Set(selectedIds);
      if (e.target.checked) currentData.forEach((d: any) => newSelected.add(d.id));
      else currentData.forEach((d: any) => newSelected.delete(d.id));
      setSelectedIds(newSelected);
  };

  const handleRowClick = (item: any) => {
    if (currentView === 'DESIGN_EXTRACTOR') {
        if (!analysisResult) setAnalysisResult(DEMO_ANALYSIS);
        setCurrentView('PROJECT_DETAILS');
    } else {
        handleSelectRow(item.id);
    }
  };

  const allCurrentSelected = currentData.length > 0 && currentData.every((d: any) => selectedIds.has(d.id));
  const someCurrentSelected = currentData.some((d: any) => selectedIds.has(d.id)) && !allCurrentSelected;

  useEffect(() => { if (checkboxRef.current) checkboxRef.current.indeterminate = someCurrentSelected; }, [someCurrentSelected]);

  // RENDERERS
  const renderPagination = () => {
    return (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 rounded-b-2xl z-10 relative gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> results
            </p>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="px-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Page {currentPage} of {totalPages || 1}
                </div>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
        </div>
    );
  };

  const renderRowsDropdown = () => (
      <div className="relative">
        <button onClick={(e) => handleDropdownToggle('rows', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[120px] justify-between">
            <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Rows:</span><span>{itemsPerPage}</span></div>
            <span className="material-symbols-outlined text-lg text-slate-400">expand_more</span>
        </button>
        {openFilterId === 'rows' && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                {[10, 20, 50, 100].map(val => (
                    <button key={val} onClick={() => { setItemsPerPage(val); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${itemsPerPage === val ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{val}</button>
                ))}
            </div>
        )}
    </div>
  );

  const getDynamicButtonStyle = (withPadding = false) => {
    let baseStyle: React.CSSProperties = {
        backgroundColor: btnConfig.bgColor,
        color: btnConfig.textColor,
        fontFamily: btnConfig.fontFamily,
        borderRadius: `${btnConfig.borderRadius}px`,
        border: 'none',
        transition: 'all 0.3s ease',
    };

    if (withPadding) {
        baseStyle.padding = `${btnConfig.paddingY}px ${btnConfig.paddingX}px`;
    }

    const intensity = btnConfig.effectIntensity;

    if (btnConfig.effect === 'SOFT') {
        const opacity = 0.05 + (intensity / 200);
        baseStyle.boxShadow = `0 4px 12px -2px rgba(0,0,0,${opacity})`;
    } else if (btnConfig.effect === 'NEO') {
        const offset = Math.max(2, Math.floor(intensity / 15)); 
        baseStyle.border = '2px solid #000000'; 
        baseStyle.boxShadow = `${offset}px ${offset}px 0px 0px #000000`;
    } else if (btnConfig.effect === 'GLOW') {
        const spread = 5 + (intensity / 3);
        const alpha = Math.floor((0.2 + (intensity / 200)) * 255).toString(16).padStart(2, '0');
        baseStyle.boxShadow = `0 0 ${spread}px ${btnConfig.bgColor}${alpha}`;
    }

    return baseStyle;
  };

  const renderHome = () => {
    // Calculate stats
    const activePromos = promotions.filter(p => p.statusText === 'ACTIVE').length;
    const activeItems = items.filter(i => i.status === 'ACTIVE').length;
    const lowStock = items.filter(i => i.stock < 10).length;
    const activeProjects = designProjects.filter(p => p.status === 'ACTIVE').length;

    return (
        <div className="p-8 overflow-y-auto h-full">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-primary">
                            <span className="material-symbols-outlined text-2xl">campaign</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Promotions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activePromos}</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl">sell</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Items</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeItems}</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Low Stock Alerts</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{lowStock}</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-2xl">format_paint</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Design Projects</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeProjects}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Welcome to ZAP Dashboard</h3>
                    <p className="opacity-90 max-w-lg mb-6">Manage your F&B business efficiently. Check your promotions, update your menu, or design your new online store look.</p>
                    <button onClick={() => setCurrentView('PROMOTIONS')} className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        View Promotions
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                    <span className="material-symbols-outlined text-[300px]">bolt</span>
                </div>
            </div>
        </div>
    )
  };

  const renderStaff = () => {
     return (
        <div className="flex flex-col h-full">
            {/* Staff Header */}
            <div className="px-8 pt-8 pb-4 flex items-start justify-between relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Team members</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your team members and their roles.</p>
                </div>
                <button onClick={handleNewItemClick} className="btn gap-2">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Employee
                </button>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 relative z-20">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto">
                    <span className="material-symbols-outlined text-slate-400 pl-2">search</span>
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 h-9 w-64" 
                        placeholder="Search by name, role or email..."
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                    {/* Status Filter */}
                    <div className="relative">
                        <button onClick={(e) => handleDropdownToggle('status', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[140px] justify-between">
                            <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Status:</span><span>{statusFilter === 'ALL' ? 'All' : statusFilter}</span></div>
                            <span className="material-symbols-outlined text-lg text-slate-400">keyboard_arrow_down</span>
                        </button>
                        {openFilterId === 'status' && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                                {['ALL', 'Active', 'Inactive', 'On Leave'].map(status => (
                                    <button key={status} onClick={() => { setStatusFilter(status); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${statusFilter === status ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <button onClick={(e) => handleDropdownToggle('role', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[140px] justify-between">
                            <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Role:</span><span>{roleFilter === 'ALL' ? 'All' : roleFilter}</span></div>
                            <span className="material-symbols-outlined text-lg text-slate-400">keyboard_arrow_down</span>
                        </button>
                        {openFilterId === 'role' && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                                {['ALL', 'Manager', 'Cashier', 'Kitchen Staff', 'Server', 'Chef', 'Barista'].map(role => (
                                    <button key={role} onClick={() => { setRoleFilter(role); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${roleFilter === role ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {renderRowsDropdown()}
                    
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <span className="material-symbols-outlined text-lg text-slate-400">download</span>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 px-8 py-6 overflow-hidden relative z-10 flex flex-col">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full relative overflow-hidden">
                    <div className="flex-1 overflow-auto custom-scrollbar relative">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[250px]">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[200px]">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[150px]">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[150px]">Last Active</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[80px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 block">filter_list_off</span>
                                            No team members found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((d: any) => (
                                        <tr key={d.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{d.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {d.displayId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{d.role}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{d.roleType}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{d.email}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{d.phone}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${getStatusStyles(d.status).statusBadge}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                                                {d.lastActive}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-primary hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold">
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            </div>
        </div>
     );
  };

  const renderSettingsButtonsFonts = () => {
      // Dynamic CSS injection for live preview buttons to handle hover states correctly
      // based on draftConfig values.
      const previewStyles = `
        .preview-btn-base {
            border-radius: ${draftConfig.borderRadius}px;
            padding: ${draftConfig.paddingY}px ${draftConfig.paddingX}px;
            font-family: ${draftConfig.fontFamily};
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
        }

        .preview-btn-primary {
            background-color: ${draftConfig.primaryColor};
            color: #ffffff;
            border: none;
            ${draftConfig.buttonStyle === 'SOFT' ? 'box-shadow: 0 4px 14px 0 rgba(0,0,0,0.1);' : ''}
            ${draftConfig.buttonStyle === 'NEO' ? 'border: 2px solid #000; box-shadow: 4px 4px 0px 0px #000;' : ''}
            ${draftConfig.buttonStyle === 'GLOW' ? `box-shadow: 0 0 15px ${draftConfig.primaryColor};` : ''}
        }
        .preview-btn-primary:hover {
            opacity: 0.9;
            transform: translate(-1px, -1px);
            ${draftConfig.buttonStyle === 'NEO' ? 'box-shadow: 6px 6px 0px 0px #000;' : ''}
        }
        .preview-btn-primary:active {
            transform: translate(1px, 1px);
            ${draftConfig.buttonStyle === 'NEO' ? 'box-shadow: none;' : ''}
        }

        .preview-btn-outline {
            background-color: transparent;
            color: ${draftConfig.primaryColor};
            border: 2px solid ${draftConfig.primaryColor};
            ${draftConfig.buttonStyle === 'NEO' ? 'border: 2px solid #000; color: #000; box-shadow: 4px 4px 0px 0px #000;' : ''}
        }
        .preview-btn-outline:hover {
            background-color: ${draftConfig.primaryColor}10;
            transform: translate(-1px, -1px);
            ${draftConfig.buttonStyle === 'NEO' ? 'background-color: transparent; box-shadow: 6px 6px 0px 0px #000;' : ''}
        }
        .preview-btn-outline:active {
            transform: translate(1px, 1px);
            ${draftConfig.buttonStyle === 'NEO' ? 'box-shadow: none;' : ''}
        }

        .preview-btn-plain {
            background-color: transparent;
            color: ${draftConfig.primaryColor};
            border: 2px solid transparent;
            padding-left: ${draftConfig.paddingX / 2}px;
            padding-right: ${draftConfig.paddingX / 2}px;
        }
        .preview-btn-plain:hover {
            background-color: ${draftConfig.primaryColor}10;
        }

        .preview-link {
            font-family: ${draftConfig.fontFamily};
            color: ${draftConfig.primaryColor};
            font-weight: 600;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
        }
        .preview-link:hover {
            border-bottom-color: ${draftConfig.primaryColor};
        }

        .preview-btn-disabled {
            opacity: 0.5;
            cursor: not-allowed !important;
            filter: grayscale(100%);
            pointer-events: none;
        }
      `;

      return (
          <div className="max-w-6xl mx-auto py-8">
              <style>{previewStyles}</style>
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Buttons & Fonts</h3>
                      <p className="text-slate-500 dark:text-slate-400">Customize the global look and feel of your dashboard.</p>
                  </div>
                  <div className="flex gap-3">
                      {lastAppliedConfig && (
                          <button onClick={rollbackGlobalConfig} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <span className="material-symbols-outlined text-lg">history</span>
                              Rollback
                          </button>
                      )}
                      <button onClick={applyGlobalConfig} className="btn gap-2">
                          <span className="material-symbols-outlined text-lg">save</span>
                          Apply Changes
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Left Column: Controls - Width adjusted */}
                  <div className="xl:col-span-7 space-y-8">
                      
                      {/* Typography Section */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">text_fields</span>
                              Typography
                          </h4>
                          <div className="space-y-4">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Global Font Family</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {FONTS.map(font => (
                                      <button 
                                          key={font.name}
                                          onClick={() => setDraftConfig({...draftConfig, fontFamily: font.value})}
                                          className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${draftConfig.fontFamily === font.value ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                      >
                                          <span style={{ fontFamily: font.value }} className="truncate">{font.name}</span>
                                          {draftConfig.fontFamily === font.value && <span className="material-symbols-outlined text-lg shrink-0">check</span>}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Colors Section */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">palette</span>
                              Brand Color
                          </h4>
                          <div className="flex flex-wrap gap-3">
                              {BRAND_COLORS.map(color => (
                                  <button
                                      key={color.name}
                                      onClick={() => setDraftConfig({...draftConfig, primaryColor: color.value})}
                                      className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${draftConfig.primaryColor === color.value ? 'border-slate-400 dark:border-white ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : 'border-transparent'}`}
                                      style={{ backgroundColor: color.value }}
                                      title={color.name}
                                  >
                                      {draftConfig.primaryColor === color.value && <span className="material-symbols-outlined text-white text-lg drop-shadow-md">check</span>}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Buttons Section */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">smart_button</span>
                              Button Configuration
                          </h4>
                          <div className="space-y-6">
                              {/* Button Style Selector */}
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Button Style</label>
                                  <div className="grid grid-cols-4 gap-2">
                                      {['FLAT', 'SOFT', 'NEO', 'GLOW'].map(style => (
                                          <button
                                              key={style}
                                              onClick={() => setDraftConfig({...draftConfig, buttonStyle: style as any})}
                                              className={`py-2 rounded-lg text-xs font-bold transition-all ${draftConfig.buttonStyle === style ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                          >
                                              {style}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              <div>
                                  <div className="flex justify-between mb-2"><label className="text-xs text-slate-500 font-medium">Corner Radius</label><span className="text-xs font-mono text-slate-400">{draftConfig.borderRadius}px</span></div>
                                  <input type="range" min="0" max="50" value={draftConfig.borderRadius} onChange={(e) => setDraftConfig({...draftConfig, borderRadius: parseInt(e.target.value)})} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between mb-2"><label className="text-xs text-slate-500 font-medium">Horizontal Padding</label><span className="text-xs font-mono text-slate-400">{draftConfig.paddingX}px</span></div>
                                    <input type="range" min="12" max="60" value={draftConfig.paddingX} onChange={(e) => setDraftConfig({...draftConfig, paddingX: parseInt(e.target.value)})} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2"><label className="text-xs text-slate-500 font-medium">Vertical Padding</label><span className="text-xs font-mono text-slate-400">{draftConfig.paddingY}px</span></div>
                                    <input type="range" min="6" max="30" value={draftConfig.paddingY} onChange={(e) => setDraftConfig({...draftConfig, paddingY: parseInt(e.target.value)})} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
                                </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Live Preview - Width adjusted */}
                  <div className="xl:col-span-5 lg:sticky lg:top-8 h-fit">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Live Preview</h4>
                          
                          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">
                              <div>
                                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: draftConfig.fontFamily }}>Heading Text</h1>
                                  <p className="text-slate-500 dark:text-slate-400" style={{ fontFamily: draftConfig.fontFamily }}>
                                      This is how your body text will look across the dashboard. Clean and legible.
                                  </p>
                              </div>

                              <div className="space-y-6">
                                  {/* Primary Buttons */}
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Primary Buttons</p>
                                      <div className="flex flex-wrap gap-3">
                                          <button className="preview-btn-base preview-btn-primary">
                                              Primary Button
                                          </button>
                                          <button className="preview-btn-base preview-btn-primary">
                                              <span className="material-symbols-outlined text-[1.1em]">shopping_cart</span>
                                              With Icon
                                          </button>
                                      </div>
                                  </div>

                                  {/* Secondary / Outline */}
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Outline Buttons</p>
                                      <div className="flex flex-wrap gap-3">
                                          <button className="preview-btn-base preview-btn-outline">
                                              Outline Button
                                          </button>
                                          <button className="preview-btn-base preview-btn-outline">
                                              Cancel
                                          </button>
                                      </div>
                                  </div>

                                  {/* Plain & Link */}
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Plain Button</p>
                                          <button className="preview-btn-base preview-btn-plain">
                                              Plain Action
                                          </button>
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Link Style</p>
                                          <a href="#" className="preview-link" onClick={e => e.preventDefault()}>
                                              Read more
                                          </a>
                                      </div>
                                  </div>

                                  {/* Disabled State */}
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Disabled State</p>
                                      <button className="preview-btn-base preview-btn-primary preview-btn-disabled" disabled>
                                          Disabled Button
                                      </button>
                                  </div>
                              </div>

                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2 text-sm">
                                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: draftConfig.primaryColor }}></span>
                                      <span style={{ color: draftConfig.primaryColor, fontFamily: draftConfig.fontFamily, fontWeight: 'bold' }}>Primary Color Accent</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderSettings = () => {
      return (
          <div className="flex h-full">
              {/* Settings Sidebar */}
              <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 overflow-y-auto">
                  <div className="p-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Settings</h3>
                      <nav className="space-y-1">
                          <button onClick={() => setSettingsView('GENERAL')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsView === 'GENERAL' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <span className="material-symbols-outlined text-[18px]">tune</span>
                              General
                          </button>
                          <button onClick={() => setSettingsView('BUTTONS_FONTS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsView === 'BUTTONS_FONTS' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <span className="material-symbols-outlined text-[18px]">format_paint</span>
                              Buttons & Fonts
                          </button>
                          <button onClick={() => setSettingsView('NOTIFICATIONS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsView === 'NOTIFICATIONS' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <span className="material-symbols-outlined text-[18px]">notifications</span>
                              Notifications
                          </button>
                          <button onClick={() => setSettingsView('SECURITY')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsView === 'SECURITY' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <span className="material-symbols-outlined text-[18px]">lock</span>
                              Security
                          </button>
                      </nav>
                  </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8">
                  {settingsView === 'BUTTONS_FONTS' ? renderSettingsButtonsFonts() : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                              <span className="material-symbols-outlined text-3xl text-slate-400">construction</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Under Construction</h3>
                          <p className="text-slate-500 dark:text-slate-400">This settings page is coming soon.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderPlaceholder = (view: string) => {
    const content = PLACEHOLDER_CONTENT[view];
    if (!content) return null;
    return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-fade-in max-w-2xl mx-auto">
            {/* Illustration Container */}
            <div className="relative w-64 h-64 mb-8 animate-float">
                {/* Background Blob/Shape */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-800 rounded-full opacity-60 blur-2xl transform scale-110"></div>
                
                {/* Main Icon Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center border border-slate-50 dark:border-slate-700 relative z-10 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                      <span className="material-symbols-outlined text-6xl text-slate-900 dark:text-white">{content.icon}</span>
                      
                      {/* Decorative Elements on Icon Card */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                         <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                   </div>
                </div>
                
                {/* Floating particles */}
                <div className="absolute top-10 left-10 text-slate-300 dark:text-slate-600 animate-pulse delay-700">
                   <span className="material-symbols-outlined text-3xl opacity-50">star</span>
                </div>
                <div className="absolute bottom-10 right-10 text-slate-300 dark:text-slate-600 animate-pulse delay-1000">
                   <span className="material-symbols-outlined text-2xl opacity-50">circle</span>
                </div>
                <div className="absolute top-4 right-12 w-4 h-4 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3" style={{ fontFamily: globalConfig.fontFamily }}>{content.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed text-base" style={{ fontFamily: globalConfig.fontFamily }}>{content.description}</p>
            
            {/* Button - Using global 'btn' class to connect with Settings > Buttons & Fonts */}
            <button className="btn shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                {content.buttonText}
            </button>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-8 font-medium max-w-lg" style={{ fontFamily: globalConfig.fontFamily }}>{content.footerText}</p>
        </div>
    );
  };

  const renderMobilePreview = () => {
     return (
        <div className="h-screen w-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <button onClick={() => setCurrentView('PROJECT_DETAILS')} className="absolute top-8 left-8 z-20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Editor
            </button>
            
            <div className="relative w-[375px] h-[812px] bg-white dark:bg-slate-950 rounded-[50px] shadow-2xl border-[14px] border-slate-900 overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="h-12 bg-white dark:bg-slate-950 flex items-center justify-between px-6 shrink-0 relative z-10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">9:41</span>
                    <div className="w-20 h-6 bg-black rounded-b-3xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                    <div className="flex gap-1.5">
                        <span className="material-symbols-outlined text-xs text-slate-900 dark:text-white">signal_cellular_alt</span>
                        <span className="material-symbols-outlined text-xs text-slate-900 dark:text-white">wifi</span>
                        <span className="material-symbols-outlined text-xs text-slate-900 dark:text-white">battery_full</span>
                    </div>
                </div>

                {/* Mobile App Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20 scrollbar-hide">
                    {/* Hero */}
                    <div className="h-64 bg-slate-200 relative">
                        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Food" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <h2 className="text-white text-3xl font-bold leading-tight" style={{ fontFamily: btnConfig.fontFamily }}>Delicious Food Delivered.</h2>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: btnConfig.fontFamily }}>Categories</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {['Burgers', 'Sushi', 'Pizza', 'Vegan'].map(cat => (
                                <div key={cat} className="flex-shrink-0 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{cat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Items */}
                    <div className="px-6 space-y-6">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: btnConfig.fontFamily }}>Popular Now</h3>
                         {[1,2,3].map(i => (
                             <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex gap-4">
                                 <div className="w-24 h-24 bg-slate-200 rounded-xl flex-shrink-0"></div>
                                 <div className="flex-1 flex flex-col justify-between">
                                     <div>
                                         <h4 className="font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: btnConfig.fontFamily }}>Awesome Burger</h4>
                                         <p className="text-xs text-slate-500 line-clamp-2">Juicy beef patty with fresh lettuce, tomato, and cheese.</p>
                                     </div>
                                     <div className="flex items-center justify-between mt-2">
                                         <span className="font-bold text-slate-900 dark:text-white">$12.99</span>
                                         <button style={{...getDynamicButtonStyle(false), padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                                             Add
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Bottom Nav */}
                <div className="h-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-6 absolute bottom-0 w-full z-10">
                    <span className="material-symbols-outlined text-2xl text-primary" style={{ color: btnConfig.bgColor }}>home</span>
                    <span className="material-symbols-outlined text-2xl text-slate-300">search</span>
                    <div className="w-14 h-14 rounded-full -mt-8 flex items-center justify-center shadow-lg" style={{ backgroundColor: btnConfig.bgColor, color: btnConfig.textColor }}>
                         <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-slate-300">favorite</span>
                    <span className="material-symbols-outlined text-2xl text-slate-300">person</span>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Preview Mode</p>
                    <p className="text-xs text-slate-500">iPhone 13 Pro</p>
                </div>
            </div>
        </div>
     );
  };

  const renderProjectDetails = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <span className="material-symbols-outlined text-4xl text-primary absolute inset-0 flex items-center justify-center animate-pulse">auto_awesome</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Brand Assets...</h2>
                <p className="text-slate-500 dark:text-slate-400">Extracting colors, fonts, and styles from your uploads.</p>
            </div>
        );
    }

    if (!analysisResult) return null;

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setCurrentView('DESIGN_EXTRACTOR')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Projects
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setCurrentView('MOBILE_PREVIEW')} className="btn bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined">smartphone</span>
                            Mobile Preview
                        </button>
                        <button onClick={exportConfigToCSV} className="btn gap-2">
                            <span className="material-symbols-outlined">download</span>
                            Export Config
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Analysis Results */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Extracted Colors */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">palette</span>
                                Extracted Brand Colors
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {analysisResult.colors.map((color, idx) => (
                                    <div key={idx} className="group cursor-pointer" onClick={() => setBtnConfig({...btnConfig, bgColor: color.hex})}>
                                        <div className="h-24 rounded-xl shadow-sm mb-3 relative overflow-hidden transition-transform group-hover:scale-110" style={{ backgroundColor: color.hex }}>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-white font-medium text-xs bg-black/50 px-2 py-1 rounded-full">Use as Button BG</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{color.name}</p>
                                            <p className="text-xs text-slate-500 font-mono uppercase">{color.hex}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Button Customizer */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                Component Customizer
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Button Style</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['FLAT', 'SOFT', 'NEO', 'GLOW'].map(style => (
                                                <button
                                                    key={style}
                                                    onClick={() => setBtnConfig({...btnConfig, effect: style as any})}
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${btnConfig.effect === style ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                >
                                                    {style}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Border Radius</label>
                                            <span className="text-xs font-mono text-slate-400">{btnConfig.borderRadius}px</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="50" 
                                            value={btnConfig.borderRadius} 
                                            onChange={(e) => setBtnConfig({...btnConfig, borderRadius: parseInt(e.target.value)})}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effect Intensity</label>
                                            <span className="text-xs font-mono text-slate-400">{btnConfig.effectIntensity}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={btnConfig.effectIntensity} 
                                            onChange={(e) => setBtnConfig({...btnConfig, effectIntensity: parseInt(e.target.value)})}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Colors</label>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Background</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-400">{btnConfig.bgColor}</span>
                                                <input type="color" value={btnConfig.bgColor} onChange={(e) => setBtnConfig({...btnConfig, bgColor: e.target.value})} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Text Color</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-400">{btnConfig.textColor}</span>
                                                <input type="color" value={btnConfig.textColor} onChange={(e) => setBtnConfig({...btnConfig, textColor: e.target.value})} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Typography</label>
                                        <select 
                                            value={btnConfig.fontFamily}
                                            onChange={(e) => setBtnConfig({...btnConfig, fontFamily: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value={analysisResult.typography.primaryFont}>Original: {analysisResult.typography.primaryFont}</option>
                                            {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Preview Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 sticky top-8">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8 text-center">Live Preview</h4>
                            
                            <div className="flex flex-col gap-6 items-center justify-center min-h-[300px] bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
                                <button style={getDynamicButtonStyle(true)}>
                                    Primary Button
                                </button>

                                <button style={getDynamicButtonStyle(true)} className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Add to Cart
                                </button>
                                
                                <button style={{...getDynamicButtonStyle(true), width: '100%'}}>
                                    Full Width
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">CSS Output</p>
                                <div className="bg-slate-800 rounded-lg p-4 text-left overflow-x-auto">
                                    <pre className="text-xs font-mono text-emerald-400">
{`.custom-btn {
  background: ${btnConfig.bgColor};
  color: ${btnConfig.textColor};
  border-radius: ${btnConfig.borderRadius}px;
  font-family: ${btnConfig.fontFamily.split(',')[0]};
  /* Effect: ${btnConfig.effect} */
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderMainContent = () => {
    switch (currentView) {
        case 'HOME':
            return renderHome();
        case 'PROJECT_DETAILS':
            return renderProjectDetails();
        case 'SETTINGS':
            return renderSettings();
        case 'STAFF_MEMBERS':
            return renderStaff();
        case 'ORDERS':
        case 'ONLINE':
        case 'CUSTOMERS':
        case 'REPORTS':
        case 'BANKING':
            return renderPlaceholder(currentView);
        default:
            return (
                <>
                    {/* Toolbar - Only for Table Views */}
                    <div className="px-8 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 relative z-20">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto">
                            <span className="material-symbols-outlined text-slate-400 pl-2">search</span>
                            <input 
                                className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 h-9 w-64" 
                                placeholder={currentView === 'DESIGN_EXTRACTOR' ? "Search projects..." : (currentView === 'PROMOTIONS' ? "Search campaigns..." : "Search items, ID, or SKU...")}
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* ... Existing Filter Controls ... */}
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                            {/* Status Filter */}
                            <div className="relative">
                                <button onClick={(e) => handleDropdownToggle('status', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[140px] justify-between">
                                    <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Status:</span><span>{statusFilter === 'ALL' ? 'All' : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase().replace('_', ' ')}</span></div>
                                    <span className="material-symbols-outlined text-lg text-slate-400">keyboard_arrow_down</span>
                                </button>
                                {openFilterId === 'status' && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                                        {(currentView === 'DESIGN_EXTRACTOR' ? ['ALL', 'ACTIVE', 'INACTIVE'] : ['ALL', 'ACTIVE', 'INACTIVE', currentView === 'PROMOTIONS' ? 'SCHEDULED' : 'OUT_OF_STOCK']).map(status => (
                                            <button key={status} onClick={() => { setStatusFilter(status); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${statusFilter === status ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                {status.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Specific Filters (Type/Category) */}
                            {currentView === 'PROMOTIONS' && (
                                <div className="relative">
                                    <button onClick={(e) => handleDropdownToggle('type', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[140px] justify-between">
                                        <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Type:</span><span>{typeFilter === 'ALL' ? 'All' : typeFilter}</span></div>
                                        <span className="material-symbols-outlined text-lg text-slate-400">keyboard_arrow_down</span>
                                    </button>
                                    {openFilterId === 'type' && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                                            {['ALL', 'Discount', 'Coupon', 'Shipping'].map(t => (
                                                <button key={t} onClick={() => { setTypeFilter(t); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${typeFilter === t ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {currentView === 'ITEMS' && (
                                <div className="relative">
                                    <button onClick={(e) => handleDropdownToggle('cat', e)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-w-[140px] justify-between">
                                        <div className="flex items-center gap-2"><span className="text-slate-400 font-normal">Category:</span><span>{categoryFilter === 'ALL' ? 'All' : categoryFilter}</span></div>
                                        <span className="material-symbols-outlined text-lg text-slate-400">keyboard_arrow_down</span>
                                    </button>
                                    {openFilterId === 'cat' && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-down z-50">
                                            {['ALL', ...ITEM_CATS].map(c => (
                                                <button key={c} onClick={() => { setCategoryFilter(c); setOpenFilterId(null); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${categoryFilter === c ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{c}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {renderRowsDropdown()}
                            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-400">download</span>
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="flex-1 px-8 py-6 overflow-hidden relative z-10 flex flex-col">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full relative overflow-hidden">
                        {/* Scrollable Container with HTML Table */}
                        <div className="flex-1 overflow-auto custom-scrollbar relative">
                            <table className="w-full min-w-[1200px] border-collapse text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 w-[50px]">
                                            <input type="checkbox" ref={checkboxRef} checked={allCurrentSelected} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary cursor-pointer" />
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[100px]">ID</th>
                                        
                                        {currentView === 'DESIGN_EXTRACTOR' ? (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[250px]">Project Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[150px]">Date</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{currentView === 'PROMOTIONS' ? 'Promotion Name' : 'Item Name'}</th>
                                                {currentView === 'PROMOTIONS' ? (
                                                    <>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[120px]">Type</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[100px]">Channel</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[140px]">Location</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[100px]">Value</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[160px]">Schedule</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[120px]">Type</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[100px]">Channel</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[140px]">Location</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[120px]">SKU</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[100px]">Value</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[100px]">Stock</th>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[130px]">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[80px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-4xl mb-2 block">filter_list_off</span>
                                                No results found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((d: any) => (
                                            <tr 
                                                key={d.id} 
                                                onClick={() => handleRowClick(d)}
                                                className={`group transition-colors cursor-pointer relative ${selectedIds.has(d.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                            >
                                                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => handleSelectRow(d.id)} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary cursor-pointer" />
                                                </td>
                                                <td className="px-6 py-5 text-xs text-slate-500 font-mono">{d.id}</td>

                                                {currentView === 'DESIGN_EXTRACTOR' ? (
                                                    <>
                                                        <td className="px-6 py-5"><span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{d.name}</span></td>
                                                        <td className="px-6 py-5"><span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{d.description}</span></td>
                                                        <td className="px-6 py-5"><span className="text-xs text-slate-500 font-medium">{d.date}</span></td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                {currentView === 'PROMOTIONS' ? (
                                                                    <>
                                                                        <div className={`h-9 w-9 rounded-full ${d.initialBg} flex items-center justify-center ${d.initialText} text-sm font-bold shadow-sm shrink-0`}>{d.initial}</div>
                                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{d.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0"><img src={d.image} alt={d.name} className="h-full w-full object-cover" /></div>
                                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{d.name}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {currentView === 'PROMOTIONS' ? (
                                                            <>
                                                                <td className="px-6 py-5"><span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${d.typeBadge}`}>{d.type}</span></td>
                                                                <td className="px-6 py-5"><span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{d.channel}</span></td>
                                                                <td className="px-6 py-5"><span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 truncate"><span className="material-symbols-outlined text-sm text-slate-400">place</span>{d.location}</span></td>
                                                                <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">{d.value}</td>
                                                                <td className="px-6 py-5 text-xs text-slate-500">{d.schedule}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-6 py-5"><span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getCategoryBadgeStyle(d.category)}`}>{d.category}</span></td>
                                                                <td className="px-6 py-5"><span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{d.channel}</span></td>
                                                                <td className="px-6 py-5"><span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 truncate"><span className="material-symbols-outlined text-sm text-slate-400">place</span>{d.location}</span></td>
                                                                <td className="px-6 py-5 text-xs text-slate-500 font-mono">{d.sku}</td>
                                                                <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">{d.price}</td>
                                                                <td className="px-6 py-5 text-sm text-right"><span className={`font-bold ${d.stock === 0 ? 'text-red-500' : (d.stock <= 10 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400')}`}>{d.stock}</span><span className="text-xs text-slate-400 ml-1">{d.unit}</span></td>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${currentView === 'PROMOTIONS' ? d.statusBadge : getStatusStyles(d.status).statusBadge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'PROMOTIONS' ? d.statusDot : getStatusStyles(d.status).statusDot}`}></span>
                                                        {currentView === 'PROMOTIONS' ? d.statusText : d.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-6 py-5 text-right relative">
                                                    <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={(e) => handleRowActionToggle(d.id, e)}>
                                                        <span className="material-symbols-outlined text-xl">more_horiz</span>
                                                    </button>
                                                    {activeDropdown === d.id && (
                                                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden origin-top-right animate-fade-in-down text-left" onClick={(e) => e.stopPropagation()}>
                                                            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><span className="material-symbols-outlined text-lg">edit</span>Edit</button>
                                                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><span className="material-symbols-outlined text-lg">delete</span>Delete</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {renderPagination()}
                        
                        {/* BULK ACTIONS FLOATING BAR */}
                        {selectedIds.size > 0 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-fade-in-up border border-slate-700 dark:border-slate-200">
                                <div className="flex items-center gap-3 pr-6 border-r border-slate-700 dark:border-slate-200">
                                    <span className="font-bold text-lg">{selectedIds.size}</span>
                                    <span className="text-sm font-medium opacity-80">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleBulkStatus('ACTIVE')} className="p-2 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full transition-colors" title="Activate">
                                        <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">check_circle</span>
                                    </button>
                                    <button onClick={() => handleBulkStatus('INACTIVE')} className="p-2 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full transition-colors" title="Deactivate">
                                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">block</span>
                                    </button>
                                    
                                    <button onClick={() => setIsBulkEditModalOpen(true)} className="p-2 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full transition-colors" title="Bulk Edit">
                                        <span className="material-symbols-outlined text-indigo-400 dark:text-indigo-600">edit_note</span>
                                    </button>
                                    
                                    <div className="w-px h-6 bg-slate-700 dark:bg-slate-200 mx-2"></div>
                                    
                                    <button onClick={handleBulkDelete} className="p-2 hover:bg-red-900/50 dark:hover:bg-red-50 rounded-full transition-colors group" title="Delete">
                                        <span className="material-symbols-outlined text-red-400 dark:text-red-500 group-hover:text-red-300 dark:group-hover:text-red-600">delete</span>
                                    </button>
                                </div>
                                <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-sm opacity-60">close</span>
                                </button>
                            </div>
                        )}
                      </div>
                    </div>
                </>
            );
    }
  };

  if (currentView === 'MOBILE_PREVIEW') return renderMobilePreview();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* GLOBAL STYLE INJECTION */}
      <style>
      {`
        :root {
            --global-font: ${globalConfig.fontFamily};
            --global-primary: ${globalConfig.primaryColor};
            --global-radius: ${globalConfig.borderRadius}px;
            --global-pad-x: ${globalConfig.paddingX}px;
            --global-pad-y: ${globalConfig.paddingY}px;
        }
        body {
            font-family: var(--global-font) !important;
        }
        .btn {
            background-color: var(--global-primary) !important;
            border-radius: var(--global-radius) !important;
            padding: var(--global-pad-y) var(--global-pad-x) !important;
            color: #ffffff !important;
            border: none !important;
            transition: all 0.2s ease !important;
            ${globalConfig.buttonStyle === 'SOFT' ? 'box-shadow: 0 4px 14px 0 rgba(0,0,0,0.1) !important;' : ''}
            ${globalConfig.buttonStyle === 'NEO' ? 'border: 2px solid #000 !important; box-shadow: 4px 4px 0px 0px #000 !important; transform: translate(-2px, -2px);' : ''}
            ${globalConfig.buttonStyle === 'GLOW' ? `box-shadow: 0 0 15px ${globalConfig.primaryColor} !important;` : ''}
            ${globalConfig.buttonStyle === 'FLAT' ? 'box-shadow: none !important;' : ''}
        }
        .btn:active {
            ${globalConfig.buttonStyle === 'NEO' ? 'transform: translate(0, 0) !important; box-shadow: none !important;' : 'transform: scale(0.98) !important;'}
        }
        /* Dark Mode Overrides */
        .dark .btn {
            color: #ffffff !important;
            ${globalConfig.buttonStyle === 'NEO' ? 'border-color: #ffffff !important; box-shadow: 4px 4px 0px 0px #ffffff !important;' : ''}
            ${globalConfig.buttonStyle === 'SOFT' ? 'box-shadow: 0 4px 14px 0 rgba(0,0,0,0.4) !important;' : ''}
        }
        .text-primary { color: var(--global-primary) !important; }
        .bg-primary { background-color: var(--global-primary) !important; }
        .border-primary { border-color: var(--global-primary) !important; }
        .focus\\:ring-primary:focus { --tw-ring-color: var(--global-primary) !important; }
        .accent-primary { accent-color: var(--global-primary) !important; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}
      </style>

      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 z-20`}>
         <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-8'} relative sticky top-0 bg-white dark:bg-slate-900 z-10`}>
                {isSidebarCollapsed ? (
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-2xl">bolt</span>
                    </div>
                ) : (
                    <img src={LOGO_DATA_URI} alt="ZAP Logo" className="h-10 w-auto dark:invert animate-fade-in" />
                )}
            </div>
            
            {/* Dynamic Navigation */}
            <nav className="px-3 space-y-1 mt-6 pb-20">
                
                {/* Back Button for Staff Context */}
                {sidebarContext === 'STAFF' && !isSidebarCollapsed && (
                    <button 
                        onClick={() => { setSidebarContext('MAIN'); setCurrentView('HOME'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 mb-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-bold"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Staff
                    </button>
                )}

                {/* Render Main Nav */}
                {sidebarContext === 'MAIN' && MAIN_NAV_ITEMS.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => {
                            if (item.contextSwitch === 'STAFF') {
                                setSidebarContext('STAFF');
                                setCurrentView(item.view as DashboardView);
                            } else {
                                setCurrentView(item.view as DashboardView);
                            }
                        }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all group ${
                            currentView === item.view
                            ? 'bg-indigo-50 dark:bg-slate-800 text-primary dark:text-indigo-400 font-bold' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                        }`}
                        title={item.label}
                    >
                        <span className={`material-symbols-outlined text-xl ${currentView === item.view ? 'text-primary dark:text-indigo-400' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                            {item.icon}
                        </span>
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                    </button>
                ))}

                {/* Render Staff Sub-Nav */}
                {sidebarContext === 'STAFF' && STAFF_NAV_GROUPS.map((group, idx) => (
                    <div key={idx} className="mb-2">
                        {!isSidebarCollapsed && (
                            <button 
                                onClick={() => toggleGroup(group.title)}
                                className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {group.title}
                                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${expandedGroups[group.title] ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                        )}
                        
                        {(expandedGroups[group.title] || isSidebarCollapsed) && (
                            <div className="space-y-1 mt-1">
                                {group.items.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setCurrentView(item.view as DashboardView)}
                                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4 pl-8'} py-2.5 rounded-xl transition-all text-sm ${
                                            currentView === item.view
                                            ? 'bg-indigo-50/50 dark:bg-slate-800/50 text-primary dark:text-indigo-400 font-bold' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {!isSidebarCollapsed && item.label}
                                        {isSidebarCollapsed && <span className="w-2 h-2 rounded-full bg-current"></span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Additional Items for Staff Context */}
                {sidebarContext === 'STAFF' && (
                    <>
                        <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-4"></div>
                        {[
                            { label: 'Announcements', view: 'STAFF_ANNOUNCEMENTS' },
                            { label: 'Settings', view: 'SETTINGS' }
                        ].map(item => (
                             <button 
                                key={item.label}
                                onClick={() => setCurrentView(item.view as DashboardView)}
                                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all group ${
                                    currentView === item.view
                                    ? 'bg-indigo-50 dark:bg-slate-800 text-primary dark:text-indigo-400 font-bold' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                                }`}
                            >
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                                {isSidebarCollapsed && <span className="material-symbols-outlined text-xl">more_horiz</span>}
                            </button>
                        ))}
                    </>
                )}

            </nav>
         </div>
         
         <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <div className="flex justify-center mb-2">
                <button onClick={toggleSidebar} className="p-1.5 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">{isSidebarCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}</span>
                </button>
            </div>
             <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" className="h-full w-full object-cover" />
                </div>
                {!isSidebarCollapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Alex Admin</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Manager</p>
                    </div>
                )}
                {!isSidebarCollapsed && <button onClick={onLogout} className="ml-auto text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">logout</span></button>}
             </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

        {/* Global Header (Title & Add Button) - Only show for top-level views not handled elsewhere */}
        {currentView !== 'PROJECT_DETAILS' && currentView !== 'HOME' && currentView !== 'SETTINGS' && !currentView.startsWith('STAFF_') && !PLACEHOLDER_CONTENT[currentView] && (
            <header className="px-8 pt-8 pb-4 flex items-start justify-between relative z-10">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {currentView === 'PROMOTIONS' ? 'All Promotions' : 
                     currentView === 'ITEMS' ? 'Items & menus' : 
                     currentView === 'DESIGN_EXTRACTOR' ? 'Design Extractor' :
                     currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_', ' ')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {currentView === 'PROMOTIONS' ? 'Manage your active marketing campaigns.' : 
                     currentView === 'ITEMS' ? 'Manage your product catalog and menu items.' : 
                     currentView === 'DESIGN_EXTRACTOR' ? 'Customize your online store branding and appearance.' :
                     'Manage this section of your business.'}
                </p>
            </div>
            {(currentView === 'PROMOTIONS' || currentView === 'ITEMS' || currentView === 'DESIGN_EXTRACTOR') && (
                <button onClick={handleNewItemClick} className="btn gap-2">
                    <span className="material-symbols-outlined text-lg">add</span>
                    {currentView === 'PROMOTIONS' ? 'New Campaign' : (currentView === 'ITEMS' ? 'New Item' : 'New Project')}
                </button>
            )}
            </header>
        )}

        {/* Content Rendered Here */}
        {renderMainContent()}

        {/* NEW PROJECT MODAL */}
        {isNewProjectModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNewProjectModalOpen(false)}></div>
                
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Design Project</h3>
                        <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        
                        {/* UPLOAD AREA */}
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${isDragging ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleFileDrop}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                multiple 
                                onChange={handleFileSelect}
                            />
                            
                            {newProjectForm.files.length === 0 ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-primary dark:text-indigo-400">
                                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload & Analyze</h4>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                                        Drag and drop your brand guideline PDFs or images here. 
                                        We'll extract colors, fonts, and spacing automatically.
                                    </p>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn"
                                    >
                                        Select Files
                                    </button>
                                </>
                            ) : (
                                <div className="w-full">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Selected Files ({newProjectForm.files.length})</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {newProjectForm.files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-3 truncate">
                                                    <span className="material-symbols-outlined text-primary">description</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                                </div>
                                                <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-6 text-sm font-bold text-primary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        + Add more files
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* INPUT FIELDS */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Project Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="e.g. Summer Menu Redesign"
                                    value={newProjectForm.name}
                                    onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none h-24"
                                    placeholder="Briefly describe the project goals..."
                                    value={newProjectForm.description}
                                    onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 bg-slate-50 dark:bg-slate-900/50">
                         <button 
                            onClick={handleLoadDemo}
                            className="text-sm font-bold text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-lg">science</span>
                            Load Demo Data
                        </button>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsNewProjectModalOpen(false)}
                                className="px-6 py-2.5 rounded-full border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateProject}
                                className="btn"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};