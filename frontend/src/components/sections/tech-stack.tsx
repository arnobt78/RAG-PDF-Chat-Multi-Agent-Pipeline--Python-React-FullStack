/**
 * TechStackSection Component
 *
 * Technologies by category with:
 * - Gradient-framed category icons (distinct colors)
 * - Per-card opacity ease-in-out + in-card badge staircase
 * - RAG pipeline footer with icon + matching fade
 */

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Code2, Server, Brain, Database, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

type TechEntry = { name: string; description: string };

type TechCategory = {
  name: string;
  icon: LucideIcon;
  /** Tailwind gradient for icon ring */
  color: string;
  techs: TechEntry[];
};

const techCategories: TechCategory[] = [
  {
    name: "Frontend",
    icon: Code2,
    color: "from-sky-500 to-indigo-500",
    techs: [
      { name: "React", description: "UI Library" },
      { name: "TypeScript", description: "Type Safety" },
      { name: "Tailwind CSS", description: "Styling" },
      { name: "Framer Motion", description: "Animations" },
      { name: "Vite", description: "Build Tool" },
    ],
  },
  {
    name: "Backend",
    icon: Server,
    color: "from-emerald-500 to-teal-500",
    techs: [
      { name: "FastAPI", description: "Web Framework" },
      { name: "Python", description: "Language" },
      { name: "Uvicorn", description: "ASGI Server" },
      { name: "Pydantic", description: "Validation" },
    ],
  },
  {
    name: "AI & ML",
    icon: Brain,
    color: "from-fuchsia-500 to-violet-600",
    techs: [
      { name: "LangChain", description: "LLM Framework" },
      { name: "OpenRouter", description: "API Gateway" },
      { name: "GPT-4o Mini", description: "Language Model" },
      { name: "Embeddings", description: "Text Vectors" },
    ],
  },
  {
    name: "Data",
    icon: Database,
    color: "from-amber-500 to-rose-500",
    techs: [
      { name: "FAISS", description: "Vector Store" },
      { name: "PyPDF", description: "PDF Parser" },
      { name: "RAG", description: "Architecture" },
    ],
  },
];

const TECH_CATEGORY_COUNT = techCategories.length;

/**
 * Card entrance: opacity ease-in-out (reliable cross-browser). Clip-path was
 * leaving some builds fully clipped / invisible. Badges stagger after fade.
 */
const techCardRevealVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    y: 14,
    transition: {
      type: "tween",
      duration: 0.55,
      delay: (TECH_CATEGORY_COUNT - 1 - index) * 0.05,
      ease: [0.45, 0, 0.55, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 1.15,
      delay: index * 0.1,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
};

const techBadgeListVariants = {
  hidden: {},
  visible: (cardIndex: number) => ({
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.62 + cardIndex * 0.06,
    },
  }),
};

const techBadgeItemVariants = {
  hidden: {
    opacity: 1,
    x: -10,
    y: 4,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const ragPipelineFooterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

function TechCategoryCard({
  category,
  index,
}: {
  category: TechCategory;
  index: number;
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardRef, {
    once: false,
    amount: 0.12,
    margin: "0px 0px 18% 0px",
  });

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={techCardRevealVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="min-w-0 rounded-[20px]"
    >
      <GlassCard variant="hover" padding="lg" className="h-full">
        <GlassCardContent>
          <div className="mb-6 flex items-center gap-4">
            <motion.div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} p-[1px] shadow-lg shadow-black/25`}
              whileHover={{ scale: 1.06, rotate: 4 }}
              transition={{ type: "spring", stiffness: 320 }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[11px] border border-white/10 bg-slate-950/80 backdrop-blur-sm">
                <category.icon className="h-6 w-6 text-white" />
              </div>
            </motion.div>
            <h3 className="text-xl font-semibold text-white">
              {category.name}
            </h3>
          </div>

          <motion.div
            custom={index}
            variants={techBadgeListVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex min-w-0 flex-wrap gap-2"
          >
            {category.techs.map((tech) => (
              <motion.div key={tech.name} variants={techBadgeItemVariants}>
                <Badge
                  variant="outline"
                  className="cursor-default transition-colors hover:bg-transparent"
                >
                  <span className="font-medium">{tech.name}</span>
                  <span className="ml-1 text-slate-300">
                    • {tech.description}
                  </span>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}

export function TechStackSection() {
  return (
    <SectionWrapper id="tech-stack">
      <div className="mb-8 text-center md:mb-10 xl:mb-12">
        <ScrollReveal direction="up">
          <h2 className="heading-2 mb-4 text-white">
            Built With <span className="gradient-text">Modern Tech</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.08}>
          <p className="body-large mx-auto max-w-3xl">
            A carefully selected stack for performance, developer experience,
            and scalability
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 sm:gap-6 sm:px-0">
        {techCategories.map((category, categoryIndex) => (
          <TechCategoryCard
            key={category.name}
            category={category}
            index={categoryIndex}
          />
        ))}
      </div>

      <motion.div
        variants={ragPipelineFooterVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3, margin: "0px 0px 14% 0px" }}
        className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left"
      >
        <Workflow
          className="h-5 w-5 shrink-0 text-sky-400 sm:mt-0.5"
          aria-hidden
        />
        <p className="text-sm text-white/90">
          <span className="font-medium text-white/95">Full RAG pipeline:</span>{" "}
          PDF → Chunks → Embeddings → Vector Store → Retrieval → LLM → Response
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
