import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const lastUpdated = "June 20, 2026";

const sections = [
  {
    title: "Information We Collect",
    body: [
      "GramVartha collects only the information required to provide village governance, notice, complaint, suggestion, notification, scheme, work guide, and village service features.",
    ],
    items: [
      "Name, phone number, user ID, and village information.",
      "Complaint and suggestion details submitted by users.",
      "Complaint photos uploaded by users as supporting evidence.",
      "Location information only when a user chooses to submit a complaint with location attached.",
      "Push notification token used to send app notifications.",
      "Device information required for app functionality, security, compatibility, and troubleshooting.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use collected information to operate GramVartha and provide the services requested by citizens, village administrators, and officials.",
    ],
    items: [
      "To display village notices and government scheme information.",
      "To submit, manage, review, and respond to complaints and suggestions.",
      "To attach photos and optional location context to complaint records.",
      "To send push notifications about notices, complaint updates, service updates, and important village information.",
      "To improve app reliability, security, performance, and user experience.",
      "To prevent misuse, unauthorized access, fraud, and technical issues.",
    ],
  },
  {
    title: "Permissions Used",
    body: [
      "GramVartha asks for permissions only when they are required for a feature the user chooses to use.",
    ],
    items: [
      "Camera: to scan QR codes and capture complaint photos.",
      "Photos/Gallery: to allow users to upload complaint photos.",
      "Location: to attach location when a user submits a complaint with location.",
      "Notifications: to receive notices, complaint updates, and service alerts.",
      "Internet: to connect the app with GramVartha services.",
    ],
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell personal information. Information may be shared only as needed to provide GramVartha services or comply with legal requirements.",
    ],
    items: [
      "Complaint information may be visible to authorized village administrators or officials responsible for resolving the issue.",
      "Village information may be used to show relevant notices, schemes, work guides, and services.",
      "Service providers may process limited technical data on our behalf for hosting, notifications, storage, analytics, security, or app functionality.",
      "Information may be disclosed if required by law, regulation, court order, or government authority.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We retain information only for as long as necessary to provide GramVartha services, maintain official complaint and notice records, meet legal requirements, resolve disputes, and improve platform security.",
      "Complaint records, photos, and related location details may be retained while the complaint is active and for a reasonable period after closure for audit, governance, or service quality purposes.",
    ],
  },
  {
    title: "Account Deletion",
    body: [
      "Users may request account deletion by contacting GramVartha at gramvartha@gmail.com. Please include the registered phone number, village information, and any details needed to identify the account.",
      "After verifying the request, we will delete or anonymize personal information unless retention is required for legal, safety, dispute resolution, official record, fraud prevention, or governance purposes.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "GramVartha is intended for village governance and public service access. It is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.",
      "If a parent or guardian believes that a child has provided personal information, they may contact us and we will take reasonable steps to delete the information where appropriate.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and organizational measures to protect information against unauthorized access, misuse, alteration, or loss. However, no internet or mobile service can guarantee absolute security.",
      "Users should keep their account details secure and contact GramVartha if they suspect unauthorized activity.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements, or operational practices. The latest version will be posted on this page with an updated Last Updated date.",
    ],
  },
];

const summaryItems = [
  "View village notices",
  "File complaints and suggestions",
  "Upload complaint photos",
  "Attach location to complaints when selected",
  "Receive push notifications",
  "Access government schemes, work guides, and village services",
];

const setMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | GramVartha";
    setMetaTag(
      "description",
      "Privacy Policy for GramVartha, a village governance platform for notices, complaints, suggestions, photos, optional location, notifications, schemes, work guides, and village services."
    );
    setMetaTag("robots", "index, follow");
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-300">
      <Navbar />

      <main>
        <section className="bg-mist-gradient dark:bg-dark-surface-gradient border-b border-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-4xl">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
              >
                <span aria-hidden="true">&larr;</span>
                Back to GramVartha
              </Link>

              <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-300">
                Legal and Data Protection
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary dark:text-dark-text-primary leading-tight">
                Privacy Policy
              </h1>
              <p className="mt-5 text-base sm:text-lg text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                This Privacy Policy explains how GramVartha collects, uses, shares, retains, and protects information when citizens and officials use our village governance platform.
              </p>
              <p className="mt-5 inline-flex items-center rounded-full border border-primary-200 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 px-4 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-12">
              <article className="space-y-8">
                <section className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-soft dark:shadow-dark-soft p-5 sm:p-7">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                    About GramVartha
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    GramVartha is a village governance platform that helps citizens view village notices, file complaints and suggestions, upload complaint photos, attach location while filing complaints, receive push notifications, and access government scheme information, work guides, and village services.
                  </p>
                  <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summaryItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-lg bg-accent-mist dark:bg-dark-surface2 border border-primary-100 dark:border-dark-border p-3 text-sm text-text-secondary dark:text-dark-text-secondary"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {sections.map((section) => (
                  <section
                    key={section.title}
                    id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-soft dark:shadow-dark-soft p-5 sm:p-7"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-3">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.items && (
                      <ul className="mt-5 space-y-3">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed"
                          >
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}

                <section
                  id="contact-information"
                  className="bg-primary-900 dark:bg-dark-surface2 border border-primary-800 dark:border-dark-border rounded-lg shadow-large dark:shadow-dark-large p-5 sm:p-7 text-white"
                >
                  <h2 className="text-xl sm:text-2xl font-bold">Contact Information</h2>
                  <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed">
                    For privacy questions, data access requests, account deletion requests, or concerns about how GramVartha handles information, contact us using the details below.
                  </p>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Organization</p>
                      <p className="mt-2 text-sm font-semibold text-white">GramVartha</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Email</p>
                      <a
                        href="mailto:gramvartha@gmail.com"
                        className="mt-2 inline-block break-all text-sm font-semibold text-primary-200 hover:text-white transition-colors duration-200"
                      >
                        gramvartha@gmail.com
                      </a>
                    </div>
                  </div>
                </section>
              </article>

              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-soft dark:shadow-dark-soft p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">
                    Policy Summary
                  </h2>
                  <ul className="mt-4 space-y-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                    <li>Data is used to operate village governance services.</li>
                    <li>Location is collected only when attached to a complaint.</li>
                    <li>Photos are used as complaint evidence when uploaded.</li>
                    <li>Personal information is not sold.</li>
                    <li>Account deletion requests can be sent by email.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
