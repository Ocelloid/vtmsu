import React from "react";
import { Link } from "react-scroll";

export type SideNavLink = {
  title: string;
  section: string;
  duration?: number;
} & DefaultSideNavLink;
type DefaultSideNavLink = Partial<typeof defaultSideNavLink>;
const defaultSideNavLink = {
  duration: 1000,
};
type SideNavProps = { links: SideNavLink[] };
type WithSideNavProps = SideNavProps & {
  children: string | JSX.Element | JSX.Element[];
};

export default function SideNavigation(props: SideNavProps) {
  return (
    <aside
      id="default-sidebar"
      className="fixed left-0 top-0 z-40 flex h-screen w-64 -translate-x-full flex-col gap-8 px-4 pt-24 transition-transform sm:translate-x-0"
    >
      {props.links?.map((link, index) => (
        <Link
          key={`sidenavlink_${index}`}
          activeClass="active"
          className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
          to={link.section}
          spy
          smooth
          duration={link.duration}
        >
          {link.title}
        </Link>
      ))}
    </aside>
  );
}

export function WithSideNavigation(props: WithSideNavProps) {
  return (
    <>
      <div className="flex flex-col">
        <SideNavigation links={props.links} />
      </div>
      <div className="flex max-w-[1280px] flex-col items-center justify-center px-4 pb-32 sm:ml-48 [&>*]:-mb-16 [&>*]:w-full [&>*]:pt-24">
        {props.children}
      </div>
    </>
  );
}
