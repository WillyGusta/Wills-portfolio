import ChatWidget from '../components/ChatWidget';
import { profileContext } from '../data/profile';

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <p className="tag">{profileContext.role}</p>
        <h1>Hi, I&apos;m {profileContext.name}</h1>
        <p>{profileContext.summary}</p>
        <div className="actions">
          <a href="#projects" className="button-primary">
            View Projects
          </a>
          <a href="#contact" className="button-secondary">
            Contact
          </a>
        </div>
      </header>

      <section className="card" id="skills">
        <h2>Skills</h2>
        <ul className="pill-list">
          {profileContext.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className="card" id="projects">
        <h2>Projects</h2>
        <div className="project-grid">
          {profileContext.projects.map((project) => (
            <article key={project.name} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p className="muted">Stack: {project.stack.join(', ')}</p>
            </article>
          ))}
        </div>
      </section>

      <ChatWidget />

      <section className="card" id="contact">
        <h2>Contact</h2>
        <p>Email: {profileContext.contact.email}</p>
        <p>
          LinkedIn: <a href={profileContext.contact.linkedin}>{profileContext.contact.linkedin}</a>
        </p>
        <p>
          GitHub: <a href={profileContext.contact.github}>{profileContext.contact.github}</a>
        </p>
      </section>
    </main>
  );
}