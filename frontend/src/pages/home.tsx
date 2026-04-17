/**
 * Home Page
 *
 * Landing page showcasing the RAG PDF Chat application.
 * Includes all feature sections with scroll-reveal animations.
 *
 * Each imported section is a self-contained marketing block — reorder here to change the story.
 */

import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PipelineSection,
  ModelsSection,
  TechStackSection,
  CTASection,
} from "@/components/sections";

export function HomePage() {
  return (
    <PageWrapper showBackground showFooter className="w-full overflow-x-clip">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PipelineSection />
      <ModelsSection />
      <TechStackSection />
      <CTASection />
    </PageWrapper>
  );
}

export default HomePage;
