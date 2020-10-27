import Link from "next/link";

export default function IndexPage() {
  return (
    <div>
      Hello NextJS.{" "}
      <Link href="/about">
        <a>About</a>
      </Link>
    </div>
  );
}
