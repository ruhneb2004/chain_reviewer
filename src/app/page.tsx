import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <section className="hero bg-base-200 py-16">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">
              <span className="text-primary">Chained</span>
              <span className="text-secondary">_Review</span>
            </h1>
            <p className="py-6 text-lg">
              Decentralized code review platform connecting developers and
              project owners with transparent, blockchain-powered collaboration.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/submitEmail" className="btn btn-primary">
                Get Started
              </Link>
              <Link href="/explore" className="btn btn-outline">
                Explore Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Chained_Review?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card bg-base-200 hover:bg-base-300 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="card-title text-xl">Secure Payments</h3>
              <p>
                Funds held in escrow until work is approved through smart
                contracts
              </p>
            </div>
          </div>

          <div className="card bg-base-200 hover:bg-base-300 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="card-title text-xl">AI-Powered Reviews</h3>
              <p>
                Automated code quality scoring with our Chainlink-powered AI
              </p>
            </div>
          </div>

          <div className="card bg-base-200 hover:bg-base-300 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="card-title text-xl">Reputation System</h3>
              <p>
                Build verifiable on-chain reputation as a developer or project
                owner
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-base-200">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8">
            Join our platform and experience decentralized code reviews like
            never before
          </p>
          <Link href="/submitEmail" className="btn btn-primary btn-lg">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
