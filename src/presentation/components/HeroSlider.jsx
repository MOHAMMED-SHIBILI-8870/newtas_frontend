import { useEffect, useState } from "react";

const slides = [
  "https://images.unsplash.com/photo-1506929113675-b9299d39bb14?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80",
];

const HeroSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {slides.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={img}
            className="w-full h-full object-cover scale-105 animate-[zoom_20s_infinite]"
            alt="dest"
          />
        </div>
      ))}

      <div className="relative z-20 text-center px-4 max-w-5xl">
        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[1.1]">
          Plan Your <span className="text-orange-400">Dream</span> <br /> Journey
        </h1>
        <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-medium">
          Create personalized trips based on your budget and travel style.
        </p>

        <div className="hidden md:flex backdrop-blur-2xl bg-white/10 border border-white/20 p-3 rounded-[2.5rem] items-center gap-2 max-w-3xl mx-auto shadow-2xl">
          <div className="flex-1 px-6 text-left border-r border-white/20">
            <label className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">
              Location
            </label>
            <input
              className="bg-transparent w-full text-white outline-none text-sm placeholder:text-slate-300"
              placeholder="Where to?"
            />
          </div>
          <div className="flex-1 px-6 text-left border-r border-white/20">
            <label className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">
              Dates
            </label>
            <p className="text-white text-sm cursor-pointer">Add dates</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
