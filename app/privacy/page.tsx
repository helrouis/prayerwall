export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold text-navy-700 mb-2">A Note on Privacy</h1>
      <p className="text-xs text-navy-700/40 mb-10">Effective from the day this prayer wall went live.</p>

      <div className="prose prose-sm text-navy-700/75 space-y-8">

        <p>
          This prayer wall grew out of the CCF RunWithChrist community — a fellowship within CCF (Christ's Commission Fellowship) and its RunWithChrist sports ministry. Jason Cheng, a volunteer from within the community, stepped up to build and maintain it as an act of service. It is not an official CCF product — just the community finding a way to carry one another's burdens.
        </p>

        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-700 mb-3">What we collect</h2>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span><strong className="text-navy-700">Your name</strong>, to attach to your prayer. You can post anonymously if you prefer.</span></li>
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span><strong className="text-navy-700">Your prayer text</strong>, which is shared publicly after our team reviews and approves it.</span></li>
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span><strong className="text-navy-700">Your email or phone number</strong> (optional) — only if you choose to leave it so our care team can pray with you personally.</span></li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-700 mb-3">What we never do</h2>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span>Sell, share, or pass your contact information to anyone.</span></li>
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span>Display your email or phone number anywhere on the app.</span></li>
            <li className="flex gap-2"><span className="text-gold-500 shrink-0">—</span><span>Use your data for anything beyond this prayer wall.</span></li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-700 mb-3">How long we keep your data</h2>
          <p>Your information stays in the system for as long as the prayer wall is active, or until you ask Jason to remove it — whichever comes first. Just email him and he will take care of it personally.</p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-700 mb-3">Your rights under Philippine law</h2>
          <p>Under the Data Privacy Act of 2012 (RA 10173), you have the right to access, correct, or request the deletion of your personal information at any time. You also have the right to file a complaint with the National Privacy Commission at <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:text-gold-600">privacy.gov.ph</a> if you believe your rights have been violated.</p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-navy-700 mb-3">Get in touch</h2>
          <p>This app is community-driven and volunteer-run, so there's no company behind it — just people looking out for one another. Jason handles the technical side and is the point of contact for any questions. Write to him directly at <a href="mailto:jason.m.cheng@gmail.com" className="text-gold-500 hover:text-gold-600">jason.m.cheng@gmail.com</a> and he will respond personally.</p>
        </div>

        <p className="font-serif text-base italic text-navy-700/50 pt-4 border-t border-cream-200">
          Praying alongside you.
        </p>

      </div>
    </div>
  );
}
