"use client";

import { useMemo, useState } from "react";

type VercelDeployment = {
  uid: string;
  name: string;
  url: string;
  state: "READY" | "ERROR" | "BUILDING" | "INITIALIZING" | "QUEUED" | "CANCELED";
  created: number;
  creator: {
    uid: string;
    email: string;
    username: string;
  };
  inspectorUrl: string;
};

type VercelProject = {
  id: string;
  name: string;
  framework: string | null;
  updatedAt: number;
  link: {
    type: "github" | "gitlab" | "bitbucket";
    repo: string;
    org: string;
  } | null;
  latestDeployments: VercelDeployment[];
};

type VercelStatusProps = {
  projects: VercelProject[];
};

function summarizeStates(projects: VercelProject[]) {
  return projects.reduce(
    (accumulator, project) => {
      const state = project.latestDeployments[0]?.state ?? "QUEUED";

      if (state === "READY") accumulator.ready += 1;
      else if (state === "ERROR" || state === "CANCELED") accumulator.problem += 1;
      else accumulator.active += 1;

      return accumulator;
    },
    { ready: 0, active: 0, problem: 0 },
  );
}

function getStateTone(state: VercelDeployment["state"] | "UNKNOWN") {
  if (state === "READY") return "status-pill status-pill--live";
  if (state === "ERROR" || state === "CANCELED") return "status-pill status-pill--planned";
  return "meta-pill";
}

export function VercelStatus({ projects }: VercelStatusProps) {
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(null);
  const summary = useMemo(() => summarizeStates(projects), [projects]);

  if (!projects || projects.length === 0) {
    return (
      <section className="surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Deployment Health</p>
            <h2>No Vercel data available</h2>
            <p>Projects were not returned or the Vercel token is missing.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="surface">
      <div className="section-head">
        <div>
          <p className="section-kicker">Deployment Health</p>
          <h2>Live Vercel fleet</h2>
          <p>Inspect the newest deployment state across linked projects without leaving the hub.</p>
        </div>
      </div>

      <div className="metric-band">
        <div className="metric">
          <span>Projects</span>
          <strong>{projects.length}</strong>
        </div>
        <div className="metric">
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </div>
        <div className="metric">
          <span>Active builds</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="metric">
          <span>Problems</span>
          <strong>{summary.problem}</strong>
        </div>
      </div>

      <div className="tool-grid" style={{ marginTop: "1rem" }}>
        {projects.map((project) => {
          const latest = project.latestDeployments[0];
          const state = latest?.state ?? "UNKNOWN";

          return (
            <button
              key={project.id}
              type="button"
              className="card"
              style={{ textAlign: "left" }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="tool-card">
                <div className="tool-card__head">
                  <div className="tool-card__icon">V</div>
                  <span className={getStateTone(state)}>{state.toLowerCase()}</span>
                </div>

                <div>
                  <h2>{project.name}</h2>
                  <p>{project.framework ?? "Unspecified framework"}</p>
                </div>

                <div className="list-meta">
                  <span className="meta-pill">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  {project.link ? (
                    <span className="meta-pill">
                      {project.link.org}/{project.link.repo}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedProject ? (
        <div
          onClick={() => setSelectedProject(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            background: "rgba(3, 10, 18, 0.78)",
            backdropFilter: "blur(10px)",
            padding: "20px",
          }}
        >
          <div
            className="surface"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(760px, 100%)", background: "var(--card-strong)" }}
          >
            <div className="section-head">
              <div>
                <p className="section-kicker">Project Detail</p>
                <h2>{selectedProject.name}</h2>
              </div>
              <button type="button" className="ghost-link" onClick={() => setSelectedProject(null)}>
                Close
              </button>
            </div>

            <div className="split-grid">
              <div className="list-item">
                <strong>Framework</strong>
                <p>{selectedProject.framework ?? "Other"}</p>
              </div>
              <div className="list-item">
                <strong>Repository</strong>
                <p className="mono">
                  {selectedProject.link
                    ? `${selectedProject.link.org}/${selectedProject.link.repo}`
                    : "No linked repository"}
                </p>
              </div>
            </div>

            <div className="section" style={{ marginTop: "1rem" }}>
              <div className="list">
                {selectedProject.latestDeployments.map((deployment) => (
                  <div className="list-item" key={deployment.uid}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <strong className="mono">{deployment.url}</strong>
                        <p>
                          {new Date(deployment.created).toLocaleString()} by{" "}
                          {deployment.creator.username}
                        </p>
                      </div>
                      <span className={getStateTone(deployment.state)}>
                        {deployment.state.toLowerCase()}
                      </span>
                    </div>

                    <div className="actions" style={{ marginTop: "0.9rem" }}>
                      <a
                        className="primary-link"
                        href={`https://${deployment.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Launch
                      </a>
                      <a
                        className="secondary-link"
                        href={deployment.inspectorUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Inspector
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
