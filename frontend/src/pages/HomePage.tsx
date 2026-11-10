import React, { useState, useEffect } from 'react';
import { CustomerHeader } from '../components/layout/CustomerHeader';
import { CustomerFooter } from '../components/layout/CustomerFooter';
import { MobileBottomNavigation, MobileTab } from '../components/layout/MobileBottomNavigation';
import { ProductCard, PackSizeOption } from '../components/product/ProductCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import {
  CheckCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
} from '../components/common/Icons';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToastStore } from '../stores/useToastStore';
import { useCartStore } from '../stores/useCartStore';
import { productService } from '../services/productService';
import {
  logoImg,
  groundnutBottleImg,
  sesameBottleImg,
  coconutBottleImg,
  groundnutLifestyleImg,
  sesameLifestyleImg,
  coconutLifestyleImg,
} from '../assets';

export const HomePage: React.FC = () => {
  const { language } = useLanguageStore();
  const { addToast } = useToastStore();
  const cartCount = useCartStore((state) => state.getItemCount());
  const addItem = useCartStore((state) => state.addItem);

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [productTypeFilter, setProductTypeFilter] = useState<'retail' | 'bulk'>('retail');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [wholesaleModalOpen, setWholesaleModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  useEffect(() => {
    productService.getAllProducts().then((prods) => {
      if (prods && prods.length > 0) {
        setCatalogProducts(prods);
      }
    });
  }, []);

  // Wholesale Form State
  const [wholesaleForm, setWholesaleForm] = useState({
    name: '',
    phone: '',
    oilType: 'groundnut',
    estimatedQuantity: '15L (1 Tin)',
    pincode: '',
  });

  const isTamil = language === 'ta';

  // Dynamic Pack Size Configurations synced with live productService
  const gnProduct = catalogProducts.find((p) => p.category === 'groundnut');
  const groundnutPacks: PackSizeOption[] = gnProduct?.variants
    ? gnProduct.variants.map((v: any) => ({
        id: v.id,
        label: v.volume,
        tamilLabel: v.volume === '500 ml' ? '500 மி.லி' : v.volume === '1 Litre' ? '1 லிட்டர்' : '5 லிட்டர்',
        price: v.price,
        originalPrice: v.mrp,
      }))
    : [
        { id: 'gn-500ml', label: '500 ml', tamilLabel: '500 மி.லி', price: 249, originalPrice: 249 },
        { id: 'gn-1000ml', label: '1 L', tamilLabel: '1 லிட்டர்', price: 479, originalPrice: 479 },
        { id: 'gn-5000ml', label: '5 L Can', tamilLabel: '5 லிட்டர் கேன்', price: 2290, originalPrice: 2290 },
      ];

  const sesProduct = catalogProducts.find((p) => p.category === 'sesame');
  const sesamePacks: PackSizeOption[] = sesProduct?.variants
    ? sesProduct.variants.map((v: any) => ({
        id: v.id,
        label: v.volume,
        tamilLabel: v.volume === '500 ml' ? '500 மி.லி' : v.volume === '1 Litre' ? '1 லிட்டர்' : '5 லிட்டர்',
        price: v.price,
        originalPrice: v.mrp,
      }))
    : [
        { id: 'ses-500ml', label: '500 ml', tamilLabel: '500 மி.லி', price: 249, originalPrice: 249 },
        { id: 'ses-1000ml', label: '1 L', tamilLabel: '1 லிட்டர்', price: 489, originalPrice: 489 },
        { id: 'ses-5000ml', label: '5 L Can', tamilLabel: '5 லிட்டர் கேன்', price: 2350, originalPrice: 2350 },
      ];

  const cocProduct = catalogProducts.find((p) => p.category === 'coconut');
  const coconutPacks: PackSizeOption[] = cocProduct?.variants
    ? cocProduct.variants.map((v: any) => ({
        id: v.id,
        label: v.volume,
        tamilLabel: v.volume === '500 ml' ? '500 மி.லி' : v.volume === '1 Litre' ? '1 லிட்டர்' : '5 லிட்டர்',
        price: v.price,
        originalPrice: v.mrp,
      }))
    : [
        { id: 'coc-500ml', label: '500 ml', tamilLabel: '500 மி.லி', price: 279, originalPrice: 279 },
        { id: 'coc-1000ml', label: '1 L', tamilLabel: '1 லிட்டர்', price: 539, originalPrice: 539 },
        { id: 'coc-5000ml', label: '5 L Can', tamilLabel: '5 லிட்டர் கேன்', price: 2590, originalPrice: 2590 },
      ];

  // Handler for adding to cart connected directly to useCartStore
  const handleAddToCart = (productType: 'groundnut' | 'sesame' | 'coconut', packSizeId: string, qty: number = 1) => {
    let itemData: any = null;
    if (productType === 'groundnut') {
      const pack = groundnutPacks.find((p) => p.id === packSizeId) || groundnutPacks[0];
      itemData = {
        productId: 'prod-groundnut',
        variantId: pack.id,
        slug: 'traditional-groundnut-oil',
        name: 'Traditional Groundnut Oil',
        nameTa: 'மரச்செக்கு கடலை எண்ணெய்',
        category: 'groundnut' as const,
        volume: pack.label,
        price: pack.price,
        mrp: pack.originalPrice,
        image: groundnutBottleImg,
        stock: 120,
        quantity: qty,
      };
    } else if (productType === 'sesame') {
      const pack = sesamePacks.find((p) => p.id === packSizeId) || sesamePacks[0];
      itemData = {
        productId: 'prod-sesame',
        variantId: pack.id,
        slug: 'pure-wood-pressed-sesame-oil',
        name: 'Pure Wood-Pressed Sesame Oil',
        nameTa: 'மரச்செக்கு நல்லெண்ணெய்',
        category: 'sesame' as const,
        volume: pack.label,
        price: pack.price,
        mrp: pack.originalPrice,
        image: sesameBottleImg,
        stock: 95,
        quantity: qty,
      };
    } else {
      const pack = coconutPacks.find((p) => p.id === packSizeId) || coconutPacks[0];
      itemData = {
        productId: 'prod-coconut',
        variantId: pack.id,
        slug: 'unrefined-cold-pressed-coconut-oil',
        name: 'Unrefined Cold-Pressed Coconut Oil',
        nameTa: 'மரச்செக்கு தேங்காய் எண்ணெய்',
        category: 'coconut' as const,
        volume: pack.label,
        price: pack.price,
        mrp: pack.originalPrice,
        image: coconutBottleImg,
        stock: 80,
        quantity: qty,
      };
    }

    addItem(itemData);

    addToast({
      type: 'success',
      title: isTamil ? 'கூடையில் சேர்க்கப்பட்டது' : 'Added to Harvest Basket',
      message: isTamil
        ? `${itemData.nameTa} (${itemData.volume}) உங்கள் கூடையில் சேர்க்கப்பட்டது.`
        : `${itemData.name} (${itemData.volume}) has been added to your basket.`,
      duration: 3500,
    });
  };

  // Handler for wholesale enquiry submission
  const handleWholesaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesaleForm.name || !wholesaleForm.phone) {
      addToast({
        type: 'warning',
        title: isTamil ? 'தேவையான விவரங்கள்' : 'Required Fields',
        message: isTamil
          ? 'தயவுசெய்து உங்கள் பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter your name and phone number.',
      });
      return;
    }

    setWholesaleModalOpen(false);
    addToast({
      type: 'success',
      title: isTamil ? 'விசாரணை அனுப்பப்பட்டது' : 'Inquiry Submitted',
      message: isTamil
        ? 'உங்கள் மொத்த விற்பனை கோரிக்கை பெறப்பட்டது. எங்கள் ஆலை பிரதிநிதி உங்களை விரைவில் தொடர்பு கொள்வார்.'
        : 'Your wholesale enquiry has been received. Our Tenkasi mill desk will contact you promptly.',
      duration: 5000,
    });
    setWholesaleForm({
      name: '',
      phone: '',
      oilType: 'groundnut',
      estimatedQuantity: '15L (1 Tin)',
      pincode: '',
    });
  };

  // FAQ List derived strictly from client specs & Stitch design
  const faqItems = [
    {
      question: isTamil ? 'என்னென்ன தயாரிப்புகள் கிடைக்கின்றன?' : 'What products are available?',
      answer: isTamil
        ? 'நாங்கள் 100% தூய மரச்செக்கு கடலை எண்ணெய் (Groundnut Oil), பாரம்பரிய பனங்கருப்பட்டி சேர்த்த நல்லெண்ணெய் (Sesame Oil), மற்றும் இயற்கையான சூரிய ஒளியில் உலர்த்திய கொப்பரை தேங்காய் எண்ணெய் (Coconut Oil) தயாரிக்கிறோம். அனைத்தும் எந்தவித ரசாயனமும் இல்லாமல் பாரம்பரிய முறையில் பிழியப்படுபவை.'
        : 'We currently produce 100% pure Marachekku Groundnut Oil (கடலை எண்ணெய்), Traditional Palm-Jaggery Infused Sesame Oil (நல்லெண்ணெய்), and Raw Copra Coconut Oil (தேங்காய் எண்ணெய்). All oils are naturally cold-pressed without sulphur or heating chemicals.',
    },
    {
      question: isTamil ? 'என்னென்ன அளவுகளில் கிடைக்கின்றன?' : 'What pack sizes are available?',
      answer: isTamil
        ? 'வீட்டு உபயோகத்திற்கு 500 மி.லி பாட்டில்கள், 1 லிட்டர் பாட்டில்கள் மற்றும் 5 லிட்டர் கேன்கள் கிடைக்கின்றன. உணவகங்கள் மற்றும் இனிப்பகங்களுக்கு 15 லிட்டர் உணவுத் தர டின் மற்றும் 200 லிட்டர் பீப்பாய்கள் மொத்த விற்பனையில் கிடைக்கின்றன.'
        : 'For retail household purchase, we pack in 500 ml bottles, 1 Litre bottles, and 5 Litre culinary cans. For commercial food businesses, restaurants, and sweet makers, we provide standard 15-Litre food-grade tins and 200-Litre barrels.',
    },
    {
      question: isTamil ? 'என் பகுதிக்கு டெலிவரி கிடைக்குமா?' : 'Do you deliver to my location?',
      answer: isTamil
        ? 'ஆம், தமிழ்நாடு, பாண்டிச்சேரி, கேரளா, கர்நாடகா மற்றும் ஆந்திரா முழுவதும் நேரடி கூரியர் டெலிவரி வழங்குகிறோம். தமிழ்நாட்டிற்குள் ₹799க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவச டெலிவரி வழங்கப்படுகிறது.'
        : 'Yes, we provide direct door-to-door courier delivery across Tamil Nadu, Pondicherry, Kerala, Karnataka, and Andhra Pradesh. Orders above ₹799 qualify for complimentary free shipping across all Tamil Nadu postal codes.',
    },
    {
      question: isTamil ? 'என்னென்ன கட்டண முறைகள் உள்ளன?' : 'What payment methods are accepted?',
      answer: isTamil
        ? 'UPI (GPay, PhonePe, Paytm), Visa/Mastercard/RuPay கார்டுகள், நெட் பேங்கிங் மற்றும் தகுதியான பின்கோடுகளுக்கு கேஷ் ஆன் டெலிவரி (COD) வசதி உண்டு.'
        : 'We accept all Indian UPI providers (GPay, PhonePe, Paytm), Visa/Mastercard/RuPay debit and credit cards, Net Banking across all major banks, and Cash on Delivery (COD) for eligible pincodes.',
    },
    {
      question: isTamil ? 'மொத்தமாக (Wholesale) ஆர்டர் செய்ய முடியுமா?' : 'Can I place wholesale orders?',
      answer: isTamil
        ? 'நிச்சயமாக. தென்காசியில் உள்ள எங்கள் சொந்த ஆலை மூலம் வணிக நிறுவனங்கள், உணவகங்கள் மற்றும் இயற்கை அங்காடி விற்பனையாளர்களுக்கு நேரடி ஆலை விலையில் 15L டின்கள் தொடர்ந்து வழங்குகிறோம்.'
        : 'Absolutely. We operate our own mechanized wood-churning infrastructure in Tenkasi, enabling predictable volume supply for restaurants, organic retail shops, and caterers at verified mill-gate pricing. Submit our Wholesale form for quick quote turnaround.',
    },
    {
      question: isTamil ? 'வாடிக்கையாளர் சேவையை எவ்வாறு தொடர்பு கொள்வது?' : 'How can I contact customer support?',
      answer: isTamil
        ? 'எங்கள் ஆலை உதவி மையத்தை +91 9994072837 என்ற எண்ணில் திங்கள் முதல் சனி வரை காலை 8:00 மணி முதல் இரவு 7:30 மணி வரை தொடர்பு கொள்ளலாம். மேலும் care@ssknaturalgold.in முகவரிக்கு மின்னஞ்சல் அனுப்பலாம்.'
        : 'You can reach our dedicated mill helpdesk by calling +91 9994072837 between 8:00 AM and 7:30 PM (Mon-Sat). You may also email care@ssknaturalgold.in for immediate resolution.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col selection:bg-brand-amber selection:text-white">
      {/* 1. Master Responsive Header with Announcement Bar */}
      <CustomerHeader
        cartItemCount={cartCount}
        onCartClick={() => {
          addToast({
            type: 'info',
            title: isTamil ? 'கூடை விவரம்' : 'Cart Summary',
            message: isTamil
              ? `உங்கள் கூடையில் ${cartCount} பொருட்கள் உள்ளன.`
              : `You have ${cartCount} items in your shopping cart.`,
          });
        }}
        onSearch={(query: string) => {
          addToast({
            type: 'info',
            title: isTamil ? 'தேடல்' : 'Search',
            message: isTamil
              ? `"${query}" க்கான முடிவுகள் விரைவில்...`
              : `Showing results for "${query}"...`,
          });
        }}
      />

      <main className="flex-1 w-full flex flex-col">
        {/* 2. Secondary Heritage Facility & Broadcast Notice (from Stitch desktop & mobile specs) */}
        <div className="w-full bg-surface-container-low border-b border-surface-container py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-page mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm font-semibold tracking-wide">
                FSSAI 22426293000431 [Demo]
              </span>
              <span className="text-on-surface font-medium">
                {isTamil
                  ? 'தென்காசி ஆலை தயாரிப்பு • பாரம்பரிய மரச்செக்கு தயாரிப்பு முறை'
                  : 'Tenkasi Extraction Facility • Artisanal Cold Extraction Batch #TG-2025/04'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-primary font-semibold text-[11px] sm:text-xs">
              <span className="flex items-center gap-1">
                <TruckIcon size={14} className="text-secondary" />
                {isTamil ? '24 மணி நேரத்தில் அனுப்புகை' : 'Dispatch within 24h across Tamil Nadu'}
              </span>
              <span className="text-slate-300 hidden md:inline">|</span>
              <a
                href="#wholesale-section"
                className="text-secondary hover:underline hidden md:inline"
              >
                {isTamil ? '15L மொத்த டின்கள் கிடைக்கும்' : 'Bulk 15L & 200L Supply Available'}
              </a>
            </div>
          </div>
        </div>

        {/* 3. Hero Section: Split 2-Column Desktop Grid / Fluid Mobile Stack */}
        <section className="w-full bg-surface relative overflow-hidden py-8 sm:py-12 lg:py-16 border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Authentic Copy, Regional Tag & Action CTAs */}
              <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 text-center lg:text-left items-center lg:items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold tracking-wide shadow-xs">
                  <span className="text-sm">🌿</span>
                  <span>
                    {isTamil
                      ? 'பாரம்பரிய சமையல் எண்ணெய் | 100% மரச்செக்கு'
                      : 'பாரம்பரிய சமையல் எண்ணெய் | Traditional Cold-Pressed Pure Oils'}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight leading-tight">
                    {isTamil
                      ? 'உங்கள் அன்றாட சமையலுக்கு ஆரோக்கியமான பாரம்பரிய எண்ணெய்'
                      : 'Natural Goodness for Your Everyday Cooking'}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant leading-relaxed max-w-xl">
                    {isTamil
                      ? 'தென்காசியில் பாரம்பரிய வாகை மரச்செக்கு முறையில் பிழியப்பட்ட SSK நேச்சுரல் கோல்ட் கடலை, நல்லெண்ணெய் மற்றும் தேங்காய் எண்ணெய்கள். தூய்மையானது, கலப்படமற்றது, சத்துக்கள் நிறைந்தது.'
                      : 'Explore SSK Natural Gold Groundnut, Sesame and Coconut Oils extracted from traditional wooden cold-press (மரச்செக்கு) methods in Tenkasi. Pure, unrefined, and bottled at peak freshness.'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
                  <a
                    href="#popular-products"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary text-on-secondary font-bold text-sm sm:text-base shadow-md hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <span>{isTamil ? 'இப்போதே வாங்குங்கள்' : 'Shop Now'}</span>
                    <ShoppingBagIcon size={18} />
                  </a>
                  <a
                    href="#wholesale-section"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface-container-low text-primary font-bold text-sm sm:text-base border border-surface-border hover:bg-surface-container transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <span>{isTamil ? 'மொத்த விற்பனை B2B' : 'Explore Wholesale'}</span>
                    <span className="text-sm">📦</span>
                  </a>
                </div>

                {/* 3 Trust Metrics */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-surface-container-high w-full">
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-bold text-lg sm:text-2xl text-primary font-mono">100%</span>
                    <span className="text-[11px] sm:text-xs text-on-surface-variant uppercase font-semibold">
                      {isTamil ? 'முதல் தர விதைகள்' : 'Single Origin Seeds'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-bold text-lg sm:text-2xl text-primary font-mono">0%</span>
                    <span className="text-[11px] sm:text-xs text-on-surface-variant uppercase font-semibold">
                      {isTamil ? 'ரசாயனம் அற்றது' : 'Refining & Sulphur'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-bold text-lg sm:text-2xl text-primary">Vaagai</span>
                    <span className="text-[11px] sm:text-xs text-on-surface-variant uppercase font-semibold">
                      {isTamil ? 'வாகை மரச்செக்கு' : 'Wood Churn Mortar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Showcase Trio (Preserving Packaging Dimensions) */}
              <div className="lg:col-span-6 relative w-full">
                <div className="bg-surface-container-low rounded-2xl p-4 sm:p-6 shadow-card border border-surface-border">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
                    {/* Bottle 1: Groundnut */}
                    <div className="flex flex-col items-center bg-white rounded-xl p-2 sm:p-3 shadow-xs border border-surface-border transition-transform hover:-translate-y-1">
                      <div className="w-full aspect-[2/3] max-h-48 sm:max-h-64 overflow-hidden rounded-lg bg-surface-subtle flex items-center justify-center p-1">
                        <img
                          src={groundnutBottleImg}
                          alt="SSK Groundnut Oil Bottle 500ml"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="block font-bold text-xs sm:text-sm text-primary leading-tight truncate">
                          {isTamil ? 'கடலை' : 'Groundnut'}
                        </span>
                        <span className="block text-[10px] text-on-surface-variant font-tamil">
                          கடலை எண்ணெய்
                        </span>
                      </div>
                    </div>

                    {/* Bottle 2: Sesame (Center Elevated with Popular Badge) */}
                    <div className="flex flex-col items-center bg-white rounded-xl p-2 sm:p-3 shadow-elevated border border-brand-amber/30 transition-transform hover:-translate-y-1 transform -translate-y-2 sm:-translate-y-3">
                      <div className="w-full aspect-[2/3] max-h-52 sm:max-h-72 overflow-hidden rounded-lg bg-surface-subtle flex items-center justify-center p-1">
                        <img
                          src={sesameBottleImg}
                          alt="SSK Sesame Oil Bottle 500ml"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="inline-flex px-1.5 py-0.5 mb-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold text-[9px] sm:text-[10px]">
                          {isTamil ? 'முன்னணி' : 'Popular'}
                        </span>
                        <span className="block font-bold text-xs sm:text-sm text-primary leading-tight truncate">
                          {isTamil ? 'நல்லெண்ணெய்' : 'Sesame'}
                        </span>
                        <span className="block text-[10px] text-on-surface-variant font-tamil">
                          செக்கு நல்லெண்ணெய்
                        </span>
                      </div>
                    </div>

                    {/* Bottle 3: Coconut */}
                    <div className="flex flex-col items-center bg-white rounded-xl p-2 sm:p-3 shadow-xs border border-surface-border transition-transform hover:-translate-y-1">
                      <div className="w-full aspect-[2/3] max-h-48 sm:max-h-64 overflow-hidden rounded-lg bg-surface-subtle flex items-center justify-center p-1">
                        <img
                          src={coconutBottleImg}
                          alt="SSK Coconut Oil Bottle 500ml"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="block font-bold text-xs sm:text-sm text-primary leading-tight truncate">
                          {isTamil ? 'தேங்காய்' : 'Coconut'}
                        </span>
                        <span className="block text-[10px] text-on-surface-variant font-tamil">
                          தேங்காய் எண்ணெய்
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Certified Purity Tag */}
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <CheckCircleIcon size={16} className="text-brand-green" />
                      {isTamil ? 'ரசாயனம் அற்ற இயற்கை வடிகட்டுதல்' : 'Pure cold-filtered without chemical processing'}
                    </span>
                    <span className="text-primary font-bold hidden xs:inline">500ml & 1L Formats</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Shop by Extraction Category (3-Column Desktop Grid / 1-Column Mobile) */}
        <section className="w-full py-12 sm:py-16 bg-surface-container-low border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
                {isTamil ? 'பிரிவுகள்' : 'Category Catalog'}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                {isTamil ? 'எண்ணெய் வகைகள்' : 'Shop by Extraction Category'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-2 leading-relaxed">
                {isTamil
                  ? 'முதல் தர எண்ணெய் வித்துக்களை நேரடியாக விவசாயிகளிடம் கொள்முதல் செய்து, ஊட்டச்சத்துக்கள் குறையாமல் பாரம்பரிய மரச்செக்கில் பிழிந்தெடுக்கப்படுகிறது.'
                  : 'Single-variety raw crops harvested at source, cold-crushed with traditional palm jaggery where applicable, retaining complete botanical nutrition.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Category 1: Groundnut */}
              <div
                id="category-groundnut"
                className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-card border border-surface-border hover:shadow-elevated transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-surface-subtle overflow-hidden">
                  <img
                    src={groundnutLifestyleImg}
                    alt="Groundnut Harvest & Extraction"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="slate" pill size="sm">
                      {isTamil ? 'மரச்செக்கு கடலை' : 'Groundnut Oil'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <h3 className="text-lg sm:text-xl font-bold text-primary font-tamil">
                        கடலை எண்ணெய்
                      </h3>
                      <span className="text-xs text-on-surface-variant italic">Arachis hypogaea</span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {isTamil
                        ? 'சுத்தமான வறண்ட கடலை பருப்புகளைக் கொண்டு தயாரிக்கப்படுகிறது. அதிக ஸ்மோக் பாயிண்ட் கொண்டது, அன்றாட சமையல், வறுவல் மற்றும் பலகாரங்களுக்கு மிகச் சிறந்தது.'
                        : 'Extracted from sun-dried Saurashtra & Tamil Nadu groundnut kernels. High smoke point, rich nutty aroma, ideal for everyday sautéing, deep frying, and traditional tiffin items.'}
                    </p>
                  </div>
                  <a
                    href="#popular-products"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-amber-700 transition-colors pt-3 border-t border-slate-100"
                  >
                    <span>{isTamil ? 'கடலை எண்ணெய் பார்க்க' : 'Explore Groundnut Oil'}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Category 2: Sesame */}
              <div
                id="category-sesame"
                className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-card border border-surface-border hover:shadow-elevated transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-surface-subtle overflow-hidden">
                  <img
                    src={sesameLifestyleImg}
                    alt="Sesame Seeds Harvest"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="amber" pill size="sm">
                      {isTamil ? 'பனங்கருப்பட்டி நல்லெண்ணெய்' : 'Sesame Oil (Gingelly)'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <h3 className="text-lg sm:text-xl font-bold text-primary font-tamil">
                        நல்லெண்ணெய்
                      </h3>
                      <span className="text-xs text-on-surface-variant italic">Sesamum indicum</span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {isTamil
                        ? 'தரமான கருப்பு எள்ளுடன் பாரம்பரிய பனங்கருப்பட்டி சேர்த்து கசப்புத்தன்மை நீக்கி பக்குவமாக பிழியப்படுகிறது. காரக்குழம்பு, தோசை மற்றும் நல்லெண்ணெய் குளியலுக்கு உகந்தது.'
                        : 'Crafted using select black sesame seeds blended with ancestral palm jaggery (கருப்பட்டி) to moderate bitterness. Authentic flavor for gravies, dosai, and medicinal oil pulling.'}
                    </p>
                  </div>
                  <a
                    href="#popular-products"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-amber-700 transition-colors pt-3 border-t border-slate-100"
                  >
                    <span>{isTamil ? 'நல்லெண்ணெய் பார்க்க' : 'Explore Sesame Oil'}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Category 3: Coconut */}
              <div
                id="category-coconut"
                className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-card border border-surface-border hover:shadow-elevated transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-surface-subtle overflow-hidden">
                  <img
                    src={coconutLifestyleImg}
                    alt="Coconut Grove Harvest"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="green" pill size="sm">
                      {isTamil ? 'சுத்தமான கொப்பரை' : 'Coconut Oil'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <h3 className="text-lg sm:text-xl font-bold text-primary font-tamil">
                        தேங்காய் எண்ணெய்
                      </h3>
                      <span className="text-xs text-on-surface-variant italic">Cocos nucifera</span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {isTamil
                        ? 'இயற்கை வெயிலில் உலர்த்தப்பட்ட கந்தகம் (Sulphur) சேர்க்காத பொள்ளாச்சி கொப்பரைகளில் இருந்து எடுக்கப்படுகிறது. சமையல் மற்றும் தலைமுடி பராமரிப்புக்கு உகந்தது.'
                        : 'Cold-pressed from naturally sun-dried sulphur-free copra sourced from Pollachi groves. Unbleached, sweet-scented, suitable for both coastal culinary recipes and wholesome hair care.'}
                    </p>
                  </div>
                  <a
                    href="#popular-products"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-amber-700 transition-colors pt-3 border-t border-slate-100"
                  >
                    <span>{isTamil ? 'தேங்காய் எண்ணெய் பார்க்க' : 'Explore Coconut Oil'}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Popular Products Section with Retail / Bulk Toggle */}
        <section id="popular-products" className="w-full py-12 sm:py-16 bg-surface border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
                  {isTamil ? 'வாரம் தோறும் புதிய பேக்கிங்' : 'Bottled Fresh Weekly'}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                  {isTamil ? 'எங்கள் முன்னணி தயாரிப்புகள்' : 'Our Popular Products'}
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
                  {isTamil
                    ? 'தென்காசி ஆலையிலிருந்து நேரடியாக பேக் செய்யப்படும் பரிசோதிக்கப்பட்ட சமையல் எண்ணெய்கள்.'
                    : 'Pure, laboratory-tested culinary oils for your kitchen. Freshly bottled at our Tenkasi facility.'}
                </p>
              </div>

              {/* Retail / Bulk Segmented Control */}
              <div className="inline-flex items-center p-1 bg-surface-container-low rounded-xl border border-surface-border shrink-0 self-start md:self-auto shadow-xs">
                <button
                  type="button"
                  onClick={() => setProductTypeFilter('retail')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productTypeFilter === 'retail'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {isTamil ? 'சில்லறை பேக்குகள் (500ml / 1L)' : 'Retail Packs (500ml / 1L)'}
                </button>
                <button
                  type="button"
                  onClick={() => setProductTypeFilter('bulk')}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productTypeFilter === 'bulk'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {isTamil ? 'மொத்த டின்கள் (15L Tin)' : 'Bulk Tins (15L)'}
                </button>
              </div>
            </div>

            {/* View A: Retail Product Cards */}
            {productTypeFilter === 'retail' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* Product 1: Groundnut */}
                <ProductCard
                  id="ssk-groundnut-oil"
                  title="Traditional Groundnut Oil"
                  tamilTitle="மரச்செக்கு கடலை எண்ணெய்"
                  subtitle="Cold Pressed • Tenkasi Mill"
                  batchId="Batch #TG-2025/04"
                  description={
                    isTamil
                      ? 'அறை வெப்பநிலையில் மெதுவாக பிழியப்பட்டு வைட்டமின் E மற்றும் இயற்கை சத்துக்கள் மாறாமல் பாதுகாக்கப்படுகிறது.'
                      : 'Cold-pressed at room temperature to retain natural vitamin E and heart-healthy phytosterols.'
                  }
                  imageUrl={groundnutBottleImg}
                  badgeText={isTamil ? 'மரச்செக்கு' : 'Marachekku'}
                  badgeVariant="green"
                  packSizes={groundnutPacks}
                  onAddToCart={(_pId, pSizeId, qty) => {
                    handleAddToCart('groundnut', pSizeId, qty);
                  }}
                />

                {/* Product 2: Sesame */}
                <ProductCard
                  id="ssk-sesame-oil"
                  title="Pure Wood-Pressed Sesame Oil"
                  tamilTitle="செக்கு நல்லெண்ணெய்"
                  subtitle="Palm Jaggery • Baudouin Negative"
                  batchId="Batch #TS-2025/09"
                  description={
                    isTamil
                      ? 'தூய கருப்பு எள்ளுடன் பாரம்பரிய பனங்கருப்பட்டி சேர்த்து பிழியப்படுகிறது. சிறந்த சுவை மற்றும் நறுமணம் கொண்டது.'
                      : 'Naturally enriched with authentic palm jaggery. Renowned for wholesome culinary depth and Ayurvedic rituals.'
                  }
                  imageUrl={sesameBottleImg}
                  badgeText={isTamil ? 'பனங்கருப்பட்டி' : 'Palm Jaggery Blend'}
                  badgeVariant="amber"
                  packSizes={sesamePacks}
                  onAddToCart={(_pId, pSizeId, qty) => {
                    handleAddToCart('sesame', pSizeId, qty);
                  }}
                />

                {/* Product 3: Coconut */}
                <ProductCard
                  id="ssk-coconut-oil"
                  title="Unrefined Cold-Pressed Coconut Oil"
                  tamilTitle="செக்கு தேங்காய் எண்ணெய்"
                  subtitle="Sun-Dried Copra • 100% Edible"
                  batchId="Batch #TC-2025/02"
                  description={
                    isTamil
                      ? 'கந்தகம் சேர்க்கப்படாத சுத்தமான கொப்பரைகளில் இருந்து எடுக்கப்படும் தூய வர்ஜின் தேங்காய் எண்ணெய்.'
                      : 'Pure raw virgin copra extract, crystal clear when warm and rich in healthy lauric acid.'
                  }
                  imageUrl={coconutBottleImg}
                  badgeText={isTamil ? 'சுத்தமான கொப்பரை' : 'Sun-Dried Copra'}
                  badgeVariant="slate"
                  packSizes={coconutPacks}
                  onAddToCart={(_pId, pSizeId, qty) => {
                    handleAddToCart('coconut', pSizeId, qty);
                  }}
                />
              </div>
            ) : (
              /* View B: Commercial Bulk 15L Tins Showcase */
              <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-surface-border">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-brand-slate text-amber-400 flex items-center justify-center text-2xl shadow-sm">
                    📦
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary">
                    {isTamil ? 'உணவகங்கள் & வணிக நிறுவனங்களுக்கு 15 லிட்டர் மொத்த டின்கள்' : 'Commercial Food-Grade 15-Litre Tins (B2B Procurement)'}
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {isTamil
                      ? 'ஹோட்டல்கள், இனிப்பகங்கள், கேட்டரிங் நிறுவனங்கள் மற்றும் மளிகை அங்காடிகளுக்கு 15 லிட்டர் டின்கள் மற்றும் 200 லிட்டர் பீப்பாய்களில் நேரடி ஆலை விலையில் வழங்குகிறோம். அதிகாரப்பூர்வ GST இன்வாய்ஸ் மற்றும் NABL ஆய்வக பரிசோதனை சான்றிதழ் வழங்கப்படும்.'
                      : 'We supply certified 15-Litre food-grade tins and 200-Litre barrels directly to restaurants, commercial kitchens, caterers, and retail distributors across South India with official GST tax invoices and transport logistics.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      variant="amber"
                      size="md"
                      onClick={() => setWholesaleModalOpen(true)}
                    >
                      {isTamil ? 'மொத்த விலைப்பட்டியல் கோருக' : 'Request Commercial Rate Card'}
                    </Button>
                    <a
                      href="tel:+919994072837"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-border bg-white text-primary text-xs font-bold hover:bg-slate-50 transition"
                    >
                      <span>📞 +91 9994072837</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Brand Introduction: 'Discover SSK Natural Gold' Split Banner */}
        <section id="about-mill" className="w-full py-12 sm:py-16 bg-surface-container-low border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 shadow-card border border-surface-border">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Official Circular Seal Graphic */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-tr from-brand-amber to-amber-200 flex items-center justify-center shadow-lg">
                    <div className="w-full h-full rounded-full bg-brand-slate p-3 flex flex-col items-center justify-center text-center text-white">
                      <img
                        src={logoImg}
                        alt="SSK Natural Gold Official Seal"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-1 drop-shadow-sm"
                      />
                      <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                        TENKASI • HERITAGE
                      </span>
                      <span className="text-[9px] text-emerald-300 font-medium">ESTD. TRADITION</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Column */}
                <div className="lg:col-span-8 flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
                  <div className="inline-flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-widest">
                    <CheckCircleIcon size={16} />
                    <span>{isTamil ? 'தூய்மை • பாரம்பரியம் • நம்பிக்கை' : 'PURE • AUTHENTIC • WHOLESOME'}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                    {isTamil ? 'SSK நேச்சுரல் கோல்ட் பாரம்பரியம்' : 'Discover SSK Natural Gold'}
                  </h2>

                  <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant leading-relaxed">
                    {isTamil
                      ? 'இந்திய குடும்பங்களுக்கு கலப்படமற்ற, ஊட்டச்சத்துக்கள் நிறைந்த தூய சமையல் எண்ணெய்களை வழங்குவதே எங்கள் நோக்கம். தென்காசி மண்ணின் பாரம்பரிய வாகை மரச்செக்கு முறையில் எவ்வித வேதியியல் சேர்க்கையும் இன்றி தயாரித்து சுத்தமாக பாட்டில்களில் அடைக்கிறோம்.'
                      : 'Dedicated to providing pure, unadulterated edible oils for Indian households. Sourced and processed with strict adherence to natural traditions and uncompromising quality standards at our Tenkasi mill facility.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 w-full text-left">
                    <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-border">
                      <span className="text-xl shrink-0 mt-0.5">🌳</span>
                      <div>
                        <h4 className="font-bold text-sm text-primary">
                          {isTamil ? 'வாகை மரச்செக்கு' : 'Vaagai Marachekku'}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {isTamil
                            ? 'குறைந்த உராய்வு வெப்பம் (40°Cக்கு கீழ்) கொண்டு இயற்கை ஊட்டச்சத்துக்களை பாதுகாக்கிறது.'
                            : 'Naturally insulated wood pestles ensure low-friction heat under 40°C.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-border">
                      <span className="text-xl shrink-0 mt-0.5">🧪</span>
                      <div>
                        <h4 className="font-bold text-sm text-primary">
                          {isTamil ? 'ரசாயனம் அற்றது' : 'Zero Chemical Bleach'}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {isTamil
                            ? 'காஸ்டிக் சோடா அல்லது ஹெக்ஸேன் போன்ற ரசாயன சுத்திகரிப்பு எதுவும் செய்யப்படுவதில்லை.'
                            : 'Never treated with caustic soda, artificial argemone oil, or hexane solvents.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        const target = document.getElementById('faq-section');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {isTamil ? 'ஆலை விவரங்கள் & FAQ' : 'Learn More About Our Mill'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Quality & Verified Product Information (4-Column Desktop / 2x2 Mobile Grid) */}
        <section className="w-full py-12 sm:py-16 bg-surface border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
                {isTamil ? 'தூய்மையின் அடையாளம்' : 'Standard of Purity'}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                {isTamil ? 'ஒவ்வொரு துளியிலும் நிகரற்ற தரம்' : 'Uncompromising Quality in Every Drop'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1.5">
                {isTamil
                  ? 'உங்கள் குடும்ப ஆரோக்கியத்தைப் பாதுகாக்கும் எங்கள் தயாரிப்பு உறுதிமொழிகள்.'
                  : "Our cold-pressed verification guidelines safeguard your family's daily meals."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Pillar 1 */}
              <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 flex flex-col gap-2 border border-surface-border hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary text-xl mb-1">
                  🍳
                </div>
                <h3 className="font-bold text-sm sm:text-base text-primary">
                  {isTamil ? '100% உணவுத் தரம்' : '100% Edible Grade'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil
                    ? 'அன்றாட சமையல், வறுவல் மற்றும் தாளிப்புக்கு உகந்தது. குழந்தைகளுக்கு பாதுகாப்பானது.'
                    : 'Formulated for daily wholesome cooking across diverse regional cuisines. Safe for infants, deep frying, and ancestral tempering.'}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 flex flex-col gap-2 border border-surface-border hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl mb-1">
                  🧴
                </div>
                <h3 className="font-bold text-sm sm:text-base text-primary">
                  {isTamil ? 'பாதுகாப்பான பேக்கிங்' : 'Carefully Packaged'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil
                    ? 'இயற்கை நறுமணம் மற்றும் சத்துக்கள் மாறாமல் இருக்க தரமான விர்ஜின் பாட்டில்களில் அடைக்கப்படுகிறது.'
                    : 'Bottled in food-grade virgin containers to preserve natural aroma, deep golden hue, and essential active nutrients.'}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 flex flex-col gap-2 border border-surface-border hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl mb-1">
                  📋
                </div>
                <h3 className="font-bold text-sm sm:text-base text-primary">
                  {isTamil ? 'வெளிப்படையான லேபிள்' : 'Transparent Labeling'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil
                    ? 'ஊட்டச்சத்து விவரங்கள், பேக்கிங் தேதி மற்றும் FSSAI எண் ஒவ்வொரு பாட்டிலிலும் தெளிவாக அச்சிடப்பட்டுள்ளது.'
                    : 'Clear nutritional panels, extraction date, and batch verification details printed openly on every single bottle.'}
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 flex flex-col gap-2 border border-surface-border hover:bg-surface-container transition-colors">
                <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary text-xl mb-1">
                  📞
                </div>
                <h3 className="font-bold text-sm sm:text-base text-primary">
                  {isTamil ? 'நேரடி ஆலை உதவி' : 'Direct Support'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isTamil
                    ? 'ஆர்டர்கள் மற்றும் மொத்த விற்பனை விசாரணைகளுக்கு எங்கள் தென்காசி ஆலை தொலைபேசி எண் எப்போதும் தயார்.'
                    : 'Dedicated customer helpline directly at our Tenkasi mill office (+91 9994072837) for retail and commercial queries.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Wholesale Section (Full-Width High-Impact Slate Container from Stitch) */}
        <section id="wholesale-section" className="w-full bg-brand-slate text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-slate-800/80 rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-700 shadow-xl">
              <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl text-center lg:text-left items-center lg:items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-secondary text-on-secondary text-xs font-bold uppercase tracking-wider">
                  <span>🏬</span>
                  <span>{isTamil ? 'மொத்த விற்பனை & B2B' : 'Commercial & Bulk Procurements'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {isTamil ? 'மொத்த ஆர்டர்கள் தேவையா?' : 'Looking for Wholesale Orders?'}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed">
                  {isTamil
                    ? 'விநியோகஸ்தர்கள், உணவகங்கள், இனிப்பகங்கள் மற்றும் இயற்கை அங்காடிகளுக்கு சிறப்பு வணிகக் கட்டணத்தில் 15 லிட்டர் டின்களில் தொடர்ந்து விநியோகம் செய்கிறோம்.'
                    : 'Connect with our team for wholesale and bulk-order enquiries. Custom packaging and business-tier pricing available for distributors, catering firms, restaurants, and Ayurvedic centers across South India.'}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-slate-300 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon size={14} className="text-amber-400" />
                    {isTamil ? '15 லிட்டர் உணவுத் தர டின்கள்' : '15-Litre Food-Grade Tins'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon size={14} className="text-amber-400" />
                    {isTamil ? 'ஜிஎஸ்டி இன்வாய்ஸ் வசதி' : 'GST Invoicing & Logistics'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon size={14} className="text-amber-400" />
                    {isTamil ? 'ஆய்வக சான்றிதழ்' : 'Batch Lab COA Reports'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setWholesaleModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-secondary text-on-secondary font-bold text-sm shadow-md hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>✉️</span>
                  <span>{isTamil ? 'விசாரணை படிவம்' : 'Enquire Now'}</span>
                </button>
                <a
                  href="tel:+919994072837"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-700/60 text-white font-bold text-sm border border-slate-600 hover:bg-slate-700 transition-all active:scale-95 text-center whitespace-nowrap"
                >
                  <span>📞</span>
                  <span>{isTamil ? 'ஆலை உதவி எண்' : 'Call Mill Hotline'}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Frequently Asked Questions (Desktop 2-Col / Mobile 1-Col Accordion) */}
        <section id="faq-section" className="w-full py-12 sm:py-16 bg-surface-container-low border-b border-surface-border">
          <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
                {isTamil ? 'உதவி & வழிகாட்டல்' : 'Help & Transparency'}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1.5">
                {isTamil
                  ? 'எங்கள் தயாரிப்புகள், பாரம்பரிய தயாரிப்பு முறைகள் மற்றும் டெலிவரி தொடர்பான பதில்கள்.'
                  : 'Find answers regarding our products, traditional extraction methods, orders, and regional distribution.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-xs border border-surface-border transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-bold text-primary leading-snug">
                        {item.question}
                      </span>
                      <span
                        className={`text-secondary transform transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDownIcon size={20} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-slate-100 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 10. Master Customer Footer */}
      <CustomerFooter />

      {/* 11. Mobile Bottom Navigation (Persistent on mobile viewports) */}
      <MobileBottomNavigation
        activeTab={activeTab}
        onTabChange={(tab: any) => {
          setActiveTab(tab);
          if (tab === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'catalog') {
            const target = document.getElementById('popular-products');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'cart') {
            addToast({
              type: 'info',
              title: isTamil ? 'கூடை' : 'Cart',
              message: isTamil
                ? `கூடையில் ${cartCount} பொருட்கள் உள்ளன.`
                : `Your cart contains ${cartCount} items.`,
            });
          }
        }}
        cartCount={cartCount}
        isFixed={true}
      />

      {/* Interactive Wholesale Modal Dialog */}
      <Modal
        isOpen={wholesaleModalOpen}
        onClose={() => setWholesaleModalOpen(false)}
        title={isTamil ? 'மொத்த விற்பனை / B2B விசாரணை' : 'Wholesale / B2B Rate Enquiry'}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setWholesaleModalOpen(false)}
            >
              {isTamil ? 'ரத்து செய்' : 'Cancel'}
            </Button>
            <Button
              variant="amber"
              size="md"
              onClick={handleWholesaleSubmit}
            >
              {isTamil ? 'விசாரணையை அனுப்பு' : 'Submit Enquiry'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleWholesaleSubmit} className="space-y-4 text-left">
          <p className="text-xs text-on-surface-variant">
            {isTamil
              ? 'உங்கள் வணிகத் தேவைகளை கீழே குறிப்பிடவும். எங்கள் தென்காசி ஆலை மேலாளர் உங்களை 24 மணி நேரத்திற்குள் தொடர்பு கொள்வார்.'
              : 'Please provide your procurement requirements. Our Tenkasi mill account manager will contact you within 24 business hours.'}
          </p>

          <Input
            label={isTamil ? 'உங்கள் பெயர் / வணிக நிறுவனம்' : 'Your Name / Business Name'}
            placeholder={isTamil ? 'எ.கா: சுந்தரம் கேட்டரிங்' : 'e.g., Sundaram Caterers'}
            value={wholesaleForm.name}
            onChange={(e) => setWholesaleForm({ ...wholesaleForm, name: e.target.value })}
            required
          />

          <Input
            label={isTamil ? 'தொலைபேசி எண்' : 'Contact Phone Number'}
            placeholder="e.g., 9994072837"
            type="tel"
            value={wholesaleForm.phone}
            onChange={(e) => setWholesaleForm({ ...wholesaleForm, phone: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={isTamil ? 'தேவைப்படும் எண்ணெய்' : 'Required Oil Variety'}
              value={wholesaleForm.oilType}
              onChange={(e) => setWholesaleForm({ ...wholesaleForm, oilType: e.target.value })}
              options={[
                { value: 'groundnut', label: isTamil ? 'மரச்செக்கு கடலை எண்ணெய்' : 'Groundnut Oil' },
                { value: 'sesame', label: isTamil ? 'செக்கு நல்லெண்ணெய்' : 'Sesame Oil (Gingelly)' },
                { value: 'coconut', label: isTamil ? 'செக்கு தேங்காய் எண்ணெய்' : 'Coconut Oil' },
                { value: 'mixed', label: isTamil ? 'அனைத்து எண்ணெய் கலவை' : 'Mixed Varieties' },
              ]}
            />

            <Select
              label={isTamil ? 'தேவைப்படும் அளவு' : 'Estimated Volume'}
              value={wholesaleForm.estimatedQuantity}
              onChange={(e) =>
                setWholesaleForm({ ...wholesaleForm, estimatedQuantity: e.target.value })
              }
              options={[
                { value: '15L (1 Tin)', label: '15L (1 Tin)' },
                { value: '45L (3 Tins)', label: '45L (3 Tins)' },
                { value: '150L (10 Tins)', label: '150L (10 Tins)' },
                { value: '200L Barrel', label: '200L Barrel (Bulk)' },
              ]}
            />
          </div>

          <Input
            label={isTamil ? 'டெலிவரி பின்கோடு / ஊர்' : 'Delivery City / Pincode'}
            placeholder="e.g., 627760 / Tenkasi"
            value={wholesaleForm.pincode}
            onChange={(e) => setWholesaleForm({ ...wholesaleForm, pincode: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
