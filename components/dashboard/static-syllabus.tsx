"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Atom, Microscope, Calculator, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";

const STATIC_SYLLABUS = [
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "text-indigo-600 dark:text-indigo-400",
    light: "bg-indigo-50 dark:bg-indigo-900/20",
    topics: [
      "Physical World and Measurement",
      "Kinematics",
      "Laws of Motion",
      "Work, Energy and Power",
      "Motion of System of Particles and Rigid Body",
      "Gravitation",
      "Properties of Bulk Matter",
      "Thermodynamics",
      "Behavior of Perfect Gas and Kinetic Theory",
      "Oscillations and Waves",
      "Electrostatics",
      "Current Electricity",
      "Magnetic Effects of Current and Magnetism",
      "Electromagnetic Induction and Alternating Currents",
      "Electromagnetic Waves",
      "Optics",
      "Dual Nature of Matter and Radiation",
      "Atoms and Nuclei",
      "Electronic Devices",
      "Communication Systems"
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: Microscope,
    color: "text-emerald-600 dark:text-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-900/20",
    topics: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure",
      "States of Matter: Gases and Liquids",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Hydrogen",
      "s-Block Elements (Alkali and Alkaline earth metals)",
      "Some p-Block Elements",
      "Organic Chemistry - Some Basic Principles and Techniques",
      "Hydrocarbons",
      "Environmental Chemistry",
      "Solid State",
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements",
      "p-Block Elements",
      "d and f Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Organic Compounds Containing Nitrogen",
      "Biomolecules",
      "Polymers",
      "Chemistry in Everyday Life"
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "text-orange-600 dark:text-orange-400",
    light: "bg-orange-50 dark:bg-orange-900/20",
    topics: [
      "Sets, Relations and Functions",
      "Complex Numbers and Quadratic Equations",
      "Matrices and Determinants",
      "Permutations and Combinations",
      "Mathematical Induction",
      "Binomial Theorem and its Simple Applications",
      "Sequences and Series",
      "Limit, Continuity and Differentiability",
      "Integral Calculus",
      "Differential Equations",
      "Coordinate Geometry",
      "Three Dimensional Geometry",
      "Vector Algebra",
      "Statistics and Probability",
      "Trigonometry",
      "Mathematical Reasoning"
    ]
  }
];

export function StaticSyllabus() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(STATIC_SYLLABUS[0].id);

  return (
    <div className="bg-[#F7F5FF] dark:bg-[#0D0B1A] min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 rounded-tl-3xl shadow-inner border-l border-slate-200/70 dark:border-slate-700/50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Assam CEE Syllabus
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              The official syllabus for the Assam Common Entrance Examination (CEE) 2026-27. Based on the AHSEC guidelines for Physics, Chemistry, and Mathematics.
            </p>
          </div>
          
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-2 py-1.5 px-3">
            <AlertCircle className="w-4 h-4" /> 
            <span>Latest Official Pattern</span>
          </Badge>
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {STATIC_SYLLABUS.map((sub) => {
            const Icon = sub.icon;
            const isExpanded = expandedSubject === sub.id;

            return (
              <Card 
                key={sub.id} 
                className={`rounded-2xl border-slate-200/70 dark:border-slate-700/50 transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? "bg-white dark:bg-[#12101F] shadow-lg ring-1 ring-slate-200 dark:ring-slate-800" 
                    : "bg-white/60 dark:bg-[#12101F]/60 hover:bg-white dark:hover:bg-[#12101F] shadow-sm hover:shadow-md cursor-pointer"
                }`}
              >
                <CardHeader 
                  className={`pb-4 ${!isExpanded ? "cursor-pointer" : ""}`}
                  onClick={() => !isExpanded && setExpandedSubject(sub.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${sub.light}`}>
                        <Icon className={`w-6 h-6 ${sub.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {sub.name}
                        </CardTitle>
                        <CardDescription className="text-slate-500 mt-1 font-medium">
                          {sub.topics.length} chapters
                        </CardDescription>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSubject(isExpanded ? null : sub.id);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto md:ml-0"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <CardContent className="pt-0 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0D0B1A]/30">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1 p-4">
                          {sub.topics.map((topic, index) => (
                            <div 
                              key={index}
                              className="group flex items-start gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                            >
                              <div className="flex items-center justify-center shrink-0 w-6 h-6 mt-0.5">
                                <BookOpen className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white block transition-colors duration-200">
                                  <span className="text-slate-400 mr-2 text-xs font-mono">{index + 1}.</span>
                                  {topic}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
