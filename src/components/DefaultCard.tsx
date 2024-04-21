import React from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/router";
import { FaRubleSign } from "react-icons/fa6";

type DefaultCardProps = {
  to?: string;
  image?: string | StaticImageData;
  price?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
} & DefaultCardDefaultProps;
type DefaultCardDefaultProps = Partial<typeof defaultCardDefaultProps>;
const defaultCardDefaultProps = {
  className: "h-60 w-40 md:h-80 md:w-56",
};

const DefaultCard = ({
  to,
  image,
  price,
  title,
  subtitle,
  description,
  className,
}: DefaultCardProps) => {
  const router = useRouter();

  return (
    <div
      className={`${className} group mt-16 flex cursor-pointer flex-col rounded-2xl bg-red-200 dark:bg-red-950`}
      onClick={() => {
        if (!!to) void router.replace(to);
      }}
    >
      <div className="relative h-[45%] rounded-2xl">
        <Image
          src={image ?? ""}
          width={256}
          height={256}
          className="absolute -top-8 left-1/2 h-auto w-40 -translate-x-1/2 -rotate-6 rounded-2xl duration-300 group-hover:rotate-0 md:w-48"
          alt="product image"
        />
      </div>
      <div className="relative h-[55%] rounded-b-2xl bg-red-100 p-1 text-red-950">
        {!!price && (
          <p className="absolute bottom-0 right-3 flex flex-row text-2xl font-semibold">
            {price} <FaRubleSign size={20} className="mt-[.325rem]" />
          </p>
        )}
        <div className="flex flex-col gap-1 text-center">
          {!!title && <h6 className="text-xl font-bold">{title}</h6>}
          {!!subtitle && <h4 className="text-md font-semibold">{subtitle}</h4>}
        </div>
        <div className="max-w-3/4 m-auto mt-1 hidden md:flex">
          {!!description && (
            <p className="px-1 text-justify text-xs font-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

DefaultCard.defaultProps = defaultCardDefaultProps;

export default DefaultCard;
