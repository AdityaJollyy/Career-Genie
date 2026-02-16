import { stats } from "@/data/stats";
import React from "react";

function StatsSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <h3 className="text-4xl font-bold">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
