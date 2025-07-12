import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: July 9, 2025</p>

      <p>
        Welcome to our platform that enables users to create instant video call
        rooms, instant chat rooms, conduct peer-to-peer file transfers, and
        build sharable forms (collectively, the "Service"). Your privacy is
        important to us. This policy explains what information we collect, how
        we use it, and the choices you have. By using the Service you agree to
        this Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <span className="font-medium">Account Information.</span> When you
          register, we collect your name, email address and password (stored as
          a cryptographic hash).
        </li>
        <li>
          <span className="font-medium">Usage Metadata.</span> We store
          non-content metadata such as meeting room IDs, timestamps, duration,
          approximate participant count, file sizes, and form IDs to operate
          the Service.
        </li>
        <li>
          <span className="font-medium">Content Data.</span> • <em>Video &amp;
          Audio</em>: Streams are delivered via WebRTC and are <strong>never
          recorded or stored</strong> by default. • <em>Chat Messages</em>: Text
          messages are end-to-end encrypted in transit and are deleted 30 days
          after room closure. • <em>File Transfer</em>: Files are exchanged
          peer-to-peer; we do not permanently store their contents. •
          <em>Form Builder</em>: We host the forms you create and the responses
          you collect until you delete them or your account.
        </li>
        <li>
          <span className="font-medium">Device &amp; Log Information.</span> We
          automatically collect your IP address, browser type, operating system
          and crash logs to maintain security and troubleshoot issues.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold">2. How We Use Information</h2>
      <p>
        We use the collected information to:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide, maintain and improve the Service functions described above.</li>
        <li>Authenticate users and secure meeting rooms.</li>
        <li>Facilitate real-time communications and peer-to-peer connections.</li>
        <li>Respond to inquiries, provide customer support, and send important notices.</li>
        <li>Monitor, detect, and prevent fraud, abuse, and security incidents.</li>
        <li>Comply with legal obligations and enforce our Terms of Service.</li>
      </ul>

      <h2 className="text-2xl font-semibold">3. Cookies & Tracking Technologies</h2>
      <p>
        We employ first-party cookies and local storage to keep you signed in
        and remember your preferences. We do not use third-party advertising
        cookies.
      </p>

      <h2 className="text-2xl font-semibold">4. When We Share Information</h2>
      <p>
        We only share your information:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>With service providers such as TURN servers or analytics platforms that help us deliver the core functionality.</li>
        <li>When required by law or to protect the rights, property, or safety of our users or others.</li>
        <li>With your consent or at your direction.</li>
      </ul>

      <h2 className="text-2xl font-semibold">5. Data Retention</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account data is retained until you delete your account.</li>
        <li>Meeting metadata logs are kept for up to 12 months for security and troubleshooting.</li>
        <li>Chat messages are automatically purged 30 days after a room ends.</li>
        <li>Files exchanged peer-to-peer are <strong>not stored</strong> on our servers; temporary relay data is deleted within minutes of transfer completion.</li>
        <li>Forms and their responses persist until you delete them or close your account.</li>
      </ul>

      <h2 className="text-2xl font-semibold">6. Security</h2>
      <p>
        We implement industry-standard security measures, including TLS for all
        traffic, encryption of data in transit, and strict access controls.
        Despite our efforts, no method of transmission over the internet or
        electronic storage is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold">7. Your Rights & Choices</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access,
        correct, export, or delete your personal information. You can exercise
        these rights through your account settings or by contacting us.
      </p>

      <h2 className="text-2xl font-semibold">8. International Transfers</h2>
      <p>
        Our servers may be located outside of your jurisdiction. By using the
        Service you consent to the transfer of your information to countries
        that may have data-protection laws different from those in your
        country.
      </p>

      <h2 className="text-2xl font-semibold">9. Children’s Privacy</h2>
      <p>
        The Service is not directed to children under 13. We do not knowingly
        collect personal information from children. If we learn we have done so
        we will delete that data immediately.
      </p>

      <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
      <p>
        We may revise this Privacy Policy from time to time. We will notify you
        of material changes by email or an in-app notice and update the “Last
        updated” date above.
      </p>

      <h2 className="text-2xl font-semibold">11. Contact Us</h2>
      <p>
        For questions about this Privacy Policy, please email
        {" "}
        <a
          href="mailto:privacy@example.com"
          className="text-primary underline"
        >
          privacy@example.com
        </a>
        .
      </p>
    </div>
  );
} 