/**
 * TechStackSection Component
 * 
 * Showcase of technologies used in the project.
 * Organized by category: Frontend, Backend, AI, Database
 */

import { motion } from "framer-motion";
import { Code2, Server, Brain, Database } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

// Tech stack data with categories
const techCategories = [
  {
    name: "Frontend",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
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
    color: "from-green-500 to-emerald-500",
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
    color: "from-purple-500 to-pink-500",
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
    color: "from-orange-500 to-amber-500",
    techs: [
      { name: "FAISS", description: "Vector Store" },
      { name: "PyPDF", description: "PDF Parser" },
      { name: "RAG", description: "Architecture" },
    ],
  },
];

export function TechStackSection() {
  return (
    <SectionWrapper id="tech-stack">
      {/* Section Header */}
      <ScrollReveal direction="up" className="text-center mb-16">
        <h2 className="heading-2 text-white mb-4">
          Built With <span className="gradient-text">Modern Tech</span>
        </h2>
        <p className="body-large max-w-2xl mx-auto">
          A carefully selected stack for performance, developer experience, and scalability
        </p>
      </ScrollReveal>

      {/* Tech Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techCategories.map((category, categoryIndex) => (
          <ScrollReveal
            key={category.name}
            direction={categoryIndex % 2 === 0 ? "left" : "right"}
            delay={categoryIndex * 0.1}
          >
            <GlassCard variant="hover" padding="lg" className="h-full">
              <GlassCardContent>
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {category.techs.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: techIndex * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Badge
                        variant="outline"
                        className="hover:bg-white/10 transition-colors cursor-default"
                      >
                        <span className="font-medium">{tech.name}</span>
                        <span className="ml-1 text-slate-500">
                          • {tech.description}
                        </span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>

      {/* Architecture diagram hint */}
      <ScrollReveal direction="up" delay={0.4}>
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Full RAG pipeline: PDF → Chunks → Embeddings → Vector Store → Retrieval → LLM → Response
          </p>
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}
