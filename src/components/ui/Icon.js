import {
  Accessibility, Activity, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Award,
  Baby, BadgeCheck, BarChart3, Bell, Blocks, BookCopy, BookMarked, BookOpen, Bookmark, Boxes,
  Brain, BrainCircuit, Briefcase, Bug, Building2, Calculator, Calendar, CalendarClock, Camera,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleDollarSign,
  ClipboardCheck, ClipboardList, Clock, Cloud, Code2, Compass, Copy, CreditCard, Database,
  Download, Eye, EyeOff, Facebook, FileCheck2, FileSearch, FileSpreadsheet, FileText, FileUp,
  Filter, Flag, FolderGit2, FolderOpen, Gavel, GitBranch, Globe, GraduationCap, GripVertical,
  Handshake, HeartPulse, Home, Image as ImageIcon, Inbox, Info, Instagram, Kanban, Landmark,
  Languages, Laptop, Layers, LayoutDashboard, LayoutTemplate, Library, Lightbulb, LineChart,
  Linkedin, ListChecks, Loader2, Lock, LogOut, Mail, MapPin, Medal, Megaphone, Menu,
  MessageCircle, MessageSquareHeart, MessagesSquare, Mic, Minus, Monitor, Network, Newspaper,
  PanelBottom, Palette, PenLine, Pencil, Phone, PhoneCall, PieChart, Plane, PlayCircle, Plug,
  Plus, Presentation, Printer, Quote, RefreshCw, ReceiptText, Rocket, Save, Scale, Search,
  Send, Server, Settings, Share2, ShieldAlert, ShieldCheck, Sigma, Signal, SlidersHorizontal,
  Smartphone, Sparkles, SquarePen, Star, Stethoscope, Target, Terminal, TestTube2, Timer,
  Trash2, TrendingDown, TrendingUp, Trophy, Twitter, Type, Upload, UserCheck, UserPlus, Users,
  Video, Wallet, Workflow, X, Youtube, Zap,
} from 'lucide-react';

/**
 * Icon registry.
 *
 * The database stores icons as names (e.g. "GraduationCap") so the admin can
 * choose one from a picker without any code change. Importing them explicitly
 * rather than via `import * as lucide` keeps tree-shaking working — a wildcard
 * import would pull the entire icon set into the client bundle.
 */
export const ICONS = {
  Accessibility, Activity, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Award,
  Baby, BadgeCheck, BarChart3, Bell, Blocks, BookCopy, BookMarked, BookOpen, Bookmark, Boxes,
  Brain, BrainCircuit, Briefcase, Bug, Building2, Calculator, Calendar, CalendarClock, Camera,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleDollarSign,
  ClipboardCheck, ClipboardList, Clock, Cloud, Code2, Compass, Copy, CreditCard, Database,
  Download, Eye, EyeOff, Facebook, FileCheck2, FileSearch, FileSpreadsheet, FileText, FileUp,
  Filter, Flag, FolderGit2, FolderOpen, Gavel, GitBranch, Globe, GraduationCap, GripVertical,
  Handshake, HeartPulse, Home, ImageIcon, Inbox, Info, Instagram, Kanban, Landmark,
  Languages, Laptop, Layers, LayoutDashboard, LayoutTemplate, Library, Lightbulb, LineChart,
  Linkedin, ListChecks, Loader2, Lock, LogOut, Mail, MapPin, Medal, Megaphone, Menu,
  MessageCircle, MessageSquareHeart, MessagesSquare, Mic, Minus, Monitor, Network, Newspaper,
  PanelBottom, Palette, PenLine, Pencil, Phone, PhoneCall, PieChart, Plane, PlayCircle, Plug,
  Plus, Presentation, Printer, Quote, RefreshCw, ReceiptText, Rocket, Save, Scale, Search,
  Send, Server, Settings, Share2, ShieldAlert, ShieldCheck, Sigma, Signal, SlidersHorizontal,
  Smartphone, Sparkles, SquarePen, Star, Stethoscope, Target, Terminal, TestTube2, Timer,
  Trash2, TrendingDown, TrendingUp, Trophy, Twitter, Type, Upload, UserCheck, UserPlus, Users,
  Video, Wallet, Workflow, X, Youtube, Zap,
};

/** Names offered in the admin icon picker. */
export const ICON_NAMES = Object.keys(ICONS).sort();

/**
 * Render an icon by name, falling back to Sparkles so a typo in the database
 * never breaks a page render.
 */
export default function Icon({ name, fallback = 'Sparkles', ...props }) {
  const Component = ICONS[name] || ICONS[fallback] || Sparkles;
  return <Component aria-hidden="true" {...props} />;
}

/** WhatsApp is not in the Lucide set, so it is drawn inline. */
export function WhatsAppIcon({ size = 24, className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.136-.136.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.172-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.993 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.889 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
    </svg>
  );
}
