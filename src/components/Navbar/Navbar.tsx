import style from "./Navbar.module.scss";
import { Link } from "@tanstack/react-router";
import navbarData from "../../db/navbar.json";
import Logo from "../Logo/Logo";

export default function Navbar() {
  const currentPath = window.location.pathname;

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
      </nav>
    </main>
  );
}
