const stats = [
  { value: "5,000+", label: "Suits Crafted" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Premium Fabrics" },
  { value: "12", label: "Countries Served" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-primary mb-1">{stat.value}</p>
              <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
