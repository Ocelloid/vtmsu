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

type SideNavProps = {
  links: SideNavLink[];
  onClick?: (link: string) => void;
  sideNavClass?: string;
  sideNavExtraClass?: string;
} & DefaultSideNavProps;
type DefaultSideNavProps = Partial<typeof defaultSideNavProps>;
const defaultSideNavProps = {
  sideNavClass: "hidden fixed sm:flex left-0 top-0 w-52 gap-8 px-4 pt-24",
};

type WithSideNavProps = SideNavProps & {
  children: string | JSX.Element | JSX.Element[];
  childrenClass?: string;
  sideNavExtraClass?: string;
} & DefaultWithSideNavProps;
type DefaultWithSideNavProps = Partial<typeof defaultWithSideNavProps>;
const defaultWithSideNavProps = {
  childrenClass: "[&>*]:-mb-16 [&>*]:w-full [&>*]:pt-24 px-4 pb-32 sm:ml-52",
};

const SideNavigation = (props: SideNavProps) => {
  return (
    <aside
      id="default-sidebar"
      className={`${props.sideNavClass} ${props.sideNavExtraClass} h-screen-translate-x-full z-40 flex flex-col transition-transform sm:translate-x-0`}
    >
      {props.links?.map((link, index) => (
        <Link
          onClick={() => {
            if (!!props.onClick) props.onClick(link.section);
          }}
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
};
SideNavigation.defaultProps = defaultSideNavProps;

export default SideNavigation;

const WithSideNavigation = (props: WithSideNavProps) => {
  return (
    <>
      <div className="flex flex-col">
        <SideNavigation
          links={props.links}
          onClick={props.onClick}
          sideNavClass={props.sideNavClass}
          sideNavExtraClass={props.sideNavExtraClass}
        />
      </div>
      <div
        className={`${props.childrenClass} flex max-w-[1280px] flex-col items-center justify-center`}
      >
        {props.children}
      </div>
    </>
  );
};
WithSideNavigation.defaultProps = defaultWithSideNavProps;

export { WithSideNavigation };
