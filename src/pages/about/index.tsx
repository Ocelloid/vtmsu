import Head from "next/head";
import Image from "next/image";
import vamp from "~/../public/vamp.jpg";
import camarilla from "~/../public/camarilla.jpg";
import nosferatu from "~/../public/nosferatu.jpg";
import anarchs from "~/../public/anarchs.jpg";
import { Element } from "react-scroll";
import {
  WithSideNavigation,
  type SideNavLink,
} from "~/components/SideNavigation";
import Link from "next/link";

export default function About() {
  const links: SideNavLink[] = [
    { title: "Описание игры", section: "description" },
    { title: "Создание персонажа", section: "character_creation" },
    { title: "Взнос", section: "entry_fee" },
    { title: "Домен", section: "domain" },
    { title: "Камарилья", section: "camarilla" },
    { title: "Анархи", section: "anarchs" },
    { title: "Шабаш", section: "sabbat" },
    { title: "Ссылки", section: "links" },
  ];
  return (
    <>
      <Head>
        <title>Об игре</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-row text-justify">
        <WithSideNavigation
          links={links}
          sideNavExtraClass="font-semibold"
          childrenClass="mt-24 [&>*]:w-full sm:ml-52 px-2 [&>*]:pt-4 bg-white/75 dark:bg-red-950/50 mb-2 mx-2 rounded-b-lg"
        >
          <Element className="section" name="description">
            <p className="pb-4 text-3xl">Ролевая игра живого действия</p>
            Игра занимает восемь дней, с 4 по 12 октября 2024 года, и проходит в
            нескольких локациях в городе Пермь, примерно в районе центра города.
            Есть несколько арендованных мест, несколько урбанистических и
            природных. Выезды за пределы основной игровой зоны на личном или
            арендованном мастерами транспорте. Если для каких бы то ни было
            локаций понадобятся сапоги, дождевики, каски, очки или иные средства
            защиты, перед событием проводимом в таком месте мы сообщим вам
            заранее дополнительно.
          </Element>
          <Element className="section" name="character_creation">
            <p className="pb-4 text-3xl">Создание персонажа</p>
            Персонажами могут быть только вампиры, клан можно выбрать в сетке
            ролей. Перед созданием персонажа свяжитесь со старейшиной клана и
            заполните анкету на сайте, через него же осуществляются виртуальные
            взаимодействия, учёт характеристик персонажа и многое другое. Если у
            клана нет старейшины - свяжитесь с Мастером по сюжету и попробуйте
            занять эту роль. Сейчас остались ещё три свободных позиции,
            присоединяйтесь. <br />
            <br />
            <Image alt="camarilla" src={vamp} />
            <br />
            На сервере в Дискорде мастерская группа проведёт обучающие созвоны
            для новичков.
          </Element>
          <Element className="section" name="entry_fee">
            <p className="pb-4 text-3xl">Взнос</p>
            <ul>
              <li>&bull; Май 2000</li>
              <li>&bull; Июнь 2250</li>
              <li>&bull; Июль 2500</li>
              <li>&bull; Август 2750</li>
              <li>&bull; Сентябрь 3000</li>
              <li>&bull; Октябрь бесценен :)</li>
            </ul>
            <br />С июня начинает работать скидка для иногородних 500 рублей.
            Взнос можно сдать, когда за вами занято место в сетке ролей.
          </Element>
          <Element className="section" name="domain">
            <p className="pb-4 text-3xl">Домен Молотов</p>
            Домен Молотов был основан 8 марта 1940 года, одновременно с
            переименованием города из Перми в Молотов. До этого момента, это был
            домен Анархов, барон которых перешёл на сторону Камарильи. Слухи о
            причинах этого поступка до сих пор будоражат умы местной либеральной
            интеллигенции. <br />
            <br />
            Домен Молотов - жемчужина Камарильи на территории Европы, последний
            оплот на пути азиатских варваров. Он стоит на пересечении торговых
            путей, являясь центром соприкосновения Азии и Европы. Здесь
            сталкиваются интересы различных глобальных геополитических сил
            Сородичей из разных сект. <br />
            <br />
            Управляет доменом князь Артур Нордан, предпочитающий называть себя
            Доном. Ему противостоит несколько стай Шабаша, приехавших в город
            накануне событий игры.
          </Element>
          <Element className="section" name="camarilla">
            <p className="pb-4 text-3xl">Камарилья</p>
            Это основополагающая фракция домена Молотов, поддерживающая традиции
            и протоколы. Князь домена Молотов, Дон Артур Нордан (Олег Уличев)
            является гарантом соблюдения традиций и определяет политику домена.
            <br />
            <br />
            <Image alt="camarilla" src={camarilla} />
            <br />
            Кланы Камарильи - это объединённые родственными связями Сородичи. В
            игре присутствуют 8 кланов:
            <ul>
              <li>&bull; Бруха</li>
              <li>&bull; Малкавиан</li>
              <li>&bull; Носферату</li>
              <li>&bull; Вентру</li>
              <li>&bull; Ассамит</li>
              <li>&bull; Гангрел</li>
              <li>&bull; Тореадор</li>
              <li>&bull; Тремер</li>
            </ul>
            <br />
            Каждый Клан стремится добиться своей собственной цели. Эту цель
            определяет старейшина Клана, являющийся идеологическим и
            политическим руководителем Клана. В обязанности старейшины входит
            воспитание культуры игры в своём клане, направление игроков своего
            клана по сюжетным линиям, менеджмент информации внутри клана, а
            также внешняя и внутренняя политика, выражаемая кланом.
            <br />
            <br />
            Старейшины кланов, Эмиссар Анархов, Архиепископ Шабаша занимают
            полуигротехническую роль с полной свободой воли. Помните, что эта
            роль требует большого количества личного времени, опыта и моральных
            сил. Если вы полны энтузиазма, сил, жедания помочь другим и опыта
            управления людьми - эта роль для вас.
            <p className="p-4 text-2xl">Бруха</p>
            <p className="pl-4">
              Клан воинов-поэтов, которые рады возможности высказать свои мысли,
              а затем подкрепить их делом. Проклятая ярость заставляет сородичей
              закипать, и лучше не оказываться у них на пути в этот момент.
              Глава клана: Матвей Фурман.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_brujah"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Малкавиан</p>
            <p className="pl-4">
              Это клан безумных Сородичей, к которым страшно поворачиваться
              спиной - а придётся - ведь для невидимки спина у тебя везде.
              Другие сородичи испытывают к ним отвращение и страх. Они с трудом
              справляются со своими тёмными зависимостями. Старейшина клана -
              нарколог, доктор Тоторович (Роман Новиков).
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_malkavian"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Носферату</p>
            <p className="pl-4">
              <Image alt="nosferatu" src={nosferatu} />
              <br />
              Это клан, внешний вид членов которого полностью отражает суть
              уродства окружающего вас мира Тьмы, поэтому, они с радостью готовы
              вам помочь в любых ваших не благих начинаниях. Старейшина Карл
              Модерах (Александр Кравчун).
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_nosferatu"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Вентру</p>
            <p className="pl-4">
              Вечность - это не просто сила. Сила составляет только одну часть
              мира Вентру, хотя это чрезвычайно важная часть. Вампиры из клана
              Вентру понимают, что сила имеет ценность только как средство
              достижения цели, а не сама цель. Таким образом, они используют
              свои огромные ресурсы, чтобы расширить свое влияние, все время
              наблюдая и выжидая подходящего момента для удара. Ибо в этом мире
              есть вещи и похуже вампиров, и вентру знают, что они -
              единственная надежда. Старейшина клана Алиса Гладких.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_ventrue"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Ассамит</p>
            <p className="pl-4">
              Это клан восточных сородичей, с которых совсем недавно было снято
              проклятье и которые стремятся возродить былое величие. Места
              старейшины клана свободно, всего в клане 6 свободных мест.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_assamite"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Гангрел</p>
            <p className="pl-4">
              Это клан звероподобных Сородичей, которым открыты секреты природы.
              Клан официально вышел из Камарильи, однако, в домене Молотов
              Старейшина остался в её составе. Место старейшины клана свободно,
              всего в клане 6 свободных мест.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_gangrel"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Тореадор</p>
            <p className="pl-4">
              Этот клан стремится сохранить чувство прекрасного в своём мёртвом
              сердце и находится под большой угрозой - известно, что на них было
              совершено несколько нападений. Место старейшины клана свободно,
              всего в клане 6 свободных мест.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_toreador"
            >
              Подробнее в книге клана
            </Link>
            <p className="p-4 text-2xl">Тремер</p>
            <p className="pl-4">
              Это сородичи, посвятившие свою вечность исследованию сокрытой
              изнанки этого мира. Старейшина клана Роман Любин.
            </p>
            <Link
              className="pl-4 text-xs underline"
              href="https://wod.su/vampire/book/clanbook_tremere"
            >
              Подробнее в книге клана
            </Link>
          </Element>
          <Element className="section" name="anarchs">
            <p className="pb-4 text-3xl">Анархи</p>
            <Image alt="anarchs" src={anarchs} />
            <br />
            В отличие от игроков Камарильи, которые действуют в основном в целях
            выполнения клановых квестов, игроки-анархи свободны участвовать в
            любых событиях игры, к которым смогут присоединиться. Для этого им
            нужно будет самостоятельно собирать информацию, не рассчитывая на
            чужую помощь.
            <br />
            <br />
            Они также не ограничены в общении и обмене информацией, которую они
            получают от других фракций. Точкой притяжения и лидером мнений среди
            анархов является Эмиссар - ему предстоит интерпретировать собранную
            информацию, и с этим Анархом считаются главы других фракций.
            <br />
            <br />
            Анархи могут быть из любых перечисленных кланов, осталось 11
            свободных мест.
            <p className="p-4 text-2xl">Независимые</p>
            <p className="pl-4">
              Вышедшие из борьбы между фракциями, эти сородичи заняты своим
              делом и редко вмешиваются в происходящее в домене. Места
              забронированы.
            </p>
          </Element>
          <Element className="section" name="sabbat">
            <p className="pb-4 text-3xl">Шабаш</p>
            Эта деструктивная и опасная группа сородичей стремится захватить
            домен Молотов и подчинить его своим правилам и взглядам. Архиепископ
            Артём Баторий выполняет роль духовного наставника и политического
            лидера. Во фракции 7 свободных мест. Отдельно общую вводную по
            шабашу вы можете прочитать в группе игры.
          </Element>
          <Element className="section pb-4" name="links">
            <p className="pb-4 text-3xl">Ссылки</p>
            Следующие ссылки, группы и серверы используются для официальной
            связи между игроками, с мастерской группой и регистрации на игре:
            Группа ВК Сервер в дискорде Сайт и личный кабинет игрока Сетка ролей
          </Element>
        </WithSideNavigation>
      </main>
    </>
  );
}
