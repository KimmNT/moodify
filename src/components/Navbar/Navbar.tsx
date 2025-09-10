import style from "./Navbar.module.scss";
import { Link } from "@tanstack/react-router";
import navbarData from "../../db/navbar.json";
import Logo from "../Logo/Logo";
import { LucideCircleArrowUp, MenuIcon } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const currentPath = window.location.pathname;
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className={style.PageContainer}>
      <nav className={style.NavContainer}>
        <Logo />
        <div className={style.NavLinks}>
          {navbarData.nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                currentPath === item.path ? style.ActiveLink : style.NavLink
              }
            >
              {item.name}
            </Link>
          ))}
        </div>
        <MenuIcon
          className={style.NavMobileIcon}
          onClick={() => setIsNavOpen(!isNavOpen)}
        />
        {isNavOpen && (
          <div className={style.NavMobileLinksContainer}>
            <LucideCircleArrowUp
              className={style.Icon}
              onClick={() => setIsNavOpen(false)}
            />
            <div className={style.NavMobileLinks}>
              {navbarData.nav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    currentPath === item.path ? style.ActiveLink : style.NavLink
                  }
                  onClick={() => setIsNavOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </main>
  );
}
