import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div className="layout">
      <nav className="nav">
        <Link href="/" className="nav-brand">
          Narayan <span>Pharmacy</span>
        </Link>
        <Link
          href="/"
          className={`nav-link ${router.pathname === "/" ? "active" : ""}`}
        >
          Prescriptions
        </Link>
        <Link
          href="/new"
          className={`nav-link ${router.pathname === "/new" ? "active" : ""}`}
        >
          + New Prescription
        </Link>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}
