import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();
  return (
    <>
      {!router.asPath.includes("game") && <div className="mb-6" />}
      <div
        className={`${router.asPath.includes("game") ? "hidden" : "fixed"} bottom-0 flex h-6 w-full flex-col justify-between bg-slate-950 px-12 py-1 text-slate-400`}
      >
        <a
          href="https://ocelloid.com"
          target="_blank"
          className="ml-auto text-xs"
        >
          © Ocelloid 2024
        </a>
      </div>
    </>
  );
}
