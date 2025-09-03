import style from "./Logo.module.scss";
import { Link } from "@tanstack/react-router";

export default function Logo() {
  return (
    <Link to="/" className={style.LogoContainer}>
      Moodify
    </Link>
  );
}
