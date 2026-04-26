import Link from "next/link";
import Nav from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main>
        <div className="notfound">
          <h1>404</h1>
          <p className="lede" style={{ margin: "0 auto 30px" }}>
            That tutorial doesn&rsquo;t exist (yet).
          </p>
          <Link href="/" className="btn primary">
            ← Back to all tutorials
          </Link>
        </div>
      </main>
    </>
  );
}
