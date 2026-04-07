import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">hub.joche.dev</p>
        <h1>One homepage for every tool.</h1>
        <p className="lede">
          Each tool can stay in its own GitHub repo and still appear under a single domain
          using path-based routing.
        </p>
      </section>

      <section className="grid">
        {tools.map((tool) => (
          <article className="card" key={tool.slug}>
            <p className="status">{tool.status}</p>
            <h2>{tool.name}</h2>
            <p>{tool.description}</p>
            <div className="actions">
              <a className="primary-link" href={tool.href}>Open tool</a>
              <a className="secondary-link" href={tool.repo}>Repo</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
