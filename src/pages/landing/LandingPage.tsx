import { Link } from 'react-router-dom'
import { CheckCircle, TrendingUp, Shield, Smartphone, Star, Target } from 'lucide-react'

const FEATURES = [
  { Icon: TrendingUp, title: 'Track Every Cent', desc: 'Budget categories, weekly spending, and automatic totals — no spreadsheets needed.' },
  { Icon: Target, title: 'Goals That Matter', desc: 'Set savings goals, track progress with visual thermometers, and hit your targets.' },
  { Icon: CheckCircle, title: 'Build Habits', desc: 'Weekly finance check-ins that build lasting financial discipline.' },
  { Icon: Shield, title: 'Emergency Fund', desc: 'See exactly how many months of safety net you have — and grow it monthly.' },
  { Icon: Star, title: 'Monthly Reflections', desc: 'Guided prompts that help you understand your money story.' },
  { Icon: Smartphone, title: 'iOS & Android', desc: 'Native app experience on both platforms — your finances in your pocket.' },
]

const PRICING = [
  { tier: 'Free', price: '€0', period: 'forever', features: ['1 goal', '3 budget categories', '30 transactions/mo', 'Basic dashboard'] },
  { tier: 'Pro', price: '€7.99', period: '/month', features: ['Unlimited goals', 'All budget categories', 'Unlimited transactions', 'Habit tracker', 'Year-end PDF export', 'Cloud sync'] },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-lg mx-auto">
        <div className="font-display text-xl text-navy">FP</div>
        <Link to="/login" className="btn-primary text-xs px-4 py-2">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-10 pb-12 max-w-lg mx-auto text-center">
        <div className="text-mid-gray text-xs uppercase tracking-widest font-bold mb-4">Annual Financial Planner</div>
        <h1 className="font-display text-4xl text-navy leading-tight mb-4">
          Your money.<br />Your year.<br />Your way.
        </h1>
        <p className="text-navy/60 text-base mb-8 leading-relaxed">
          Track goals, budgets, habits, and reflections — all in one beautiful app. No spreadsheets. No stress.
        </p>
        <Link to="/login" className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-3">
          Start for free
        </Link>
        <p className="text-mid-gray text-xs mt-3">No credit card needed</p>
      </section>

      {/* Visual Preview Card */}
      <section className="px-6 pb-10 max-w-lg mx-auto">
        <div className="card relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-rose/60" />
            <div className="w-3 h-3 rounded-full bg-gold/60" />
            <div className="w-3 h-3 rounded-full bg-teal/60" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-2xs text-mid-gray uppercase tracking-wider mb-1">Savings Goal</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-navy/10 h-3 rounded-full overflow-hidden">
                  <div className="bg-teal h-full rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="font-mono text-sm font-semibold text-navy">65%</span>
              </div>
              <div className="text-xs text-mid-gray mt-0.5">€6,500 / €10,000 — Vacation Fund</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['This Month', '−€2,340', 'text-rose'], ['Savings Rate', '18%', 'text-teal'], ['Streak', '6 weeks', 'text-gold']].map(([label, val, cls]) => (
                <div key={String(label)} className="bg-cream rounded-xl p-3 text-center">
                  <div className={`font-mono text-sm font-bold ${cls}`}>{val}</div>
                  <div className="text-2xs text-mid-gray mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-12 max-w-lg mx-auto">
        <h2 className="page-title text-center mb-8">Everything you need</h2>
        <div className="space-y-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-navy/8 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-navy" />
              </div>
              <div>
                <div className="font-semibold text-sm text-navy mb-0.5">{title}</div>
                <div className="text-xs text-mid-gray leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pb-20 max-w-lg mx-auto">
        <h2 className="page-title text-center mb-6">Simple pricing</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRICING.map(({ tier, price, period, features }) => (
            <div key={tier} className={`card ${tier === 'Pro' ? 'border-2 border-gold relative' : ''}`}>
              {tier === 'Pro' && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge-gold">Popular</div>
              )}
              <div className={`font-bold text-sm mb-1 ${tier === 'Pro' ? 'text-gold-dark' : 'text-navy'}`}>{tier}</div>
              <div className="font-display text-2xl font-bold text-navy mb-0.5">{price}</div>
              <div className="text-2xs text-mid-gray mb-4">{period}</div>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-navy/70">
                    <CheckCircle size={12} className="text-teal shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-8 max-w-lg mx-auto text-center">
        <Link to="/login" className="btn-gold inline-flex items-center gap-2 px-10 py-3">
          Start for free →
        </Link>
      </section>
    </div>
  )
}
