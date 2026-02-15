"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import styles from "./Header.module.css";
import "../../../app/globals.css";

// Import your authentication service
import {
  getCurrentUser,
  isUserAuthenticated,
  UserStorage,
  AuthService,
} from "../../../services/auth/login";

// Components
import NotificationsComponent from "./../../UI/notification/notification";
// import LanguageSelector from "./../../UI/Language/language";
import { Button } from "../../UI/Buttons/Button";

// Services
import { getUnreadNotificationsCount } from "../../../services/notifications/notification";

// Icons
import Logo from "@/public/logo/logo1.png";
import Heart from "./../../../public/icons/Header/Heart.svg";
import Cart from "./../../../public/icons/Header/Cart Large 2.svg";
import Notification from "./../../../public/icons/Header/Bell Bing.svg";

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
};

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "المنتجات", href: "/products" },
  { label: "طلباتك الخاصة", href: "/inquiries" },
  { label: "ازاي تختار", href: "/marble-info" },
];

const ACTION_LINKS: NavItem[] = [
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

  // State for user data
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle session-based auth (for social login)
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
  }, [session, status]);

  // Load user data from localStorage when component mounts
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
      if (!user || !isMounted) {
        return;
      }

      try {
        const count = await getUnreadNotificationsCount();

        if (isMounted) {
          setUnreadCount(count);
        }
      } catch (error) {
        if (isMounted) {
          console.error("❌ Error fetching unread count:", error);
        }
      }
    };

    if (user) {
      fetchUnreadCount();

      intervalId = setInterval(() => {
        if (isMounted) {
          fetchUnreadCount();
        }
      }, 300000);
    }

    return () => {
      isMounted = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [user]);

  // Listen for storage changes AND custom events
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMounted]);

  const handleLogin = (): void => {
    router.push("/login");
  };

  const handleNotificationClick = (): void => {
    setIsNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    if (user) {
      getUnreadNotificationsCount().then(setUnreadCount).catch(console.error);
    }
  };

  const getVariantClass = (): string => {
    switch (variant) {
      case "auth":
        return styles.headerAuth;
      case "minimal":
        return styles.headerMinimal;
      case "transparent":
        return styles.headerTransparent;
      default:
        return "";
    }
  };

  const headerClasses = `${
    styles.header
  } ${isScrolled ? styles.headerScrolled : ""} ${getVariantClass()} ${className}`.trim();

  const isAuthenticated = user !== null && !isLoading;

  const isPathActive = useMemo(() => {
    return (href: string) => {
      if (!pathname) {
        return false;
      }

      if (href === "/") {
        return pathname === "/";
      }

      return pathname.startsWith(href);
    };
  }, [pathname]);

  if (!isMounted) {
    return null;
  }

  if ((isLoading || status === "loading") && showUserActions) {
    return (
      <header className={headerClasses} style={customStyles} dir="rtl">
        <div className={styles.headerInner}>
          <div className={styles.rightSection}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src={Logo}
                alt="Logo"
                width={140}
                height={40}
                sizes="140px"
                className={styles.logoImage}
                priority
              />
            </Link>
            <span className={styles.loadingText}>...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <Navbar className={headerClasses} customStyles={customStyles}>
        <div className={styles.rightSection}>
          <Link href="/" className={styles.logoLink} aria-label="الانتقال للصفحة الرئيسية">
            <Image
              src={Logo}
              alt="Logo"
              width={140}
              height={40}
              sizes="140px"
              className={styles.logoImage}
              priority
            />
          </Link>
          <NavLink
            href="/"
            label="الرئيسية"
            isActive={isPathActive("/")}
            className={styles.homeLink}
          />
          {/* Inline primary nav links beside Home */}
          <nav className={styles.navList} aria-label="القائمة الرئيسية">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isPathActive(item.href)}
              />
            ))}
          </nav>
        </div>

        <div className={styles.leftSection}>
          {showUserActions && (
            <>
              <IconGroup
                isAuthenticated={isAuthenticated}
                unreadCount={unreadCount}
                onNotificationsClick={handleNotificationClick}
              />
              <AuthButton
                isAuthenticated={isAuthenticated}
                user={user}
                onLogin={handleLogin}
              />
            </>
          )}

          <button
            type="button"
            className={styles.menuButton}
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className={styles.menuIcon} />
            ) : (
              <Menu className={styles.menuIcon} />
            )}
          </button>
        </div>
      </Navbar>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={MAIN_NAV_ITEMS}
        isActive={isPathActive}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
      />

      <NotificationsComponent
        isOpen={isNotificationsOpen}
        onClose={handleNotificationsClose}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}

export default Header;

function Navbar({
  className,
  customStyles,
  children,
}: {
  className: string;
  customStyles: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <header className={className} style={customStyles} dir="rtl">
      <div className={styles.headerInner}>{children}</div>
    </header>
  );
}

function NavLink({
  href,
  label,
  isActive,
  className = "",
}: {
  href: string;
  label: string;
  isActive: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${
        className || ""
      }`.trim()}
    >
      <span className={styles.navLinkLabel}>{label}</span>
    </Link>
  );
}

function IconGroup({
  isAuthenticated,
  unreadCount,
  onNotificationsClick,
}: {
  isAuthenticated: boolean;
  unreadCount: number;
  onNotificationsClick: () => void;
}) {
  return (
    <div className={styles.iconGroup} aria-label="الإجراءات">
      <Link
        href={ACTION_LINKS[0].href}
        className={styles.iconButton}
        aria-label={ACTION_LINKS[0].label}
      >
        <Search className={styles.icon} />
      </Link>

      <Link
        href={ACTION_LINKS[1].href}
        className={styles.iconButton}
        aria-label={ACTION_LINKS[1].label}
      >
        <Heart className={styles.icon} />
      </Link>

      {isAuthenticated ? (
        <button
          type="button"
          className={styles.iconButton}
          aria-label="الإشعارات"
          onClick={onNotificationsClick}
        >
          <Notification className={styles.icon} />
          {unreadCount > 0 && (
            <span className={styles.iconBadge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className={styles.iconButtonMuted} aria-hidden="true">
          <Notification className={styles.icon} />
        </div>
      )}

      <Link
        href={ACTION_LINKS[2].href}
        className={styles.iconButton}
        aria-label={ACTION_LINKS[2].label}
      >
        <Cart className={styles.icon} />
      </Link>
    </div>
  );
}

function AuthButton({
  isAuthenticated,
  user,
  onLogin,
}: {
  isAuthenticated: boolean;
  user: User | null;
  onLogin: () => void;
}) {
  if (isAuthenticated && user) {
    const displayName = getUserDisplayName(user.firstName, user.lastName) || "حسابي";

    return (
      <Link href="/profile" className={styles.profileButton} aria-label="الملف الشخصي">
        <div className={styles.profileAvatar}>
          {user.image ? (
            <Image
              src={user.image}
              alt="User Avatar"
              width={36}
              height={36}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.profileInitial}>
              {getUserInitial(user.firstName, user.lastName)}
            </span>
          )}
        </div>
        <span className={styles.profileName}>{displayName}</span>
        <ChevronDown className={styles.dropdownIndicator} />
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLogin}
      className={styles.loginButton}
      rounded={true}
    >
      تسجيل دخول
    </Button>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  navItems,
  isActive,
  isAuthenticated,
  user,
  onLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLogin: () => void;
}) {
  return (
    <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""}`.trim()}>
      <div className={styles.mobileMenuOverlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.mobileMenuPanel} role="dialog" aria-modal="true">
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>القائمة</span>
          <button type="button" className={styles.mobileMenuClose} onClick={onClose}>
            <X className={styles.menuIcon} />
          </button>
        </div>

        <nav className={styles.mobileMenuList} aria-label="القائمة الرئيسية">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`${styles.mobileNavLink} ${
                isActive(item.href) ? styles.mobileNavLinkActive : ""
              }`.trim()}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.mobileMenuFooter}>
          {isAuthenticated && user ? (
            <Link href="/profile" onClick={onClose} className={styles.mobileProfile}>
              <div className={styles.profileAvatar}>
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className={styles.avatarImage}
                  />
                ) : (
                  <span className={styles.profileInitial}>
                    {getUserInitial(user.firstName, user.lastName)}
                  </span>
                )}
              </div>
              <span className={styles.profileName}>
                {getUserDisplayName(user.firstName, user.lastName) || "حسابي"}
              </span>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={onLogin}
              className={styles.mobileLoginButton}
              rounded={true}
            >
              تسجيل دخول
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}