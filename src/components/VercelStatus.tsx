"use client";

import { useState } from "react";
import type { VercelProject, VercelDeployment } from "@/lib/hub/types";

type VercelStatusProps = {
  projects: VercelProject[];
};

export function VercelStatus({ projects }: VercelStatusProps) {
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(null);

  if (!projects || projects.length === 0) {
    return (
      <section className="panel">
        <p className="eyebrow">Vercel Status</p>
        <h2>No projects found or VERCEL_TOKEN missing.</h2>
      </section>
    );
  }

  return (
    <section className="vercel-status">
      <div className="panel-header">
        <p className="eyebrow">Deployment Health</p>
        <h2>Live Vercel Instances</h2>
      </div>

      <div className="status-grid">
        {projects.map((project) => {
          const latest = project.latestDeployments[0];
          const status = latest?.state || "UNKNOWN";
          
          return (
            <button
              key={project.id}
              className={`status-item ${status.toLowerCase()}`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="status-indicator" />
              <span className="project-name">{project.name}</span>
              <span className="status-label">{status}</span>
            </button>
          );
        })}
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProject.name}</h3>
              <button className="close-button" onClick={() => setSelectedProject(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="project-info">
                <p><strong>Framework:</strong> {selectedProject.framework || "Other"}</p>
                {selectedProject.link && (
                  <p className="repo-link">
                    <GithubIcon />
                    <a href={`https://github.com/${selectedProject.link.org}/${selectedProject.link.repo}`} target="_blank" rel="noreferrer">
                      {selectedProject.link.org}/{selectedProject.link.repo}
                    </a>
                  </p>
                )}
              </div>

              <div className="deployment-list">
                <h4>Recent Deployments</h4>
                {selectedProject.latestDeployments.map((dep) => (
                  <div key={dep.uid} className="deployment-item">
                    <div className="dep-status">
                      {dep.state === "READY" ? <SuccessIcon /> :
                       dep.state === "ERROR" ? <ErrorIcon /> :
                       <PendingIcon />}
                    </div>
                    <div className="dep-info">
                      <a href={`https://${dep.url}`} target="_blank" rel="noreferrer" className="dep-url">
                        {dep.url}
                      </a>
                      <p className="dep-meta">
                        {new Date(dep.created).toLocaleString()} by {dep.creator.username}
                      </p>
                    </div>
                    <a href={dep.inspectorUrl} target="_blank" rel="noreferrer" title="Inspect">
                      <ExternalLinkIcon />
                    </a>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <a 
                  href={`https://${selectedProject.latestDeployments[0]?.url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="primary-link"
                >
                  Launch App
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .vercel-status {
          margin-top: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px border rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .status-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #666;
        }
        .ready .status-indicator { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .error .status-indicator { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .building .status-indicator { background: #f59e0b; animation: pulse 2s infinite; }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .project-name {
          flex: 1;
          font-weight: 500;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .status-label {
          font-size: 0.7rem;
          opacity: 0.6;
          text-transform: uppercase;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-blur: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          padding: 1.5rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.5;
        }
        .close-button:hover { opacity: 1; }
        
        .repo-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        .repo-link a { color: #60a5fa; text-decoration: none; }
        .repo-link a:hover { text-decoration: underline; }

        .deployment-list { margin-top: 2rem; }
        .deployment-list h4 { font-size: 0.875rem; opacity: 0.6; margin-bottom: 1rem; }
        .deployment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }
        .dep-info { flex: 1; }
        .dep-url {
          font-size: 0.875rem;
          color: white;
          text-decoration: none;
          font-family: monospace;
        }
        .dep-meta { font-size: 0.75rem; opacity: 0.5; margin-top: 0.25rem; }
        
        .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
        .primary-link {
          background: white;
          color: black;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .text-success { color: #10b981; }
        .text-error { color: #ef4444; }
        .text-pending { color: #f59e0b; }
      `}</style>
    </section>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.794 23.385c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.082-.73.082-.73 1.204.085 1.838 1.235 1.838 1.235 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.761-1.605-2.665-.303-5.467-1.333-5.467-5.932 0-1.31.469-2.382 1.236-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.48 11.48 0 0 1 6.008 0c2.29-1.552 3.297-1.23 3.297-1.23.654 1.652.243 2.873.12 3.176.77.84 1.235 1.913 1.235 3.222 0 4.61-2.807 5.625-5.48 5.922.43.37.814 1.102.814 2.222v3.293c0 .32.216.694.825.576A12.002 12.002 0 0 0 12 .5Z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v5h-14v-14h5" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
