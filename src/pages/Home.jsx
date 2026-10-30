import Hero from '../components/home/Hero.jsx';
import SeasonDial from '../components/home/SeasonDial.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import Packages from '../components/home/Packages.jsx';
import Gallery from '../components/home/Gallery.jsx';
import ServiceArea from '../components/home/ServiceArea.jsx';
import Faq from '../components/home/Faq.jsx';
import Reviews from '../components/home/Reviews.jsx';
import FinalCta from '../components/home/FinalCta.jsx';

/* Section order (unique to this site): Hero → Season dial → How it works → Packages → Gallery → Service area → FAQ → Reviews → Final CTA */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <SeasonDial />
      <HowItWorks />
      <Packages />
      <Gallery />
      <ServiceArea />
      <Faq />
      <Reviews />
      <FinalCta />
    </main>
  );
}
