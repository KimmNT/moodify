import TabTitle from "../../components/TabTitle/TabTitle";
import Navbar from "../../components/Navbar/Navbar";
import style from "./Jamjar.module.scss";
import { Link } from "@tanstack/react-router";

export default function Jamjar() {
  return (
    <>
      <TabTitle title="JamJar" />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>JamJar</h1>
        </div>

        <div className={style.PageContent}>
          <Link to="/jamjar/notes">Note</Link>
          <Link to="/jamjar/chords">Chords</Link>
          <Link to="/jamjar/jamspace">JamSpace</Link>
        </div>
      </main>
    </>
  );
}
