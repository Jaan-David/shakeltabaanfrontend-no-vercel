"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChevronDown, Menu, Search, X, Heart, ShoppingCart, Bell } from "lucide-react";
import styles from "./Header.module.css";
import "../../../app/globals.css";

import {
  getCurrentUser,
  isUserAuthenticated,
  UserStorage,
  AuthService,
} from "../../../services/auth/login";

import NotificationsComponent from "./../../UI/notification/notification";
import { Button } from "../../UI/Buttons/Button";
import { getUnreadNotificationsCount } from "../../../services/notifications/notification";
import Logo from "@/public/logo/logo1.png";

export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string | null;
  phoneNumber: string;
  department?: string | null;
  salary?: number | null;
  dateOfSubmission?: string | null;
  isVerified?: boolean;
  isEmailVerified: boolean;
  address?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: string;
}

interface HeaderProps {
  className?: string;
  variant?: "default" | "auth" | "minimal" | "transparent";
  customStyles?: React.CSSProperties;
  showUserActions?: boolean;
}

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "المنتجات", href: "/products" },
  { label: "طلباتك الخاصة", href: "/inquiries" },
  { label: "ازاي تختار", href: "/marble-info" },
  { label: "من نحن", href: "/about" },
];

const ACTION_ITEMS: NavItem[] = [
  { label: "بحث", href: "/products" },
  { label: "المفضلة", href: "/favorites" },
  { label: "عربة التسوق", href: "/cart" },
];

const getUserInitial = (firstName: string, lastName: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }
  return "U";
};

const getUserDisplayName = (firstName?: string, lastName?: string): string => {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || "حسابي";
};

function Header({
  className = "",
  variant = "default",
  customStyles = {},
  showUserActions = true,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // MOBILE MENU: Handle scroll lock
  useEffect(() => {
    if (!isMounted) return;
    
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMounted]);

  // MOBILE MENU: Handle swipe close
  useEffect(() => {
    if (!isMobileMenuOpen || !menuRef.current) return;

    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 80) {
        setIsMobileMenuOpen(false);
      }
    };

    menuRef.current?.addEventListener("touchstart", handleTouchStart);
    menuRef.current?.addEventListener("touchend", handleTouchEnd);

    return () => {
      menuRef.current?.removeEventListener("touchstart", handleTouchStart);
      menuRef.current?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileMenuOpen]);

  // ACCESSIBILITY: Focus trap in mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Handle session-based auth
  useEffect(() => {
    setIsMounted(true);
    const handleSocialAuth = async () => {
      if (session?.backendToken && session?.user?.backendUser) {
        UserStorage.saveUser(session.user.backendUser);
        UserStorage.saveToken(session.backendToken);
        setUser(session.user.backendUser);
        setIsLoading(false);

        AuthService.startTokenMonitoring(() => {
          setUser(null);
          router.push("/login");
        });
      }
    };

    if (status !== "loading") {
      handleSocialAuth();
    }
  }, [session, status, router]);

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoading(true);
        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== "loading") {
      loadUserData();
    }
  }, [status]);

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchUnreadCount = async () => {
      if (!user || !isMounted) return;

      try {
        const count = await getUnreadNotificationsCount();
        if (isMounted) {
          setUnreadCount(count || 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching unread count:", error);
        }
      }
    };

    if (user) {
      fetchUnreadCount();
      intervalId = setInterval(() => {
        if (isMounted) {
          fetchUnreadCount();
        }
      }, 300000); // 5 minutes
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    };

    const handleTokenExpiry = () => {
      setUser(null);
      router.push("/login");
    };

    const handleAuthUpdate = () => {
      if (isUserAuthenticated()) {
        const userData = getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tokenExpired", handleTokenExpiry);
    window.addEventListener("authUpdated", handleAuthUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenExpired", handleTokenExpiry);
      window.removeEventListener("authUpdated", handleAuthUpdate);
    };
  }, [router]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => router.push("/login");

  const handleNotificationClick = () => setIsNotificationsOpen(true);

  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    if (user) {
      getUnreadNotificationsCount()
        .then(setUnreadCount)
        .catch(console.error);
    }
  };

  const isPathActive = useMemo(() => {
    return (href: string) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    };
  }, [pathname]);

  const headerClasses = `${styles.header} ${
    isScrolled ? styles.headerScrolled : ""
  } ${className}`.trim();

  const isAuthenticated = user !== null && !isLoading;

  if (!isMounted) return null;

  if ((isLoading || status === "loading") && showUserActions) {
    return (
      <header className={headerClasses} style={customStyles} dir="rtl">
        <div className={styles.headerInner}>
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={headerClasses} style={customStyles} dir="rtl">
        <div className={styles.headerInner}>
          {/* RIGHT: Logo */}
          <div className="flex items-center">
            <Link href="/" className={styles.logoLink} aria-label="الرئيسية">
              <Image
                src={Logo}
                alt="منصة شق الثعبان"
                width={40}
                height={40}
                className={styles.logoImage}
                priority
              />
            </Link>
          </div>

          {/* CENTER: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPathActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* LEFT: Actions + Auth */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop Action Links */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href={ACTION_ITEMS[0].href}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label={ACTION_ITEMS[0].label}
              >
                <Search size={20} />
              </Link>
              <Link
                href={ACTION_ITEMS[1].href}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label={ACTION_ITEMS[1].label}
              >
                <Heart size={20} />
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  aria-label="الإشعارات"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              ) : (
                <div className="p-2 text-slate-300 cursor-not-allowed">
                  <Bell size={20} />
                </div>
              )}
              <Link
                href={ACTION_ITEMS[2].href}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label={ACTION_ITEMS[2].label}
              >
                <ShoppingCart size={20} />
              </Link>
            </div>

            {/* Auth Button */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label="الملف الشخصي"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                  {getUserInitial(user.firstName, user.lastName)}
                </div>
                <span className="hidden md:inline text-xs">
                  {getUserDisplayName(user.firstName, user.lastName)}
                </span>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                className="hidden sm:inline-flex rounded-lg"
              >
                تسجيل دخول
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="قائمة الملاحة"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE MENU PANEL */}
      <div
        ref={menuRef}
        className={`fixed top-16 right-0 bottom-0 w-4/5 max-w-xs bg-white z-50 sm:hidden transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة الملاحة"
      >
        <nav className="flex flex-col gap-1 p-4">
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isPathActive(item.href)
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <hr className="my-2 border-slate-200" />

          {/* Mobile Action Links */}
          <Link
            href={ACTION_ITEMS[0].href}
            className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Search size={18} />
            {ACTION_ITEMS[0].label}
          </Link>
          <Link
            href={ACTION_ITEMS[1].href}
            className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Heart size={18} />
            {ACTION_ITEMS[1].label}
          </Link>
          <Link
            href={ACTION_ITEMS[2].href}
            className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ShoppingCart size={18} />
            {ACTION_ITEMS[2].label}
          </Link>

          <hr className="my-2 border-slate-200" />

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                className="px-4 py-3 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                  {getUserInitial(user.firstName, user.lastName)}
                </div>
                {getUserDisplayName(user.firstName, user.lastName)}
              </Link>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleLogin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full rounded-lg mt-2"
            >
              تسجيل دخول
            </Button>
          )}
        </nav>
      </div>

      <NotificationsComponent
        isOpen={isNotificationsOpen}
        onClose={handleNotificationsClose}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}

export default Header;
