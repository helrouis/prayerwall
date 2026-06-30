import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "God loves you",
    body: "Before you were born, God knew you. He is not distant or indifferent. The entire story of the Bible is the story of a God pursuing the people He loves. \"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.\" — John 3:16",
  },
  {
    num: "02",
    title: "Sin separates us",
    body: "Every human being has chosen their own way over God's. This is what the Bible calls sin — not just bad actions, but a fundamental turning away from the God who made us. This separation has consequences. \"For all have sinned and fall short of the glory of God.\" — Romans 3:23",
  },
  {
    num: "03",
    title: "Jesus is the bridge",
    body: "God did not leave us separated. He sent His Son Jesus — fully God, fully human — to live a perfect life and die in our place, taking the penalty we deserved. Three days later, He rose from the dead. This changes everything. \"But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.\" — Romans 5:8",
  },
  {
    num: "04",
    title: "Trust is the step",
    body: "You can't earn your way to God. It's not about being religious enough or good enough. It's simply about trusting what Jesus has already done — receiving it as a gift. \"If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.\" — Romans 10:9",
  },
];

export default function JesusPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <p className="text-xs font-medium tracking-widest text-gold-500 uppercase mb-3">The Good News</p>
        <h1 className="font-serif text-3xl font-semibold text-navy-700 mb-4">How to know Jesus</h1>
        <p className="text-navy-700/55">
          This is not a religious checklist. It's an invitation to a relationship.
        </p>
      </div>

      <div className="space-y-10 mb-16">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-6">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-gold-600">{s.num}</span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-navy-700 mb-2">{s.title}</h2>
              <p className="text-navy-700/65 leading-relaxed text-sm">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sample prayer */}
      <div className="bg-navy-700 rounded-2xl p-8 mb-10">
        <h2 className="font-serif text-xl font-semibold text-white mb-4">A simple prayer</h2>
        <p className="text-white/60 text-xs mb-4 uppercase tracking-wide">If you mean this, say it — aloud or in your heart</p>
        <p className="font-serif italic text-white/90 leading-loose text-base">
          "God, I know I have lived my own way. I believe Jesus died for me and rose again. 
          I turn from my sin and I trust Jesus as my Lord and Savior. 
          Come into my life. Make me new. Amen."
        </p>
      </div>

      <div className="bg-cream-200 rounded-2xl p-6 text-center">
        <p className="text-navy-700/70 text-sm leading-relaxed mb-4">
          If you just prayed that and meant it — something real happened. We'd love to help you take the next step.
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          Share a prayer request
        </Link>
      </div>
    </div>
  );
}
