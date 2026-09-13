import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  ShieldCheck,
  Smartphone,
  CloudSun,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Your Village",
    description:
      "Your Gram Panchayat registers the village on GramVartha and creates its digital village space.",
    icon: MapPin,
    image: "/illustrations/f1.webp",
    width: 680,
    height: 680,
  },
  {
    number: "02",
    title: "Admin & Official Access",
    description:
      "Panchayat administrators and authorised officials get access to manage notices, schemes and complaints.",
    icon: ShieldCheck,
    image: "/illustrations/f2.webp",
    width: 450,
    height: 430,
  },
  {
    number: "03",
    title: "Download GramVartha",
    description:
      "Villagers download the GramVartha app to access their village information anytime, anywhere.",
    icon: Download,
    image: "/mainscreen.webp",
    width: 640,
    height: 1261,
  },
  {
    number: "04",
    title: "Explore Village Services",
    description:
      "Access QR-based notices, complaints, Work Guide, government schemes and the Scheme Assistant.",
    icon: Smartphone,
    image: "/notice.webp",
    width: 640,
    height: 1261,
  },
  {
    number: "05",
    title: "Stay Informed",
    description:
      "Get important village updates, weather advisories and useful information directly through GramVartha.",
    icon: CloudSun,
    image: "/comp.webp",
    width: 640,
    height: 1261,
  },
];

const HowItWorks = () => {
  const [active, setActive] = useState(2);
  const [direction, setDirection] = useState("next");

  const goTo = (index, dir = "next") => {
    setDirection(dir);
    setActive(index);
  };

  const next = () => {
    setDirection("next");
    setActive((prev) => (prev + 1) % steps.length);
  };

  const previous = () => {
    setDirection("prev");
    setActive((prev) => (prev - 1 + steps.length) % steps.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("next");
      setActive((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = steps[active];
  const CurrentIcon = current.icon;

  return (
    <section
      id="how-it-works"
      className="
        relative
        overflow-hidden
        bg-[#fdf6f2]
        px-4
        py-14
        sm:px-6
        sm:py-18
        md:px-8
        md:py-20
        lg:px-12
        lg:py-24
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-[220px]
          w-[220px]
          rounded-full
          bg-primary-100/30
          blur-[40px]
          sm:blur-[80px]
          sm:h-[300px]
          sm:w-[300px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-10
          h-[250px]
          w-[250px]
          rounded-full
          bg-primary-100/25
          blur-[45px]
          sm:blur-[90px]
          sm:h-[350px]
          sm:w-[350px]
        "
      />

      <div className="relative mx-auto max-w-7xl">

        {/* =====================================================
            HEADING
        ====================================================== */}

        <div className="mx-auto max-w-3xl text-center">

          <p
            className="
              mb-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary-500
              sm:mb-4
              sm:text-[10px]
            "
          >
            How it works
          </p>

          <h2
            className="
              font-display
              text-[30px]
              font-extrabold
              leading-[1.05]
              tracking-[-0.04em]
              text-text-primary
              sm:text-4xl
              md:text-5xl
              lg:text-5xl
            "
          >
            One village.
            <br />
            <span className="text-primary-400">
              One connected journey.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-[330px]
              text-xs
              leading-5
              text-text-muted
              sm:max-w-xl
              sm:text-sm
              sm:leading-6
              md:text-base
            "
          >
            From your Panchayat's first registration to everyday
            communication with villagers.
          </p>
        </div>

        {/* =====================================================
            JOURNEY NAVIGATION
        ====================================================== */}

        <div
          className="
            relative
            mx-auto
            mt-8
            max-w-5xl
            sm:mt-10
          "
        >

          {/* Desktop journey line */}
          <div
            className="
              absolute
              left-[7%]
              right-[7%]
              top-[20px]
              hidden
              h-px
              bg-primary-200
              md:block
            "
          />

          {/* Desktop progress */}
          <div
            className="
              absolute
              left-[7%]
              top-[19px]
              hidden
              h-[3px]
              rounded-full
              bg-primary-400
              transition-[width]
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              md:block
            "
            style={{
              width: `${(active / (steps.length - 1)) * 86}%`,
            }}
          />

          {/* Mobile progress line */}
          <div
            className="
              absolute
              left-[10%]
              right-[10%]
              top-[17px]
              h-px
              bg-primary-200
              md:hidden
            "
          />

          <div className="relative flex items-start justify-between">

            {steps.map((step, index) => {
              const isActive = index === active;
              const isPast = index < active;

              return (
                <button
                  key={step.number}
                  onClick={() =>
                    goTo(index, index > active ? "next" : "prev")
                  }
                  className="
                    group
                    flex
                    w-[20%]
                    flex-col
                    items-center
                    text-center
                    outline-none
                  "
                >
                  {/* Point */}
                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition-[transform,background-color,border-color,color,box-shadow]
                      duration-500
                      sm:h-10
                      sm:w-10
                      ${
                        isActive
                          ? "scale-110 border-text-primary bg-text-primary text-white shadow-[0_7px_18px_rgba(61,32,24,0.15)]"
                          : isPast
                          ? "border-primary-400 bg-primary-400 text-white"
                          : "border-primary-200 bg-[#fdf6f2] text-text-light group-hover:border-primary-400 group-hover:text-primary-500"
                      }
                    `}
                  >
                    {isPast ? (
                      <Check
                        size={13}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <span className="text-[9px] font-bold sm:text-[10px]">
                        {step.number}
                      </span>
                    )}
                  </div>

                  {/* Desktop labels */}
                  <span
                    className={`
                      mt-3
                      hidden
                      max-w-[120px]
                      text-[10px]
                      font-semibold
                      leading-4
                      transition-colors
                      duration-500
                      sm:block
                      ${
                        isActive
                          ? "text-text-primary"
                          : "text-text-light group-hover:text-text-secondary"
                      }
                    `}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            MAIN JOURNEY CARD
        ====================================================== */}

        <div
          key={`${active}-${direction}`}
          className="
            relative
            mx-auto
            mt-8
            max-w-6xl
            animate-how-slide
            sm:mt-10
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[1.5rem]
              border
              border-primary-100
              bg-white
              shadow-sm
              sm:rounded-[2rem]
              sm:shadow-[0_20px_60px_rgba(61,32,24,0.07)]
            "
          >

            {/* =================================================
                MOBILE / DESKTOP GRID
            ================================================== */}

            <div
              className="
                grid
                grid-cols-1
                lg:min-h-[430px]
                lg:grid-cols-[0.85fr_1.15fr]
              "
            >

              {/* =================================================
                  LEFT CONTENT
              ================================================== */}

              <div
                className="
                  relative
                  z-20
                  flex
                  flex-col
                  justify-center
                  px-6
                  py-7
                  sm:px-10
                  sm:py-9
                  md:px-12
                  md:py-10
                  lg:px-12
                  lg:py-12
                "
              >

                {/* Step label */}
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    animate-how-text
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-primary-400
                    "
                  />

                  <span
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-text-light
                      sm:text-[9px]
                    "
                  >
                    Step {current.number} of 05
                  </span>
                </div>

                {/* Giant number */}
                <div
                  className="
                    mt-3
                    font-display
                    text-[56px]
                    font-black
                    leading-[0.75]
                    tracking-[-0.08em]
                    text-primary-50
                    animate-how-number
                    sm:text-[75px]
                    md:text-[85px]
                    lg:text-[100px]
                  "
                >
                  {current.number}
                </div>

                {/* Icon */}
                <div
                  className="
                    mt-4
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-500
                    animate-how-text
                    sm:h-10
                    sm:w-10
                    sm:rounded-2xl
                  "
                >
                  <CurrentIcon
                    size={17}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3
                  className="
                    mt-3
                    max-w-xl
                    font-display
                    text-[22px]
                    font-extrabold
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-text-primary
                    animate-how-text
                    sm:text-3xl
                    md:text-4xl
                    lg:text-4xl
                  "
                >
                  {current.title}
                </h3>

                {/* Underline */}
                <div
                  className="
                    mt-3
                    h-1
                    w-9
                    rounded-full
                    bg-primary-400
                    animate-how-text
                    sm:mt-4
                  "
                />

                {/* Description */}
                <p
                  className="
                    mt-3
                    max-w-md
                    text-xs
                    leading-5
                    text-text-muted
                    animate-how-text
                    sm:mt-4
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  {current.description}
                </p>

                {/* Bottom indicator */}
                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2.5
                    animate-how-text
                    sm:mt-6
                    sm:gap-3
                  "
                >
                  <span className="text-[10px] font-semibold text-text-secondary">
                    {current.number}
                  </span>

                  <div className="h-px w-9 bg-primary-200 sm:w-12" />

                  <span className="text-[9px] text-text-light sm:text-[10px]">
                    GramVartha journey
                  </span>
                </div>
              </div>

              {/* =================================================
                  RIGHT VISUAL
              ================================================== */}

              <div
                className="
                  relative
                  flex
                  min-h-[260px]
                  items-center
                  justify-center
                  overflow-hidden
                  bg-primary-50
                  sm:min-h-[300px]
                  lg:min-h-[430px]
                "
              >

                {/* Organic circle */}
                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[210px]
                    w-[210px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-primary-100
                    sm:h-[290px]
                    sm:w-[290px]
                    lg:h-[360px]
                    lg:w-[360px]
                  "
                />

                {/* Inner circle */}
                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[155px]
                    w-[155px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    border
                    border-white/80
                    sm:h-[220px]
                    sm:w-[220px]
                    lg:h-[280px]
                    lg:w-[280px]
                  "
                />

                {/* Decorative number */}
                <span
                  className="
                    absolute
                    right-5
                    top-4
                    font-display
                    text-6xl
                    font-black
                    leading-none
                    tracking-[-0.08em]
                    text-white/60
                    sm:right-6
                    sm:top-5
                    sm:text-8xl
                  "
                >
                  {current.number}
                </span>

                {/* Main image */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    p-5
                    animate-how-image
                    sm:p-7
                  "
                >
                  <img
                    src={current.image}
                    alt=""
                    width={current.width}
                    height={current.height}
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      max-h-[210px]
                      max-w-[62%]
                      object-contain
                      drop-shadow-sm
                      sm:drop-shadow-[0_20px_25px_rgba(61,32,24,0.16)]
                      animate-how-float
                      sm:max-h-[280px]
                      sm:max-w-[65%]
                      lg:max-h-[340px]
                    "
                  />
                </div>

                {/* Location badge */}
                <div
                  className="
                    absolute
                    bottom-4
                    left-4
                    z-20
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-white/70
                    bg-white/85
                    px-2.5
                    py-1.5
                    text-[8px]
                    font-semibold
                    text-text-secondary
                    shadow-sm
                    backdrop-blur-md
                    sm:bottom-5
                    sm:left-5
                    sm:px-3
                    sm:py-2
                    sm:text-[9px]
                  "
                >
                  <MapPin size={10} />
                  Your village
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTROLS
        ====================================================== */}

        <div
          className="
            mx-auto
            mt-5
            flex
            max-w-6xl
            items-center
            justify-between
            sm:mt-6
          "
        >

          {/* Previous */}
          <button
            onClick={previous}
            aria-label="Previous step"
            className="
              group
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              text-text-muted
              transition-colors
              duration-300
              hover:text-text-primary
              sm:gap-2
              sm:text-xs
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-primary-100
                bg-white
                transition-[transform,border-color,box-shadow]
                duration-300
                group-hover:-translate-x-1
                group-hover:border-primary-200
                group-hover:shadow-sm
                sm:h-9
                sm:w-9
              "
            >
              <ChevronLeft size={14} />
            </span>

            <span className="hidden sm:block">
              Previous
            </span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() =>
                  goTo(index, index > active ? "next" : "prev")
                }
                aria-label={`Go to step ${index + 1}`}
                className={`
                  h-1.5
                  rounded-full
                  transition-[width,background-color]
                  duration-500
                  ${
                    index === active
                      ? "w-7 bg-primary-400 sm:w-9"
                      : "w-1.5 bg-primary-200 hover:bg-primary-300"
                  }
                `}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Next step"
            className="
              group
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              text-text-muted
              transition-colors
              duration-300
              hover:text-text-primary
              sm:gap-2
              sm:text-xs
            "
          >
            <span className="hidden sm:block">
              Next
            </span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-text-primary
                text-white
                transition-[transform,box-shadow]
                duration-300
                group-hover:translate-x-1
                group-hover:shadow-md
                sm:h-9
                sm:w-9
              "
            >
              <ChevronRight size={14} />
            </span>
          </button>
        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}

        <div
          className="
            mx-auto
            mt-9
            max-w-2xl
            text-center
            sm:mt-12
          "
        >
          <p
            className="
              font-display
              text-sm
              font-semibold
              tracking-tight
              text-text-secondary
              sm:text-base
              md:text-lg
            "
          >
            From Panchayat
            <span className="mx-2 text-primary-400">
              →
            </span>
            to every villager.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
