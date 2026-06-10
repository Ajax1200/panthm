import React from 'react';

const technologies = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Node.js', icon: '⬢' },
  { name: 'Python', icon: '🐍' },
  { name: 'TensorFlow', icon: '🧠' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Flutter', icon: '💙' },
  { name: 'Swift', icon: '🔶' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Solidity', icon: '⟠' },
  { name: 'TypeScript', icon: '🔷' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Kubernetes', icon: '☸️' },
  { name: 'GraphQL', icon: '◈' },
  { name: 'Firebase', icon: '🔥' },
];

const TechMarquee = () => {
  // Duplicate the list to create seamless infinite scroll
  const items = [...technologies, ...technologies];

  return (
    <section className="py-12 bg-white dark:bg-[#050505] overflow-hidden border-y border-slate-100 dark:border-white/5">
      <div className="wrapper mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Technologies We Master
        </p>
      </div>
      <div className="marquee-container" style={{ '--marquee-bg': '#ffffff', '--marquee-bg-dark': '#050505' }}>
        <div className="marquee-track">
          {items.map((tech, i) => (
            <div
              key={`${tech.name}-${i}`}
              className="flex items-center gap-3 px-8 py-3 mx-2 rounded-full border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-primary/30 dark:hover:border-primary/50 transition-colors group flex-shrink-0"
            >
              <span className="text-2xl" aria-hidden="true">{tech.icon}</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-primary transition-colors whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
