import TabTitle from "../../components/TabTitle/TabTitle";
import Navbar from "../../components/Navbar/Navbar";

export default function Index() {
  return (
    <>
      <TabTitle title="Home" />
      <Navbar currentPath="Home" />
      <main>
        <h1>Welcome to Moodify!</h1>
      </main>
    </>
  );
}
