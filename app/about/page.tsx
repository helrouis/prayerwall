export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-medium tracking-widest text-gold-500 uppercase mb-3">About This Place</p>
        <h1 className="font-serif text-3xl font-semibold text-navy-700">Why this wall exists</h1>
      </div>

      <div className="space-y-6 text-navy-700/70 leading-relaxed">
        <p className="font-serif text-lg text-navy-700/85 italic">
          "Carry each other's burdens, and in this way you will fulfill the law of Christ." — Galatians 6:2
        </p>

        <p>
          This prayer wall was built on a simple belief: no one should carry their burden alone. Whether you are walking through illness, heartbreak, financial crisis, or a quiet despair you can't quite name — your prayer is welcome here.
        </p>

        <h2 className="font-serif text-xl font-semibold text-navy-700 mt-10">Who is this for?</h2>
        <p>
          Everyone. You don't have to be religious to submit a prayer. You don't need to know how to pray. If there is something heavy on your heart, write it down. There are real people on the other side of this screen who will read your words and pray for you by name.
        </p>

        <h2 className="font-serif text-xl font-semibold text-navy-700 mt-10">What do Christians believe about prayer?</h2>
        <p>
          Christians believe that God is personal — that He knows you, loves you, and hears you when you call on Him. Prayer is not a ritual or a formula. It is simply a conversation with the God who made you. We believe that Jesus, who died and rose again, opened the way for us to approach God freely and confidently.
        </p>

        <h2 className="font-serif text-xl font-semibold text-navy-700 mt-10">Answered prayers</h2>
        <p>
          From time to time, people return to this wall with a testimony. These are not small things. They are evidence of a God who is actively at work in ordinary lives. We display them so that others can see and take heart.
        </p>

        <h2 className="font-serif text-xl font-semibold text-navy-700 mt-10">Moderation</h2>
        <p>
          Every prayer submitted is reviewed before it appears publicly. This keeps the wall safe and respectful. Your prayer will appear within 24 hours of submission.
        </p>

        <div className="mt-10 p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-sm text-amber-800 leading-relaxed">
            If you are in crisis, please reach out to a trusted person or emergency services. This wall is a place of prayer, not a substitute for professional care.
          </p>
        </div>
      </div>
    </div>
  );
}
