import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import './App.css'
import IngestionPage from './components/IngestionPage';
import AdminLogin from './components/AdminLogin';
import Admin from './components/Admin';
import Gratitude from './components/Gratitude';
import { useEffect, useState } from 'react';
import { getOrganizationByName } from './components/middleware/organization';
import LegalFooter from './components/LegalFooter';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import RealEstateDisclaimer from './components/RealEstateDisclaimer';
import AccessibilityStatement from './components/AccessibilityStatement';
import ContactPage from './components/Contact';

function App() {
  const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
          const getorganization = async () => {
              const protoorganization = await getOrganizationByName("test");
              console.log(protoorganization)
              setOrganization(protoorganization);
  
              return;
          }; 
          
          getorganization();
          console.log(BASE_URL);
  }, [])

  useEffect(() => {
    const isBrowserFullscreen = () => {
        return (
            window.outerWidth === screen.availWidth &&
            window.outerHeight === screen.availHeight
        );
    };

    const setHeight = () => {
        const height = window.visualViewport?.height ?? window.innerHeight;

        console.log(height);

        document.documentElement.style.setProperty("--app-height", `${height}px`);
    };
  
    const setWidth = () => {
        const width = window.visualViewport?.width ?? window.innerWidth;

        console.log(width);

        document.documentElement.style.setProperty("--app-width", `${width}px`);
    };
  
    setHeight();
    setWidth();

    function handleViewportChange() {
        // Let mobile Chrome finish resizing after orientation/UI changes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeight();
            setWidth();
          });
        });
      }
  
    screen.orientation.addEventListener("change", (event) => {
        handleViewportChange();
    });

    document.addEventListener("fullscreenchange", () => {
      handleViewportChange();
      console.log("fullscreen")
    });

    let previousFullscreen = isBrowserFullscreen();

    window.addEventListener("resize", () => {
      const currentFullscreen = isBrowserFullscreen();
  
      if (currentFullscreen !== previousFullscreen) {
          previousFullscreen = currentFullscreen;
          console.log("browser fullscreen changed");
          handleViewportChange();
      }
    });
  }, []);

  return (
    <>
      <BrowserRouter basename='/realestate'>
        <Routes>
                <>
                    <Route path="/" element={<Navigate to="/service" />} />
                    <Route path="/:serviceParam" element={<IngestionPage />} />
                    <Route path="/gratitude" element={<Gratitude />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/real-estate-disclaimer" element={<RealEstateDisclaimer />} />
                    <Route path="/accessibility" element={<AccessibilityStatement />} />
                    <Route path="/contact" element={<ContactPage />} />
                </>
        </Routes>
        <LegalFooter organization={organization}/>
      </BrowserRouter>
    </>
  )
}

export default App
