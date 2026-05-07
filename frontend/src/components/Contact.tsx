const ContactPage = () => {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px",
          fontFamily: "Arial, sans-serif",
          lineHeight: 1.6,
          color: "#111",
        }}
      >
        <h1>Contact Us</h1>
  
        <p>
          If you have questions about our services, policies, website, or submitted
          inquiries, please contact us using the information below.
        </p>
  
        <section style={{ marginTop: "30px" }}>
          <h2>Business Information</h2>
  
          <p>
            <strong>[Business Name]</strong>
          </p>
  
          <p>
            Email: [Business Email]
            <br />
            Phone: [Business Phone]
          </p>
        </section>
  
        <section style={{ marginTop: "30px" }}>
          <h2>Business Hours</h2>
  
          <p>
            Monday – Friday: [Business Hours]
            <br />
            Saturday: [Business Hours]
            <br />
            Sunday: Closed
          </p>
        </section>
  
        <section style={{ marginTop: "30px" }}>
          <h2>Response Times</h2>
  
          <p>
            We make reasonable efforts to respond to inquiries in a timely manner.
            Response times may vary depending on inquiry volume, business hours,
            holidays, and service availability.
          </p>
        </section>
  
        <section style={{ marginTop: "30px" }}>
          <h2>Service Areas</h2>
  
          <p>
            [Insert Cities, States, Regions, or “Nationwide” if applicable]
          </p>
        </section>
      </main>
    );
  };
  
  export default ContactPage;