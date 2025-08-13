import React, { useEffect, useState } from 'react'
import logo from "../../assets/Logo/Logo-Full-Light.png"
import { Link, matchPath } from 'react-router-dom'
import { NavbarLinks } from "../../data/navbar-links"
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineShoppingCart, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import ProfileDropdown from "../core/Auth/ProfileDropDown"
import { apiConnector } from '../../services/apiConnectorFixed'
import { categories } from '../../services/apis'
import { BsChevronDown } from "react-icons/bs"
import { ACCOUNT_TYPE } from "../../utils/constants"

const Navbar = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)

  // State for mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // State for catalog dropdown toggle on mobile
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div className="border-b-[1px] border-b-richblack-700 bg-richblack-900">
      <div className="flex h-14 w-11/12 max-w-maxContent items-center justify-between mx-auto">
        {/* Logo */}
        <Link to="/">
          <img src={logo} width={160} height={32} loading="lazy" alt="Logo" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex">
          <ul className="flex gap-x-6 text-richblack-25 items-center">
            {NavbarLinks.map((link, index) => (
              <li key={index} className="relative">
                {link.title === "Catalog" ? (
                  <div
                    className={`group flex cursor-pointer items-center gap-1 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : "text-richblack-25"
                    }`}
                  >
                    <p>{link.title}</p>
                    <BsChevronDown />
                    {/* Dropdown */}
                    <div className="invisible absolute left-[50%] top-full z-[1000] w-[200px] translate-x-[-50%] translate-y-2 flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-1.5 group-hover:opacity-100 lg:w-[300px]">
                      <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                      {loading ? (
                        <p className="text-center">Loading...</p>
                      ) : subLinks?.length ? (
                        subLinks.map((subLink, i) => (
                          <Link
                            key={i}
                            to={`/catalog/${subLink.name
                              .split(" ")
                              .join("-")
                              .toLowerCase()}`}
                            className="block rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50"
                          >
                            {subLink.name}
                          </Link>
                        ))
                      ) : (
                        <p className="text-center">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Right Side (Cart/Profile/Login) */}
        <div className="hidden md:flex items-center gap-x-4">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <>
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Sign up
                </button>
              </Link>
            </>
          )}
          {token !== null && <ProfileDropdown />}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-richblack-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <AiOutlineClose fontSize={28} />
          ) : (
            <AiOutlineMenu fontSize={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-richblack-900 border-t border-richblack-700">
          <ul className="flex flex-col gap-y-4 p-4 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index} className="relative">
                {link.title === "Catalog" ? (
                  <>
                    <button
                      onClick={() => setCatalogDropdownOpen(!catalogDropdownOpen)}
                      className={`flex w-full items-center justify-between rounded px-2 py-2 text-left ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                      aria-expanded={catalogDropdownOpen}
                    >
                      {link.title}
                      <BsChevronDown
                        className={`ml-2 transition-transform duration-300 ${
                          catalogDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {catalogDropdownOpen && (
                      <div className="mt-2 flex flex-col gap-2 pl-4">
                        {loading ? (
                          <p>Loading...</p>
                        ) : subLinks?.length ? (
                          subLinks.map((subLink, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="block rounded py-1 px-2 hover:bg-richblack-700"
                              onClick={() => setMobileMenuOpen(false)} // close mobile menu on click
                            >
                              {subLink.name}
                            </Link>
                          ))
                        ) : (
                          <p>No Courses Found</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={link?.path}
                    onClick={() => setMobileMenuOpen(false)} // close mobile menu on click
                  >
                    <p
                      className={`px-2 py-2 rounded ${
                        matchRoute(link?.path)
                          ? "text-yellow-25 bg-richblack-700"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}

            {/* Mobile cart/profile/login/signup */}
            <li className="border-t border-richblack-700 pt-4 mt-4 flex flex-col gap-3">
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link
                  to="/dashboard/cart"
                  className="relative px-2 py-2 inline-flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                  {totalItems > 0 && (
                    <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-xs font-bold text-yellow-100">
                      {totalItems}
                    </span>
                  )}
                  <span className="ml-2">Cart</span>
                </Link>
              )}
              {token === null && (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100 text-left">
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100 text-left">
                      Sign up
                    </button>
                  </Link>
                </>
              )}
              {token !== null && <ProfileDropdown />}
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}

export default Navbar
