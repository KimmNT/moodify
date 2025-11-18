import Navbar from "../../components/Navbar/Navbar";
import SongQuery from "./components/SongQuery/SongQuery";
import LyricGenerating from "./components/LyricGenerating/LyricGenerating";
import style from "./Lyrics.module.scss";

export default function Lyrics() {
  return (
    <>
      <Navbar currentPath="yeah" />
      <main className={style.PageContainer}>
        <div className={style.Content}>
          <SongQuery />
          <div className={style.Brick}></div>
          <LyricGenerating song="" />
        </div>
      </main>
    </>
  );
}
