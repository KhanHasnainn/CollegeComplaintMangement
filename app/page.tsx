import { getSession } from '@/lib/auth';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { StatisticsSection } from '@/components/landing/StatisticsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ComplaintPreview } from '@/components/landing/ComplaintPreview';
import { DepartmentsSection } from '@/components/landing/DepartmentsSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <LandingNavbar user={session} />
      <main className="flex-1">
        <LandingHero user={session} />
        <TrustStrip />
        <StatisticsSection />
        <FeaturesSection />
        <HowItWorks />
        <ComplaintPreview />
        <DepartmentsSection />
        <SecuritySection />
        <LandingCTA user={session} />
      </main>
      <LandingFooter />
    </div>
  );
}
