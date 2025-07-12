import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: July 9, 2025</p>

      <p>
        These Terms of Service ("Terms") govern your access to and use of our
        platform, which allows users to create instant video call rooms, instant
        chat rooms, conduct peer-to-peer file transfers, and build and share
        online forms (collectively, the "Service"). By creating an account or
        using any part of the Service you agree to be bound by these Terms and
        by our Privacy Policy. If you do not agree, you must not use the
        Service.
      </p>

      <h2 className="text-2xl font-semibold">1. Eligibility & Account Security</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You must be at least 13 years of age to use the Service.</li>
        <li>You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account.</li>
        <li>You agree to notify us immediately of any unauthorized use or
          security breach.</li>
      </ul>

      <h2 className="text-2xl font-semibold">2. Description of Service</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><span className="font-medium">Video &amp; Chat Rooms.</span> You can
          create real-time meeting rooms to communicate with other users. We do
          not record the audio or video streams unless you explicitly enable a
          recording feature (if offered).</li>
        <li><span className="font-medium">Peer-to-Peer File Transfer.</span>
          Files are relayed only for the duration of the transfer and are not
          stored permanently.</li>
        <li><span className="font-medium">Form Builder.</span> You may design
          custom forms and collect responses. You are solely responsible for the
          content of your forms and for obtaining any necessary consents from
          respondents.</li>
      </ul>

      <h2 className="text-2xl font-semibold">3. User Content</h2>
      <p>
        "User Content" means any data, files, text, images, or other materials
        that you transmit, upload, or create through the Service, including
        video streams, chat messages, transferred files, form templates, and
        form responses. You retain all ownership rights to your User Content but
        grant us a limited license to host, route, and transmit it as necessary
        to provide the Service.
      </p>

      <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
      <p>
        You agree not to use the Service to:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Violate any applicable law or regulation;</li>
        <li>Upload, share, or transmit content that is unlawful, harmful,
          harassing, defamatory, obscene, or otherwise objectionable;</li>
        <li>Infringe or misappropriate the intellectual property rights of
          others;</li>
        <li>Distribute malicious software or engage in phishing or other
          fraudulent activities;</li>
        <li>Interfere with or disrupt the integrity or performance of the
          Service or its underlying infrastructure;</li>
        <li>Attempt to reverse-engineer or circumvent any security measures.</li>
      </ul>

      <h2 className="text-2xl font-semibold">5. Prohibited Files & Data</h2>
      <p>
        You must not use the file-transfer or form-builder features to distribute
        or collect personal data that is subject to special protections (e.g.,
        health records, government-issued IDs) unless you have obtained legally
        sufficient consent and implemented appropriate safeguards.
      </p>

      <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
      <p>
        The Service, including all software, graphics, and trademarks, is owned
        by or licensed to the Company and is protected by intellectual property
        laws. Except for the limited rights expressly granted to you here, we
        reserve all rights in and to the Service.
      </p>

      <h2 className="text-2xl font-semibold">7. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at any time, with
        or without notice, for conduct that we believe violates these Terms or
        is otherwise harmful to other users or the Company.
      </p>

      <h2 className="text-2xl font-semibold">8. Disclaimer of Warranties</h2>
      <p>
        The Service is provided on an "as is" and "as available" basis without
        warranties of any kind, either express or implied, including but not
        limited to warranties of merchantability, fitness for a particular
        purpose, and non-infringement.
      </p>

      <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, the Company shall not be liable
        for any indirect, incidental, special, consequential, or punitive
        damages, or for any loss of profits or revenues, whether incurred
        directly or indirectly, or any loss of data, use, goodwill, or other
        intangible losses resulting from (a) your use or inability to use the
        Service; (b) any conduct or content of any third party on the Service;
        or (c) unauthorized access, use, or alteration of your transmissions or
        content.
      </p>

      <h2 className="text-2xl font-semibold">10. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless the Company and its
        affiliates from and against any claims, damages, obligations, losses,
        liabilities, costs, or debt arising from your use of the Service or
        violation of these Terms.
      </p>

      <h2 className="text-2xl font-semibold">11. Governing Law & Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the
        Company is established, without regard to conflict-of-law principles. Any
        dispute arising under these Terms will be resolved exclusively in the
        competent courts located in that jurisdiction.
      </p>

      <h2 className="text-2xl font-semibold">12. Changes to Terms</h2>
      <p>
        We may revise these Terms from time to time. When we do, we will update
        the “Last updated” date above and, for material changes, provide notice
        via the Service. Your continued use of the Service after the changes
        become effective means you accept the updated Terms.
      </p>

      <h2 className="text-2xl font-semibold">13. Contact</h2>
      <p>
        Questions about these Terms should be sent to {" "}
        <a href="mailto:support@example.com" className="text-primary underline">
          support@example.com
        </a>.
      </p>
    </div>
  );
} 