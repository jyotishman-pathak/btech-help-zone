import { MockTestCTA } from "../../components/CEECTA";
import { CEEFeatured } from "../../components/FeaturedSubjects";
import { Hero } from "../../components/Hero";
import { CEEAdvantages } from "../../components/PremiumBenefits";
import { CEEPricing } from "../../components/PremiumPlans";
import { EliteDashboard } from "../../components/EliteDashboard";

export default function Home() {
  return (
    <div className="bg-[#090915]">
      <Hero />
      <CEEFeatured />
      <CEEAdvantages />
      <CEEPricing />
      <EliteDashboard />
      <MockTestCTA />
    </div>
  );
}