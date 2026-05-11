import { MockTestCTA } from "../../components/CEECTA";
import { CEEFeatured } from "../../components/FeaturedSubjects";
import { Hero } from "../../components/Hero";
import { CEEAdvantages,  } from "../../components/PremiumBenefits";
import { CEEPricing } from "../../components/PremiumPlans";


export default function Home() {
  return (
    <>
      <Hero />
      <CEEFeatured />
      <CEEAdvantages />
      <CEEPricing />
     <MockTestCTA/>
    </>
  );
}