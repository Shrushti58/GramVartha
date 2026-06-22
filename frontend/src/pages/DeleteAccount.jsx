import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const supportEmail = "gramvartha@gmail.com";

const setMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function DeleteAccount() {
  useEffect(() => {
    document.title = "GramVartha Account Deletion Request";
    setMetaTag(
      "description",
      "Request deletion of your GramVartha account and associated personal data."
    );
    setMetaTag("robots", "index, follow");
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary font-sans transition-colors duration-300">
      <Navbar />

      <main>
        <section className="bg-mist-gradient dark:bg-dark-surface-gradient border-b border-border dark:border-dark-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <span aria-hidden="true">&larr;</span>
              Back to GramVartha
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-300">
              Account and Data
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              GramVartha Account Deletion Request
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              GramVartha users can request account deletion by emailing our support team from their registered phone or email details.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-soft dark:shadow-dark-soft p-5 sm:p-7 space-y-7">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold">How to Request Deletion</h2>
                <p className="mt-4 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  Send an account deletion request to{" "}
                  <a
                    href={`mailto:${supportEmail}?subject=GramVartha%20Account%20Deletion%20Request`}
                    className="font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-500 dark:hover:text-primary-400 break-all"
                  >
                    {supportEmail}
                  </a>
                  . Please include the phone number or email address registered with GramVartha, your name, and any village details needed to identify your account.
                </p>
                <p className="mt-3 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  After we verify the request, we will delete or anonymize eligible account data associated with your GramVartha account.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold">Data Deleted</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    "User profile information",
                    "Login credentials",
                    "Notification tokens",
                    "Complaint-related personal data where possible",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold">Data Retained</h2>
                <p className="mt-4 text-sm sm:text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  Some complaint records may be retained up to 90 days if required for administrative, safety, or legal purposes.
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
