'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/VideoIntro.module.css';

const CinematicLayer = dynamic(() => import('./CinematicLayer'), { ssr: false });

// SVG icons
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const UnmuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export default function VideoIntro() {
  const fgRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroMetaRef = useRef<HTMLDivElement>(null);
  const userWantsSoundRef = useRef(false);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [soundHintVisible, setSoundHintVisible] = useState(true);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Load GSAP client-side
  useEffect(() => {
    let gsap: typeof import('gsap').gsap;

    const loadGsap = async () => {
      const mod = await import('gsap');
      gsap = mod.gsap;

      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0);

      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
      }, 0.5);

      tl.to(firstRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, 0.75);

      tl.to(lastRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, 0.92);

      tl.to(roleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out',
      }, 1.15);

      tl.to(scrollRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 1.6);

      setGsapLoaded(true);
    };

    loadGsap();
  }, []);

  // Auto-hide sound hint
  useEffect(() => {
    const timer = setTimeout(() => setSoundHintVisible(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Sync muted state to fg video DOM element
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.muted = muted;
    }
  }, [muted]);

  // Intersection Observer to control video playback and mute state on scroll
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const fg = fgRef.current;
        const bg = bgRef.current;
        if (!fg || !bg) return;

        if (entry.isIntersecting) {
          // Play both foreground and background videos when hero is visible
          fg.play().catch(() => {});
          bg.play().catch(() => {});
          setPlaying(true);

          // Restore sound state if the user previously unmuted the video
          if (userWantsSoundRef.current) {
            fg.muted = false;
            setMuted(false);
          }
        } else {
          // Mute and pause both videos to save resources and stop audio loop
          fg.muted = true;
          setMuted(true);
          fg.pause();
          bg.pause();
          setPlaying(false);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(hero);
    return () => {
      observer.disconnect();
    };
  }, []);

  const togglePlay = useCallback(() => {
    const fg = fgRef.current;
    const bg = bgRef.current;
    if (!fg || !bg) return;

    if (playing) {
      fg.pause();
      bg.pause();
    } else {
      fg.play().catch(() => {});
      bg.play().catch(() => {});
    }
    setPlaying(p => !p);
  }, [playing]);

  const toggleMute = useCallback(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const nextMuted = !fg.muted;
    fg.muted = nextMuted;
    setMuted(nextMuted);
    userWantsSoundRef.current = !nextMuted;
    setSoundHintVisible(false);
  }, []);

  const scrollToNext = useCallback(() => {
    const next = document.getElementById('about-section');
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const navItems = [
    { id: 'about-section', label: 'About' },
    { id: 'experience-section', label: 'Experience' },
    { id: 'projects-section', label: 'Projects' },
    { id: 'research-section', label: 'Research' },
    { id: 'skills-section', label: 'Skills' },
    { id: 'contact-section', label: 'Contact' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          KG<span className={styles.navLogoDot}>.</span>
        </div>
        <div className={styles.navLinks}>
          {navItems.map(item => (
            <button key={item.id} className={styles.navLink} onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <a
          href="mailto:kumaraswamyg2004@gmail.com"
          className={styles.navCta}
        >
          Hire Me
        </a>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className={styles.hero} style={{ opacity: 0 }}>

        <video
          ref={bgRef}
          className={styles.bgVideo}
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />

        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.gradientTop} aria-hidden="true" />
        <div className={styles.gradientSides} aria-hidden="true" />
        <div className={styles.gradientBottom} aria-hidden="true" />

        <div className={styles.fgVideoWrap}>
          <video
            ref={fgRef}
            className={styles.fgVideo}
            src="/hero.mp4"
            autoPlay
            loop
            muted={muted}
            playsInline
            preload="auto"
          />
        </div>

        <CinematicLayer />

        <div className={styles.content}>
          <div ref={taglineRef} className={styles.tagline}>
            AI/ML Engineer &amp; Backend Developer
          </div>

          <div className={styles.nameBlock}>
            <span ref={firstRef} className={styles.firstName}>
              KUMAR
            </span>
            <span ref={lastRef} className={styles.lastName}>
              ASWAMY G
            </span>
          </div>

          <div ref={roleRef} className={styles.role}>
            Backend Systems
            <span className={styles.roleDivider}>·</span>
            Generative AI
            <span className={styles.roleDivider}>·</span>
            Data-Driven Products
          </div>

          <div ref={heroMetaRef} className={styles.heroMeta} style={{ opacity: 0, transform: 'translateY(18px)' }}>
            <span className={styles.heroBadge}>M.Tech CSE · VIT Chennai</span>
            <span className={styles.heroBadge}>Ex-Intern @ Prodapt Solutions</span>
            <span className={styles.heroBadge}>Patent Filed</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.glassBtn}
            onClick={togglePlay}
            aria-label={playing ? 'Pause video' : 'Play video'}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            className={styles.glassBtn}
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MuteIcon /> : <UnmuteIcon />}
          </button>
        </div>

        <div
          className={`${styles.soundHint} ${soundHintVisible ? '' : styles.hidden}`}
          aria-hidden="true"
        >
          <span className={styles.soundDot} />
          Tap for sound
        </div>

        <div
          ref={scrollRef}
          className={styles.scrollIndicator}
          onClick={scrollToNext}
          role="button"
          aria-label="Scroll to next section"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && scrollToNext()}
          style={{ opacity: 0 }}
        >
          <span className={styles.scrollLabel}>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about-section" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>About</div>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2 className={styles.sectionTitle}>
                Building systems that<br />
                <em>think, scale, and ship.</em>
              </h2>
              <p className={styles.bodyText}>
                I'm a Computer Science student at VIT Chennai specializing in Business Analytics, bridging the gap between raw AI capability and real-world product impact. My work lives at the intersection of backend engineering, machine learning, and data-driven decision systems.
              </p>
              <p className={styles.bodyText}>
                At Prodapt Solutions, I worked deep in the telecom stack, building large-scale KPI systems, optimizing FTTH/GPON protocols, developing Dialogflow chatbots, and implementing early RAG pipelines. Back at campus, I shipped products that earned hackathon wins, a patent, and active research interest in vehicular network security.
              </p>

            </div>
            <div className={styles.aboutStats}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>5+</div>
                <div className={styles.statLabel}>Projects Shipped</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>1</div>
                <div className={styles.statLabel}>Patent Filed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>4×</div>
                <div className={styles.statLabel}>Hackathon Winner</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>7+</div>
                <div className={styles.statLabel}>Certifications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience-section" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Experience</div>
          <h2 className={styles.sectionTitle}>Where I've worked</h2>

          <div className={styles.expCard}>
            <div className={styles.expHeader}>
              <div>
                <div className={styles.expCompany}>Prodapt Solutions Pvt. Ltd.</div>
                <div className={styles.expRole}>Software Development Intern</div>
              </div>
              <div className={styles.expMeta}>
                <span className={styles.expDate}>May 2025 – July 2025</span>
                <span className={styles.expLoc}>Chennai, India</span>
              </div>
            </div>
            <div className={styles.expDivider} />
            <div className={styles.expGrid}>
              <div className={styles.expItem}>
                <div className={styles.expItemTitle}>Telecom KPI Domain</div>
                <div className={styles.expItemDesc}>Developed and maintained enterprise KPI systems with hands-on exposure to FTTH network infrastructure, GPON/EPON optical protocols, and OSS/BSS operational frameworks.</div>
              </div>
              <div className={styles.expItem}>
                <div className={styles.expItemTitle}>Conversational AI</div>
                <div className={styles.expItemDesc}>Built chatbot flows using Dialogflow with webhook integrations. Explored Vertex AI capabilities and experimented with LangChain and RAG pipelines for automated Jira story generation.</div>
              </div>
              <div className={styles.expItem}>
                <div className={styles.expItemTitle}>Full-Stack Development</div>
                <div className={styles.expItemDesc}>Built a complete Library Management System using FastAPI and Gradio with custom HTML/CSS frontend. Wrote Python automation scripts for Mermaid-to-Excel diagram conversion.</div>
              </div>
              <div className={styles.expItem}>
                <div className={styles.expItemTitle}>GenAI Exploration</div>
                <div className={styles.expItemDesc}>Researched emerging GenAI workflows for enterprise automation, including document intelligence, LLM-powered ticket creation, and AI-assisted knowledge management systems.</div>
              </div>
            </div>
            <div className={styles.expTags}>
              {['Python', 'FastAPI', 'Dialogflow', 'LangChain', 'Vertex AI', 'RAG', 'GPON/EPON', 'OSS/BSS', 'Firebase'].map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects-section" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Projects</div>
          <h2 className={styles.sectionTitle}>Things I've built</h2>

          {/* Hero project */}
          <div className={styles.heroProject}>
            <div className={styles.heroProjectBadge}>Flagship Project</div>
            <div className={styles.heroProjectContent}>
              <div className={styles.heroProjectText}>
                <h3 className={styles.heroProjectTitle}>BUSZerk</h3>
                <p className={styles.heroProjectSub}>AI-powered commuter safety platform for Chennai's MTC network</p>
                <p className={styles.bodyText}>
                  A full-stack safety and transit intelligence platform designed not just as an app but as a complete ecosystem. XGBoost models predict crowd density before you board. Gemini powers a context-aware in-app assistant. SOS alerts, fake call escape features, and real-time bus tracking make it a genuine safety net for urban commuters.
                </p>
                <div className={styles.heroProjectFeatures}>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    XGBoost crowd prediction engine
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    Gemini-powered AI assistant (voice + text)
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    SOS + fake call safety mechanisms
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    Firebase Auth + Firestore real-time data
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    Flask ML backend + REST APIs
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureDot} />
                    8th / 75 teams at EmpowerTech National Hackathon
                  </div>
                </div>
                <div className={styles.expTags}>
                  {['Python', 'XGBoost', 'Flask', 'Firebase', 'Gemini API', 'Firestore', 'ML'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
                <div className={styles.projectLinks}>
                  <a href="https://github.com/Kumar070204/BUSZerk" target="_blank" rel="noopener" className={styles.linkBtn}>
                    GitHub →
                  </a>
                </div>
              </div>
              <div className={styles.heroProjectVisual}>
                <div className={styles.projectScreen}>
                  <div className={styles.screenDot} style={{ background: '#ff5f57' }} />
                  <div className={styles.screenDot} style={{ background: '#febc2e' }} />
                  <div className={styles.screenDot} style={{ background: '#28c840' }} />
                </div>
                <div className={styles.projectArt}>
                  <div className={styles.artGrid}>
                    <div className={styles.artRow}>
                      <div className={`${styles.artCell} ${styles.artCellPrimary}`}>SOS</div>
                      <div className={`${styles.artCell} ${styles.artCellSecondary}`}>🚌</div>
                    </div>
                    <div className={styles.artRow}>
                      <div className={`${styles.artCell} ${styles.artCellSecondary}`}>AI</div>
                      <div className={`${styles.artCell} ${styles.artCellPrimary}`}>SAFE</div>
                    </div>
                    <div className={styles.artMetric}>
                      <span>Crowd Forecast</span>
                      <div className={styles.artBar}>
                        <div className={styles.artBarFill} style={{ width: '72%' }} />
                      </div>
                      <span>72% capacity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other projects grid */}
          <div className={styles.projectsGrid}>
            {[
              {
                title: 'Corporate Wellness',
                sub: 'Gamified Employee Health Platform',
                desc: 'Maps real health metrics (steps, nutrition, and sleep) to in-game survival resources. Teams compete with AI-powered wellness insights. Patent filed for the core gamification and GenAI framework.',
                tags: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Random Forest', 'GenAI'],
                badge: 'Patent Filed',
                github: 'https://github.com/Kumar070204/corporate-wellness',
                awards: '1st Place — DataSprint Hackathon',
              },
              {
                title: 'SafeMotion',
                sub: 'AI Activity Monitoring for Elderly Care',
                desc: 'Human activity recognition system with real-time alerting. Modular ML pipeline with Firebase backend delivers context-aware risk analysis for elderly care, rehabilitation, and workplace safety.',
                tags: ['Python', 'ML', 'Firebase', 'HAR', 'Flask'],
                badge: null,
                github: 'https://github.com/Kumar070204/SafeMotion-AI-Activity-Monitoring-Platform',
                awards: null,
              },
              {
                title: 'Deepfake Detection',
                sub: 'CNN-based AI Media Forensics',
                desc: 'Identifies AI-generated faces in images and video frames using a CNN trained with PyTorch. FastAPI backend makes it production-deployable for real-time content verification pipelines.',
                tags: ['PyTorch', 'CNN', 'OpenCV', 'FastAPI', 'Python'],
                badge: null,
                github: '#',
                awards: null,
              },
              {
                title: 'Healthcare Chatbot',
                sub: 'Conversational Medical Guidance',
                desc: 'NLP-powered conversational AI for symptom checking and basic medical guidance. Designed for natural dialogue flows that feel approachable while providing responsible health information.',
                tags: ['Python', 'NLP', 'Flask'],
                badge: null,
                github: 'https://github.com/Kumar070204/Healthcare-Assistant-Chatbot-main',
                awards: null,
              },
            ].map(proj => (
              <div key={proj.title} className={styles.projectCard}>
                {proj.badge && <div className={styles.projectBadge}>{proj.badge}</div>}
                <h3 className={styles.projectTitle}>{proj.title}</h3>
                <p className={styles.projectSub}>{proj.sub}</p>
                <p className={styles.projectDesc}>{proj.desc}</p>
                {proj.awards && <div className={styles.projectAward}>🏆 {proj.awards}</div>}
                <div className={styles.expTags} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  {proj.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
                <div className={styles.projectLinks}>
                  <a href={proj.github} target="_blank" rel="noopener" className={styles.linkBtnSmall}>
                    GitHub →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ── */}
      <section id="research-section" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Research & Innovation</div>
          <h2 className={styles.sectionTitle}>Pushing boundaries</h2>

          <div className={styles.researchGrid}>
            <div className={styles.researchCard}>
              <div className={styles.researchIcon}>📡</div>
              <div className={styles.researchContent}>
                <div className={styles.researchMeta}>
                  <span className={styles.researchTag}>Ongoing Research</span>
                  <span className={styles.researchTag}>Track Award — VIT Chennai</span>
                </div>
                <h3 className={styles.researchTitle}>VANET Security Optimization</h3>
                <p className={styles.bodyText}>
                  Ongoing research into Vehicular Ad Hoc Network security, building optimized models that improve data protection, communication latency, and threat response in mobile mesh environments. Results demonstrate measurable gains in accuracy and response time over baseline approaches.
                </p>
              </div>
            </div>

            <div className={styles.researchCard}>
              <div className={styles.researchIcon}>⚕️</div>
              <div className={styles.researchContent}>
                <div className={styles.researchMeta}>
                  <span className={styles.researchTag}>Patent Filed</span>
                  <span className={styles.researchTag}>Wearables + GenAI</span>
                  <span className={styles.researchTag}>1st Place — DataSprint</span>
                </div>
                <h3 className={styles.researchTitle}>AI-Powered Employee Wellness Platform</h3>
                <p className={styles.bodyText}>
                  Designed a novel framework combining wearable biometric data, gamification mechanics, and Generative AI to drive sustainable employee health behaviors in corporate environments. The IP is formally protected.
                </p>
              </div>
            </div>
          </div>

          {/* Awards */}
          <div className={styles.awardsSection}>
            <div className={styles.sectionLabel} style={{ marginBottom: '1.5rem' }}>Hackathons & Awards</div>
            <div className={styles.awardsList}>
              {[
                { title: '1st Place', event: 'ECOVERSE\'26 — IoT & Robotics Track', org: 'VIT Chennai × SWELECT' },
                { title: '1st Place', event: 'DataSprint Hackathon', org: 'ECDS × Microsoft Innovations Club VITC' },
                { title: 'Special Mention', event: 'DataQuest 2.0 — 24hr National Hackathon', org: 'L&T EduTech × ECDS' },
                { title: '8th / 75 Teams', event: 'EmpowerTech National Hackathon', org: 'Women\'s Safety in Public Transport' },
                { title: 'Track Award', event: 'Paper Presentation — VANET Road Safety', org: 'VIT Chennai' },
              ].map(award => (
                <div key={award.event} className={styles.awardItem}>
                  <div className={styles.awardTitle}>{award.title}</div>
                  <div className={styles.awardEvent}>{award.event}</div>
                  <div className={styles.awardOrg}>{award.org}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills-section" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Skills</div>
          <h2 className={styles.sectionTitle}>Tech I work with</h2>

          <div className={styles.skillsGrid}>
            {[
              {
                group: 'Languages',
                skills: ['Python', 'Java', 'SQL', 'R', 'TypeScript', 'C'],
              },
              {
                group: 'AI / ML',
                skills: ['Machine Learning', 'Deep Learning', 'NLP', 'RAG', 'LangChain', 'Vertex AI', 'PyTorch', 'TensorFlow', 'Keras', 'XGBoost'],
              },
              {
                group: 'Backend',
                skills: ['Flask', 'FastAPI', 'REST APIs', 'Firebase', 'Dialogflow', 'Gradio'],
              },
              {
                group: 'Frontend',
                skills: ['React', 'Vite', 'Tailwind CSS', 'HTML/CSS'],
              },
              {
                group: 'Data & Analytics',
                skills: ['Pandas', 'NumPy', 'OpenCV', 'Matplotlib', 'Business Analytics'],
              },
              {
                group: 'Tools & Cloud',
                skills: ['GCP', 'Google Colab', 'Jupyter', 'VS Code', 'Figma', 'Docker', 'Git'],
              },
            ].map(group => (
              <div key={group.group} className={styles.skillGroup}>
                <div className={styles.skillGroupTitle}>{group.group}</div>
                <div className={styles.skillList}>
                  {group.skills.map(s => (
                    <span key={s} className={styles.skillPill}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className={styles.certsSection}>
            <div className={styles.sectionLabel} style={{ marginBottom: '1.5rem' }}>Certifications</div>
            <div className={styles.certsGrid}>
              {[
                { name: 'Introduction to Cybersecurity', org: 'Cisco Networking Academy', year: '2024' },
                { name: 'Introduction to Packet Tracer', org: 'Cisco Networking Academy', year: '2024' },
                { name: 'Programming in C#', org: 'Infosys Springboard', year: '2024' },
                { name: 'AI with ML Workshop', org: 'Pravega, IISC Bangalore', year: '2024' },
                { name: 'TensorFlow & Keras', org: 'Great Learning', year: '2025' },
                { name: 'Behavioral Analytics', org: 'Udemy', year: '2026' },
                { name: 'Problem Solving: Complete Guide', org: 'Udemy', year: '2025' },
              ].map(cert => (
                <div key={cert.name} className={styles.certCard}>
                  <div className={styles.certBadge}>✓</div>
                  <div className={styles.certName}>{cert.name}</div>
                  <div className={styles.certOrg}>{cert.org}</div>
                  <div className={styles.certYear}>{cert.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact-section" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Contact</div>
          <h2 className={styles.sectionTitle}>
            Let's build<br />
            <em>something real.</em>
          </h2>
          <p className={styles.bodyText} style={{ maxWidth: '50ch', marginBottom: '3rem' }}>
            Open to internships, collaborations, and interesting problems. If you're building something in AI, backend systems, or data-driven products — let's talk.
          </p>

          <div className={styles.contactGrid}>
            <a href="mailto:kumaraswamyg2004@gmail.com" className={styles.contactCard}>
              <div className={styles.contactIcon}>✉</div>
              <div className={styles.contactLabel}>Email</div>
              <div className={styles.contactValue}>kumaraswamyg2004@gmail.com</div>
            </a>
            <a href="https://www.linkedin.com/in/kumaraswamy-g-872b81277/" target="_blank" rel="noopener" className={styles.contactCard}>
              <div className={styles.contactIcon}>in</div>
              <div className={styles.contactLabel}>LinkedIn</div>
              <div className={styles.contactValue}>kumaraswamy-g</div>
            </a>
            <a href="https://github.com/Kumar070204" target="_blank" rel="noopener" className={styles.contactCard}>
              <div className={styles.contactIcon}>⌥</div>
              <div className={styles.contactLabel}>GitHub</div>
              <div className={styles.contactValue}>Kumar070204</div>
            </a>
          </div>

          <div className={styles.footerLine}>
            <span>© 2025 Kumaraswamy G</span>
            <span className={styles.footerDot}>·</span>
            <span>M.Tech CSE · VIT Chennai</span>
            <span className={styles.footerDot}>·</span>
            <span>Built with Next.js + Three.js</span>
          </div>
        </div>
      </section>
    </>
  );
}
