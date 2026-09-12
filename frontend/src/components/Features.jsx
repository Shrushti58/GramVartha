import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  ShieldCheck,
  Smartphone,
  CloudSun,
  Users,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Your Village",
    description:
      "Your Gram Panchayat registers the village on GramVartha and creates its digital village space.",
    icon: MapPin,
    image: "/illustrations/panchayat-removebg-preview.png",
  },
  {
    number: "02",
    title: "Admin & Official Access",
    description:
      "Panchayat administrators and authorised officials get access to manage notices, schemes and complaints.",
    icon: ShieldCheck,
    image: "/illustrations/panchayat-removebg-preview.png",
  },
  {
    number: "03",
    title: "Download GramVartha",
    description:
      "Villagers download the GramVartha app to access their village information anytime, anywhere.",
    icon: Download,
    image: "/mainscreen.png",
  },
  {
    number: "04",
    title: "Explore Village Services",
    description:
      "Access QR-based notices, complaints, Work Guide, government schemes and the Scheme Assistant.",
    icon: Smartphone,
    image: "/notice.png",
  },
  {
    number: "05",
    title: "Stay Informed",
    description:
      "Get important village updates, weather advisories and useful information directly through GramVartha.",
    icon: CloudSun,
    image: "/comp.png",
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
        px-5
        py-24
        sm:px-8
        lg:px-12
        lg:py-32
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-32
          h-[400px]
          w-[400px]
          rounded-full
          bg-primary-100/30
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-10
          h-[450px]
          w-[450px]
          rounded-full
          bg-primary-100/25
          blur-[130px]
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* =====================================================
            HEADING
        ====================================================== */}

        <div className="mx-auto max-w-3xl text-center">
          <p
            className="
              mb-5
              text-[11px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-primary-500
              animate-how-text
            "
          >
            How it works
          </p>

          <h2
            className="
              font-display
              text-4xl
              font-extrabold
              leading-[1.05]
              tracking-[-0.04em]
              text-text-primary
              sm:text-5xl
              lg:text-6xl
              animate-how-text
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
              mt-6
              max-w-xl
              text-sm
              leading-7
              text-text-muted
              sm:text-base
              animate-how-text
            "
          >
            From your Panchayat's first registration to everyday
            communication with villagers.
          </p>
        </div>

        {/* =====================================================
            JOURNEY NAVIGATION
        ====================================================== */}

        <div className="relative mx-auto mt-16 max-w-5xl">
          {/* Journey line */}

          <div className="absolute left-[7%] right-[7%] top-[24px] hidden h-px bg-primary-200 md:block" />

          {/* Active progress */}

          <div
            className="
              absolute
              left-[7%]
              top-[23px]
              hidden
              h-[3px]
              rounded-full
              bg-primary-400
              transition-all
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              md:block
            "
            style={{
              width: `${(active / (steps.length - 1)) * 86}%`,
            }}
          />

          {/* Step points */}

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
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition-all
                      duration-500
                      ${
                        isActive
                          ? "scale-110 border-text-primary bg-text-primary text-white shadow-[0_8px_25px_rgba(61,32,24,0.18)]"
                          : isPast
                          ? "border-primary-400 bg-primary-400 text-white"
                          : "border-primary-200 bg-[#fdf6f2] text-text-light group-hover:border-primary-400 group-hover:text-primary-500"
                      }
                    `}
                  >
                    {isPast ? (
                      <Check size={16} strokeWidth={2.5} />
                    ) : (
                      <span className="text-xs font-bold">
                        {step.number}
                      </span>
                    )}
                  </div>

                  {/* Label */}

                  <span
                    className={`
                      mt-4
                      hidden
                      max-w-[120px]
                      text-[11px]
                      font-semibold
                      leading-4
                      transition-all
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
            mt-14
            max-w-6xl
            animate-how-slide
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              border
              border-primary-100
              bg-white
              shadow-[0_30px_100px_rgba(61,32,24,0.08)]
            "
          >
            <div className="grid min-h-[570px] lg:grid-cols-[0.85fr_1.15fr]">
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
                  px-7
                  py-12
                  sm:px-12
                  sm:py-16
                  lg:px-16
                  lg:py-20
                "
              >
                {/* Small label */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    animate-how-text
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-primary-400
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-text-light
                    "
                  >
                    Step {current.number} of 05
                  </span>
                </div>

                {/* Giant number */}

                <div
                  className="
                    mt-7
                    font-display
                    text-[90px]
                    font-black
                    leading-[0.75]
                    tracking-[-0.08em]
                    text-primary-50
                    sm:text-[120px]
                    lg:text-[135px]
                    animate-how-number
                  "
                >
                  {current.number}
                </div>

                {/* Icon */}

                <div
                  className="
                    mt-8
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary-50
                    text-primary-500
                    animate-how-text
                  "
                >
                  <CurrentIcon size={20} strokeWidth={2} />
                </div>

                {/* Heading */}

                <h3
                  className="
                    mt-6
                    max-w-xl
                    font-display
                    text-3xl
                    font-extrabold
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-text-primary
                    sm:text-4xl
                    lg:text-5xl
                    animate-how-text
                  "
                >
                  {current.title}
                </h3>

                {/* Underline */}

                <div
                  className="
                    mt-6
                    h-1
                    w-12
                    rounded-full
                    bg-primary-400
                    animate-how-text
                  "
                />

                {/* Description */}

                <p
                  className="
                    mt-6
                    max-w-md
                    text-sm
                    leading-7
                    text-text-muted
                    sm:text-base
                    animate-how-text
                  "
                >
                  {current.description}
                </p>

                {/* Bottom mini indicator */}

                <div
                  className="
                    mt-10
                    flex
                    items-center
                    gap-3
                    animate-how-text
                  "
                >
                  <span className="text-xs font-semibold text-text-secondary">
                    {current.number}
                  </span>

                  <div className="h-px w-16 bg-primary-200" />

                  <span className="text-xs text-text-light">
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
                  min-h-[350px]
                  items-center
                  justify-center
                  overflow-hidden
                  bg-primary-50
                  lg:min-h-[570px]
                "
              >
                {/* Organic circles */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[280px]
                    w-[280px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-primary-100
                    sm:h-[380px]
                    sm:w-[380px]
                    lg:h-[470px]
                    lg:w-[470px]
                  "
                />

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
                    border
                    border-white/80
                    sm:h-[290px]
                    sm:w-[290px]
                    lg:h-[360px]
                    lg:w-[360px]
                  "
                />

                {/* Decorative number */}

                <span
                  className="
                    absolute
                    right-8
                    top-8
                    font-display
                    text-8xl
                    font-black
                    leading-none
                    tracking-[-0.08em]
                    text-white/60
                    sm:text-9xl
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
                    p-8
                    animate-how-image
                    sm:p-12
                  "
                >
                  <img
                    src={current.image}
                    alt=""
                    className="
                      max-h-[300px]
                      max-w-[72%]
                      object-contain
                      drop-shadow-[0_30px_35px_rgba(61,32,24,0.18)]
                      animate-how-float
                      sm:max-h-[390px]
                      lg:max-h-[440px]
                    "
                  />
                </div>

                {/* Floating location badge */}

                <div
                  className="
                    absolute
                    bottom-7
                    left-7
                    z-20
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/70
                    bg-white/85
                    px-4
                    py-2.5
                    text-[10px]
                    font-semibold
                    text-text-secondary
                    shadow-sm
                    backdrop-blur-md
                  "
                >
                  <MapPin size={13} />
                  Your village
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTROLS
        ====================================================== */}

        <div className="mx-auto mt-8 flex max-w-6xl items-center justify-between">
          {/* Previous */}

          <button
            onClick={previous}
            aria-label="Previous step"
            className="
              group
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-text-muted
              transition-colors
              duration-300
              hover:text-text-primary
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-primary-100
                bg-white
                transition-all
                duration-300
                group-hover:-translate-x-1
                group-hover:border-primary-200
                group-hover:shadow-sm
              "
            >
              <ChevronLeft size={17} />
            </span>

            <span className="hidden sm:block">
              Previous
            </span>
          </button>

          {/* Center progress */}

          <div className="flex items-center gap-2">
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
                  transition-all
                  duration-500
                  ${
                    index === active
                      ? "w-10 bg-primary-400"
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
              gap-2
              text-xs
              font-semibold
              text-text-muted
              transition-colors
              duration-300
              hover:text-text-primary
            "
          >
            <span className="hidden sm:block">
              Next
            </span>

            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-text-primary
                text-white
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:shadow-md
              "
            >
              <ChevronRight size={17} />
            </span>
          </button>
        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}

        <div
          className="
            mx-auto
            mt-20
            max-w-2xl
            text-center
          "
        >
          <p
            className="
              font-display
              text-lg
              font-semibold
              tracking-tight
              text-text-secondary
              sm:text-xl
            "
          >
            From Panchayat
            <span className="mx-2 text-primary-400">→</span>
            to every villager.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;