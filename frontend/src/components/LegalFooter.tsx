import "../styles/LegalFooter.css";

function LegalFooter({
  organization
}
:
{
  organization : any;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h2>{organization ? organization.displayName : null}</h2>
          <p>
            This website is operated by {organization ? organization.displayName : null}. Information submitted
            through this site is used to review your inquiry and contact you about
            possible real estate services.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer legal links">
          <a href="/realestate/privacy-policy">Privacy Policy</a>
          <a href="/realestate/terms-of-use">Terms of Use</a>
          <a href="/realestate/real-estate-disclaimer">Real Estate Disclaimer</a>
          <a href="/realestate/accessibility">Accessibility</a>
          <a href="/realestate/contact">Contact</a>
          <a href="/realestate/admin">Portal</a>
        </nav>

        <div className="footer-disclaimers">
          <p>
            <strong>No legal, financial, tax, or foreclosure advice:</strong>{" "}
            Information on this website is for general informational purposes only.
            Submitting a form does not create an attorney-client, financial advisor,
            lender, broker-client, or agency relationship unless separately agreed in writing.
          </p>

          <p>
            <strong>No guarantee of outcome:</strong>{" "}
            We do not guarantee that any property will sell, that foreclosure can be
            stopped, that a cash offer will be made, or that any specific result will occur.
          </p>

          <p>
            <strong>Information accuracy:</strong>{" "}
            Property, foreclosure, loan, and contact information submitted through this
            site is provided by the user and may require independent verification.
          </p>

          <p>
            <strong>Privacy notice:</strong>{" "}
            By submitting information, you consent to being contacted by phone, email,
            or text regarding your inquiry. Message/data rates may apply. You may opt out
            of non-essential communications at any time.
          </p>

          <p>
            <strong>Third-party services:</strong>{" "}
            This site may use third-party hosting, email, analytics, storage, CRM, or
            automation providers to process inquiries and operate the service.
          </p>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {organization ? organization.displayName : null}. All rights reserved. Website system
            powered by Griffin Managed Web Solutions.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LegalFooter;
