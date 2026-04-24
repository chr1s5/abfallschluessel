import Link from "next/link";

export function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner px">
        <Link href="/" className="nav-logo">
          avv.valeoro.net
          <span className="nav-logo-tld">.de</span>
        </Link>
        <div className="nav-links">
          <Link href="/katalog">Katalog</Link>
          <Link href="/wizard">Wizard</Link>
          <Link href="/bundesland">Bundesländer</Link>
          <Link href="/api-docs">API</Link>
        </div>
      </div>
    </nav>
  );
}
