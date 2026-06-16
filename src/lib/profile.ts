export type Role = "expert" | "customer";
export type Lang = "en" | "ar";
export type Gender = "male" | "female";
export type CombinationZone = "tzone" | "ozone" | "uzone" | "";
export type AnswerStyle = "quick" | "detailed";
export type HairPorosity = "low" | "medium" | "high" | "";

export interface UserProfile {
  name: string;
  role: Role;
  lang: Lang;
  gender: Gender;
  recommendFor: Gender;
  skinType: string;
  combinationZone: CombinationZone;
  concerns: string[];
  budget: string;
  preference: "egyptian" | "imported" | "both";
  allergies: string;
  pregnant: boolean;
  favoriteBrands: string;
  answerStyle: AnswerStyle;
  hairPorosity: HairPorosity;
  hairConcerns: string[];
  lastSkinIdRefresh?: string;
  avatarDataUrl?: string;
  onboarded: boolean;
  legalAcceptedAt?: string;
  hiddenTools: string[];
  roastMode: "roast" | "praise" | "off";
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  role: "customer",
  lang: "en",
  gender: "female",
  recommendFor: "female",
  skinType: "",
  combinationZone: "",
  concerns: [],
  budget: "",
  preference: "both",
  allergies: "",
  pregnant: false,
  favoriteBrands: "",
  answerStyle: "quick",
  hairPorosity: "",
  hairConcerns: [],
  onboarded: false,
  hiddenTools: [],
  roastMode: "roast",
};


const KEY = "solskin_profile_v2";

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    // Migrate legacy "advisor" role → "expert"
    if (parsed.role === "advisor") parsed.role = "expert";
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export const T = {
  en: {
    appName: "SoSkin",
    tagline: "SOS for your Skin — intelligent skincare rescue",
    home: "Home",
    chat: "Chat",
    scan: "Scan",
    profile: "Profile",
    settings: "Settings",
    askAI: "Ask SoSkin",
    investigate: "Investigate Product",
    routine: "Build Routine",
    compare: "Compare Products",
    quickActions: "Quick Actions",
    forYou: "For You",
    welcome: "Welcome back",
    getStarted: "Get Started",
    next: "Next",
    finish: "Finish",
    typing: "Typing...",
    placeholder: "Ask about ingredients, products, routines...",
    send: "Send",
    expert: "Skincare Expert",
    expertDesc: "In-store advisor & deep formulation analysis",
    customer: "Customer",
    customerDesc: "Simple, friendly skincare guidance",
    selectRole: "Choose your mode",
    yourName: "Your name",
    skinType: "Skin type",
    concerns: "Skin concerns",
    budget: "Monthly budget",
    productPref: "Product preference",
    allergies: "Allergies (optional)",
    pregnancy: "Currently pregnant",
    favoriteBrands: "Favorite brands (optional)",
    egyptian: "Egyptian",
    imported: "Imported",
    both: "Both",
    scanTitle: "Investigation Mode",
    scanDesc: "Upload a product image — AI analyzes ingredients, trust score, value, alternatives.",
    uploadImage: "Upload product image",
    analyze: "Analyze",
    trustScore: "Trust Score",
    valueScore: "Value",
    benefits: "Benefits",
    warnings: "Warnings",
    activeIngredients: "Active Ingredients",
    alternatives: "Alternatives",
    why: "Why this?",
    edit: "Edit Profile",
    language: "Language",
    role: "Role",
    saved: "Saved",
    save: "Save",
    newChat: "New chat",
    male: "Male",
    female: "Female",
    gender: "Gender",
    recommendFor: "Recommending for",
    recommendForQ: "Who are you recommending products for?",
    combinationZone: "Combination zone",
    combinationZoneQ: "Which combination skin pattern?",
    tzone: "T-Zone (forehead, nose, chin oily)",
    ozone: "O-Zone (oily around mouth/cheeks)",
    uzone: "U-Zone (oily jawline & cheeks)",
    answerStyle: "Answer style",
    quickAnswers: "Quick Answers",
    detailedExplanation: "Detailed Explanation",
    suggestion1: "Recommend a routine for oily skin",
    suggestion2: "Compare niacinamide vs azelaic acid",
    suggestion3: "Customer says it's too expensive — help me",
    suggestion4: "Is this safe during pregnancy?",
    compareTitle: "Product Comparison",
    compareDesc: "Compare 2 or more skincare products side-by-side.",
    addProduct: "Add product",
    productNamePh: "e.g. CeraVe Foaming Cleanser",
    runCompare: "Compare",
    ingredientImage: "Ingredient list image",
    productImage: "Product image",
    showMoreAlts: "Show more alternatives",
    hairPorosity: "Hair porosity",
    hairPorosityQ: "What's your hair porosity?",
    hairLow: "Low (water beads on hair)",
    hairMedium: "Medium (balanced)",
    hairHigh: "High (absorbs fast, dries fast)",
    hairConcerns: "Hair concerns",
    skipForNow: "Skip for now",
    googleSignIn: "Continue with Google",
    emailSignIn: "Sign in with email",
    emailSignUp: "Sign up with email",
    signIn: "Sign In",
    signUp: "Sign Up",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create account",
    joinPrompt: "Join SoSkin and save your beauty journey",
    back: "Back",
  },
  ar: {
    appName: "سو سكين",
    tagline: "إنقاذ ذكي لبشرتك — SOS لبشرتك",
    home: "الرئيسية",
    chat: "محادثة",
    scan: "فحص",
    profile: "الملف",
    settings: "الإعدادات",
    askAI: "اسأل سو سكين",
    investigate: "فحص منتج",
    routine: "بناء روتين",
    compare: "قارن منتجات",
    quickActions: "إجراءات سريعة",
    forYou: "لك خصيصاً",
    welcome: "أهلاً بعودتك",
    getStarted: "ابدأ الآن",
    next: "التالي",
    finish: "إنهاء",
    typing: "يكتب...",
    placeholder: "اسأل عن المكونات، المنتجات، الروتين...",
    send: "إرسال",
    expert: "خبير / مسؤول تجميل",
    expertDesc: "أدوات بيع داخل المتجر + تحليل عميق للتركيبات",
    customer: "عميل",
    customerDesc: "إرشادات بسيطة وودية لروتينك اليومي",
    selectRole: "اختر وضعك",
    yourName: "اسمك",
    skinType: "نوع البشرة",
    concerns: "مشاكل البشرة",
    budget: "الميزانية الشهرية",
    productPref: "تفضيل المنتجات",
    allergies: "حساسية (اختياري)",
    pregnancy: "حامل حالياً",
    favoriteBrands: "ماركات مفضلة (اختياري)",
    egyptian: "مصري",
    imported: "مستورد",
    both: "كلاهما",
    scanTitle: "وضع التحقيق",
    scanDesc: "ارفع صورة منتج — الذكاء الاصطناعي يحلل المكونات ودرجة الثقة والقيمة والبدائل.",
    uploadImage: "ارفع صورة المنتج",
    analyze: "حلّل",
    trustScore: "درجة الثقة",
    valueScore: "القيمة",
    benefits: "الفوائد",
    warnings: "تحذيرات",
    activeIngredients: "المكونات الفعّالة",
    alternatives: "بدائل",
    why: "لماذا؟",
    edit: "تعديل الملف",
    language: "اللغة",
    role: "الدور",
    saved: "تم الحفظ",
    save: "حفظ",
    newChat: "محادثة جديدة",
    male: "ذكر",
    female: "أنثى",
    gender: "النوع",
    recommendFor: "التوصية لـ",
    recommendForQ: "لمن تريد ترشيح المنتجات؟",
    combinationZone: "منطقة البشرة المختلطة",
    combinationZoneQ: "أي نمط بشرة مختلطة؟",
    tzone: "منطقة T (جبهة وأنف وذقن دهنية)",
    ozone: "منطقة O (دهنية حول الفم/الخدود)",
    uzone: "منطقة U (دهنية على الفك والخدود)",
    answerStyle: "أسلوب الإجابة",
    quickAnswers: "إجابات سريعة",
    detailedExplanation: "شرح تفصيلي",
    suggestion1: "اقترح روتين لبشرة دهنية",
    suggestion2: "قارن النياسيناميد والأزيليك",
    suggestion3: "العميل يقول إنه غالي — ساعدني",
    suggestion4: "هل آمن خلال الحمل؟",
    compareTitle: "مقارنة المنتجات",
    compareDesc: "قارن منتجين أو أكثر جنبًا إلى جنب.",
    addProduct: "أضف منتج",
    productNamePh: "مثال: غسول سيرافي الرغوي",
    runCompare: "قارن",
    ingredientImage: "صورة قائمة المكونات",
    productImage: "صورة المنتج",
    showMoreAlts: "عرض بدائل أكثر",
    hairPorosity: "مسامية الشعر",
    hairPorosityQ: "ايه مسامية شعرك؟",
    hairLow: "منخفضة (الماء يتجمع على الشعر)",
    hairMedium: "متوسطة (متوازنة)",
    hairHigh: "عالية (يمتص بسرعة ويجف بسرعة)",
    hairConcerns: "مشاكل الشعر",
    skipForNow: "تخطّى الآن",
    googleSignIn: "سجّل الدخول بـ Google",
    emailSignIn: "سجّل الدخول بالإيميل",
    emailSignUp: "سجّل بالإيميل",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    forgotPassword: "نسيت الباسورد؟",
    noAccount: "مش عندك حساب؟",
    hasAccount: "عندك حساب؟",
    createAccount: "إنشاء حساب",
    joinPrompt: "انضم لسو سكين واحفظ رحلتك",
    back: "رجوع",
  },
} as const;

export function tr(lang: Lang) {
  return T[lang];
}
