"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import axios from "axios";
import Image from "next/image";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu
  const [sscOpen, setSscOpen] = useState(false); // Desktop dropdown
  const [mobileSscOpen, setMobileSscOpen] = useState(false); // Mobile dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // User dropdown
  const [customer, setCustomer] = useState(null); // User data
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const apiurl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const sscRef = useRef(null);
  const mobileSscRef = useRef(null);
  const userRef = useRef(null);

  const fetchCustomer = async () => {
    setLoadingCustomer(true);
    try {
      const res = await axios.get(`${apiurl}/customer/customerme`, {
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
      });
      const user = res.data.user;
      setCustomer(user || null);
    } catch {
      setCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  useEffect(() => {
    fetchCustomer();

    const loginHandler = () => fetchCustomer();
    const logoutHandler = () => fetchCustomer();

    window.addEventListener("login", loginHandler);
    window.addEventListener("logout", logoutHandler);

    return () => {
      window.removeEventListener("login", loginHandler);
      window.removeEventListener("logout", logoutHandler);
    };
  }, []);

  // Click outside to close SSC dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sscRef.current && !sscRef.current.contains(event.target))
        setSscOpen(false);
      if (mobileSscRef.current && !mobileSscRef.current.contains(event.target))
        setMobileSscOpen(false);
      if (userRef.current && !userRef.current.contains(event.target))
        setUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${apiurl}/customer/customerlogout`,
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      setCustomer(null);
      window.dispatchEvent(new Event("logout"));
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    }
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="h-20 bg-black/10 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex justify-between items-center">
          {/* <h1 className="text-white text-2xl font-bold tracking-wide">
            CodeMonarch Academy
          </h1> */}
          {/* <img
            src="LOGO.png"
            alt="CodeMonarch Academy Logo"
            className="w-28 h-20 sm:w-40 sm:h-28 md:w-52 md:h-32 lg:w-60 lg:h-34 object-contain shadow-md transition-all duration-300"
          /> */}
          <Image
  src="/LOGO.png" // Make sure to use the path correctly for the Next.js static folder or an external URL
  alt="CodeMonarch Academy Logo"
  width={240} // Set a default width
  height={160} // Set a default height
  className="object-contain shadow-md transition-all duration-300"
  sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 240px" // Add responsive size handling for different breakpoints
/>
          

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center relative">
            <NavLink to="/">Home</NavLink>

            {/* SSC Sheet dropdown */}
            <div ref={sscRef} className="relative">
              <button
                onClick={() => setSscOpen(!sscOpen)}
                className="text-white hover:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center justify-between"
              >
                SSC Sheet
                <span
                  className={`ml-2 transform transition-transform ${
                    sscOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  &#9662;
                </span>
              </button>
              {sscOpen && (
                <div className="absolute top-full left-0 mt-2 bg-black/90 border border-white/20 rounded-lg shadow-lg min-w-[150px] z-50">
                  <DropdownLink to="/sscsheet/math">Math</DropdownLink>
                  <DropdownLink to="/sscsheet/english">English</DropdownLink>
                  <DropdownLink to="/sscsheet/reasoning">
                    Reasoning
                  </DropdownLink>
                  <DropdownLink to="/sscsheet/gk">GK</DropdownLink>
                </div>
              )}
            </div>
            <Link
              href="/support"
              className="text-white hover:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center justify-between"
            >
              Support
            </Link>

            {/* Login / User */}
            {loadingCustomer ? null : customer ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center justify-between"
                >
                  Hi, {customer.customer_name}
                  <span
                    className={`ml-2 transform transition-transform ${
                      userDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    &#9662;
                  </span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-black/90 border border-white/20 rounded-lg shadow-lg min-w-[120px] z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-white text-sm hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/customerlogin">Login</NavLink>
            )}
          </div>

          {/* Mobile Navigation */}

          <div
            className="md:hidden flex items-center space-x-2 relative"
            ref={userRef}
          >
            {loadingCustomer ? null : customer ? (
              <>
                {/* Customer name button */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 flex items-center justify-between"
                >
                  Hi, {customer.customer_name}
                  <span
                    className={`ml-2 transform transition-transform ${
                      userDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    &#9662;
                  </span>
                </button>

                {/* User dropdown (logout) same as desktop */}
                {userDropdownOpen && (
                  <div className="absolute top-full right-16 mt-2 bg-black/90 border border-white/20 rounded-lg shadow-lg min-w-[120px] z-50">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-white text-sm hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <NavLink to="/customerlogin">Login</NavLink>
            )}

            {/* Burger icon for menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}

        {isOpen && (
          <div className="md:hidden mt-2 bg-black/90 rounded-2xl border border-white/20 shadow-xl transition-all">
            <MobileLink to="/" close={() => setIsOpen(false)}>
              Home
            </MobileLink>

            <div ref={mobileSscRef}>
              <button
                onClick={() => setMobileSscOpen(!mobileSscOpen)}
                className="w-full text-left px-4 py-3 text-white text-base font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
              >
                SSC Sheet
                <span
                  className={`ml-2 transform transition-transform ${
                    mobileSscOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  &#9662;
                </span>
              </button>
              {mobileSscOpen && (
                <div className="pl-6">
                  <MobileLink
                    to="/sscsheet/math"
                    close={() => setIsOpen(false)}
                  >
                    Math
                  </MobileLink>
                  <MobileLink
                    to="/sscsheet/english"
                    close={() => setIsOpen(false)}
                  >
                    English
                  </MobileLink>
                  <MobileLink
                    to="/sscsheet/reasoning"
                    close={() => setIsOpen(false)}
                  >
                    Reasoning
                  </MobileLink>
                  <MobileLink to="/sscsheet/gk" close={() => setIsOpen(false)}>
                    GK
                  </MobileLink>
                </div>
              )}
            </div>
            <MobileLink to="/support" close={() => setIsOpen(false)}>
              Support
            </MobileLink>
          </div>
        )}
      </div>
    </header>
  );
};

// NavLink uses Next.js Link correctly for SPA navigation
const NavLink = ({ to, children }) => (
  <Link
    href={to}
    className="text-white hover:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:scale-105"
  >
    {children}
  </Link>
);

const DropdownLink = ({ to, children }) => (
  <Link
    href={to}
    className="block px-4 py-2 text-white text-sm hover:bg-white/10 transition-all duration-200"
  >
    {children}
  </Link>
);

const MobileLink = ({ to, children, close }) => (
  <Link
    href={to}
    onClick={(e) => {
      e.preventDefault();
      close();
      window.history.pushState({}, "", to); // SPA-like navigation
      window.dispatchEvent(new PopStateEvent("popstate"));
    }}
    className="block px-4 py-3 text-white text-base font-medium hover:bg-white/10 transition-all duration-300"
  >
    {children}
  </Link>
);

export default Navbar;
