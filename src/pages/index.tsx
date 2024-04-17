import Head from "next/head";
import DefaultCard from "~/components/DefaultCard";
import about from "~/../public/about.png";
import rules from "~/../public/rules.png";
import shop from "~/../public/shop.png";

export default function Home() {
  const links = [
    {
      title: "Об игре",
      subtitle: "Информация об игре",
      to: "/about",
      image: about,
    },
    {
      title: "Правила",
      subtitle: "Как играть",
      to: "/rules",
      image: rules,
    },
    {
      title: "Магазин",
      subtitle: "Игровой мерч",
      to: "/shop",
      image: shop,
    },
  ];

  return (
    <>
      <Head>
        <title>Маскарад Вампиров</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 pt-24 text-justify ">
          <h1 className="flex flex-col items-center justify-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Маскарад
            <span className="text-[hsla(0,100%,50%,75%)]">Вампиров</span>
          </h1>
          <p>
            Вот уже много веков люди живут в этом мире, не подозревая о том, что
            происходит в их городах после захода солнца. Однако каждый человек
            подсознательно пытается укрыться в своём уютном мирке и вздрагивает,
            видя неясные силуэты проступающие во тьме. После заката город
            наполняется совсем другими созданиями... Созданиями, для которых
            люди - всего лишь пища.
          </p>
          <p>
            Мир - не такой, как вы думаете. С небоскрёбов горгульи созерцают
            отрыжку заводского дыма и улицы, наполненные человеческим стадом, на
            которых скрываются вещи, недоступные нашему взору. Существа, живущие
            в тени, сокрыты от нас. Они смотрят на нас и видят добычу в наших
            телах и душах. Мы привыкли считать это ложью… Но наши опасения не
            надуманны.
          </p>
          <p>
            Они реальны. В своих убежищах просыпаются вампиры и выходят на
            тёмные улицы городов, терзаемые жаждой крови. За городом и в парках
            слышится ужасающий вой оборотней. А в темноте — тихий шелест
            пробуждающегося зла. Весь мир всего лишь полигон, на котором ведутся
            бесчисленные бои.
          </p>
          <p>
            Этому миру тьмы и посвящена наша ролевая игра. На ней вы сможете
            погрузиться в него и примерить на себя маску одного из этих существ.
          </p>
        </div>
        <div className="container grid grid-cols-1 gap-8 px-4 pb-8 text-justify sm:grid-cols-3 md:pb-2">
          {links.map((link, i) => (
            <DefaultCard
              className="mx-auto h-40 w-52 md:h-36 md:w-56"
              {...link}
              key={i}
            />
          ))}
        </div>
      </main>
    </>
  );
}
