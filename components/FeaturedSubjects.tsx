"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Cpu, Zap, Car, Microscope, Network, Ruler } from "lucide-react";
import { motion } from "framer-motion";

const subjects = [
  { name: "Computer Science", icon: Cpu, papers: 342, color: "blue" },
  { name: "Electronics & Comm", icon: Zap, papers: 287, color: "indigo" },
  { name: "Mechanical Engg", icon: Car, papers: 415, color: "green" },
  { name: "Civil Engg", icon: Ruler, papers: 298, color: "orange" },
  { name: "Information Tech", icon: Network, papers: 364, color: "purple" },
  { name: "Electrical Engg", icon: Microscope, papers: 276, color: "red" },
];

const colorMap = {
  blue: "from-blue-500 to-blue-600",
  indigo: "from-indigo-500 to-indigo-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
};

export function FeaturedSubjects() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured <span className="text-blue-600">Subjects</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Branch-wise, semester-wise organized content for all major engineering streams.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, idx) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[subject.color as keyof typeof colorMap]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <subject.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  <CardDescription>{subject.papers}+ PYQs & Notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Semester 1-8 • Handwritten & digital notes available</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}