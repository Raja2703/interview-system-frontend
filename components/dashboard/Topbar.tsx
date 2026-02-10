"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bell, ChevronDown, Settings, LogOut, CreditCard, Check } from "lucide-react";
import Link from "next/link";
import { useLogoutMutation } from "@/hooks/auth/auth.mutations"
import { useUserQuery } from "@/hooks/user/user.queries"
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useNotificationsQuery } from "@/hooks/notifications/notifications.queries";
import { useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/notifications/notifications.mutations";
import { getNotificationIcon } from "@/utils/notifications/notificationsUI"

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();

  const { data } = useNotificationsQuery({ page: 1 });
  const markAllReadMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  const notifications = data?.results?.slice(0, 10) ?? [];

  // --- State ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // --- Refs for Click Outside ---
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // --- Queries & Mutations ---
  const logoutMutation = useLogoutMutation()
  const { getUserProfileQuery } = useUserQuery()
  const { data: userProfile, isLoading } = getUserProfileQuery;

  const user = {
    name: userProfile?.name || "User",
    role: userProfile?.roles.length == 2 ? "Both" : (userProfile?.roles[0] == 'taker' ? "Interviewer" : "Attender"),
    credits: userProfile?.credits || 850,
    avatarUrl: "https://api.dicebear.com/9.x/identicon/svg?seed=Jameson",
    progress: userProfile?.onboarding_progress || 0 
  }

  // --- Derived State ---
  const unreadCount = notifications.filter(
    (n: any) => !n.is_read
  ).length;

  // --- Circular Progress Math ---
  const radius = 18; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (user.progress / 100) * circumference;

  // --- Effects ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleLogout = () => {
    const refreshToken:any = sessionStorage.getItem("refreshToken");
    logoutMutation.mutate(
      { refresh_token: refreshToken },
      {
        onSuccess: async(data) => {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          toast.success(data?.message || "Logout successful");
          router.replace("/login");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || error.message);
        },
      }
    )
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) setIsProfileOpen(false); 
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (!isProfileOpen) setIsNotificationsOpen(false); 
  };

  // --- Navigation Logic ---
  const handleNotificationClick = (notif: any) => {
    // 1. Mark as read
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }

    // 2. Determine target tab
    let targetTab = 'history'; // default

    switch (notif.notification_type) {
      case 'interview_created':
        targetTab = 'pending';
        break;
      case 'interview_accepted':
      case 'interview_reminder':
        targetTab = 'accepted';
        break;
      case 'interview_rejected':
        targetTab = 'rejected';
        break;
      case 'interview_cancelled':
      case 'interview_completed':
        targetTab = 'history';
        break;
      default:
        targetTab = 'history';
    }

    // 3. Close dropdown and Navigate
    setIsNotificationsOpen(false);
    router.push(`/dashboard/interviews?tab=${targetTab}`);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-10 px-8 flex items-center justify-end">
         <div className="animate-pulse flex items-center gap-4">
            <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
         </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
      
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Dashboard
        </h2>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* --- NOTIFICATIONS DROPDOWN --- */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={toggleNotifications}
            className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 sm:-right-10 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  Notifications 
                  {unreadCount > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              {/* Scrollable List */}
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No notifications yet.</div>
                ) : (
                  notifications.map((notif: any) => (
                    <button
                      key={notif.id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-4 items-start ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.is_read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notif.notification_type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col items-start w-full">
                         <div className="flex w-full justify-between items-start mb-0.5">
                            <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notif.title}
                            </p>
                            {!notif.is_read && <span className="h-2 w-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0 ml-2"></span>}
                         </div>
                         <p className="text-start text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.message}</p>
                         <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {new Date(notif.created_at).toLocaleString()}
                         </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                 <Link href="/dashboard/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                    View All Activity
                 </Link>
              </div>
            </div>
          )}
        </div>

        {/* ... Rest of the User Profile Code (Unchanged) ... */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          {/* ... User Profile Button ... */}
          <button
            onClick={toggleProfile}
            className="flex items-center gap-3 focus:outline-none group"
          >
             {/* ... User Profile Content ... */}
             <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            
             <div className="relative flex items-center justify-center w-12 h-12">
                <svg className="absolute w-full h-full -rotate-90 transform" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                        cx="22" cy="22" r={radius}
                        fill="none" stroke="#4f46e5" strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
            </div>

            <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                            <CreditCard size={12} /> Credits
                        </span>
                        <span className="text-lg font-bold text-gray-900">{user.credits}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-medium">Profile Completion</span>
                        <span className="text-[10px] font-bold text-indigo-600">{user.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div className="bg-indigo-500 h-1 rounded-full transition-all duration-700" style={{ width: `${user.progress}%` }}></div>
                    </div>
                </div>
              </div>

              <div className="py-2">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Settings size={18} className="text-gray-400" />
                  Profile Settings
                </Link>
                
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  {logoutMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut size={18} />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}