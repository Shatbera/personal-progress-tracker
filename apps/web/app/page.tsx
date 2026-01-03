import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Personal Progress Tracker</h1>
      <p><Link href="/quests">Browse Quests</Link></p>
    </main>
  );
}
