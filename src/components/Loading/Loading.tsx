import style from "./Loading.module.scss";

export default function Loading() {
  return (
    <div className={style.LoadingContainer}>
      <div className={style.Loader}></div>
      <div className={style.LoadingText}>Loading...</div>
    </div>
  );
}
