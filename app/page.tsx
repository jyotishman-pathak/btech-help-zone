import { FeaturedSubjects } from "../components/FeaturedSubjects";
import { Hero } from "../components/Hero";
import { PremiumBenefits } from "../components/PremiumBenefits";
import { PremiumPlans } from "../components/PremiumPlans";


export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedSubjects />
      <PremiumBenefits />
      <PremiumPlans />
      {/* Mock test teaser can be added here */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold">Ready to Ace Your Exams?</h2>
          <p className="mt-2 text-lg opacity-90">Join 20,000+ students using mock tests with admin-controlled access codes.</p>
          <div className="mt-6 flex justify-center gap-4">
            <button className="rounded-full bg-white px-6 py-2 font-semibold text-blue-600 shadow-md hover:shadow-lg transition">
              Get Free Access
            </button>
            <button className="rounded-full border border-white px-6 py-2 font-semibold hover:bg-white/10 transition">
              View Premium Plans
            </button>
          </div>
        </div>
      </section>
    </>
  );
}