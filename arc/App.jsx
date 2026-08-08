import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';

const STRIPE_LINK = 'https://buy.stripe.com/bJedR32cy6ea9a4fm3ak000';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

function StarField() {
  return (
    <div aria-hidden="true" style={styles.starField}>
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          style={{
            ...styles.star,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            opacity: Math.random() * 0.6 + 0.2
          }}
        />
      ))}
    </div>
  );
}

function UpgradeModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p style={styles.modalEyebrow}>Manifest Pro</p>
        <h2 style={styles.modalTitle}>Unlock your best manifestation days</h2>
        <p style={styles.modalBody}>
          Pro reveals the numerology-based dates each month when your intentions
          carry the most momentum, plus unlimited stories and affirmations.
        </p>
        <a href={STRIPE_LINK} style={styles.primaryButton} target="_blank" rel="noreferrer">
          Upgrade for $6.99/month
        </a>
        <button style={styles.textButton} onClick={onClose}>Not now</button>
      </div>
    </div>
  );
}

function ShareModal({ story, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p style={styles.modalEyebrow}>Share</p>
        <h2 style={styles.modalTitle}>Carry this with you</h2>
        <p style={styles.shareText}>{story}</p>
        <button style={styles.primaryButton} onClick={copy}>
          {copied ? 'Copied' : 'Copy story'}
        </button>
        <button style={styles.textButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function App() {
  const [intention, setIntention] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [story, setStory] = useState('');
  const [affirmations, setAffirmations] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isPro] = useState(false);

  const generate = async () => {
    if (!intention.trim()) {
      setError('Share what you want to manifest first.');
      return;
    }
    setError('');
    setLoading(true);
    setStory('');
    setAffirmations([]);

    try {
      const prompt = `Write a short, vivid manifestation story (120-180 words) for someone named ${name || 'this person'} whose intention is: "${intention}". Write entirely in past tense, as though the desire has already fully come true. Make it sensory, specific, and emotionally resonant, not generic. Then, on a new line starting with "AFFIRMATIONS:", list exactly 7 short first-person present-tense affirmations related to this intention, one per line, no numbering.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');

      const [storyPart, affirmationsPart] = text.split(/AFFIRMATIONS:/i);
      setStory(storyPart.trim());

      const lines = (affirmationsPart || '')
        .split('\n')
        .map((l) => l.replace(/^[-•\d.]+\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 7);

      setAffirmations(lines);
    } catch (err) {
      setError('The story could not be written right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <StarField />

      <header style={styles.header}>
        <span style={styles.logo}>Manifest Your Reality</span>
        {!isPro && (
          <button style={styles.upgradeChip} onClick={() => setShowUpgrade(true)}>
            Go Pro
          </button>
        )}
      </header>

      <main style={styles.main}>
        {!story && (
          <section style={styles.hero}>
            <p style={styles.eyebrow}>Write it as if it already happened</p>
            <h1 style={styles.heroTitle}>
              Your future,<br />already written.
            </h1>
            <p style={styles.heroSub}>
              Tell us your intention. We'll write the story of you living it,
              and seven affirmations to carry until it's true.
            </p>
          </section>
        )}

        <section style={styles.form}>
          <label style={styles.label} htmlFor="name">Your name (optional)</label>
          <input
            id="name"
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kimberly"
          />

          <label style={styles.label} htmlFor="intention">What are you manifesting?</label>
          <textarea
            id="intention"
            style={styles.textarea}
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="A thriving business that supports my family..."
            rows={3}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.primaryButton} onClick={generate} disabled={loading}>
            {loading ? 'Writing your story...' : 'Manifest it'}
          </button>
        </section>

        {story && (
          <section style={styles.result}>
            <h2 style={styles.resultTitle}>Your story</h2>
            <p style={styles.story}>{story}</p>

            {affirmations.length > 0 && (
              <>
                <h3 style={styles.affirmTitle}>Seven affirmations</h3>
                <ul style={styles.affirmList}>
                  {affirmations.map((a, i) => (
                    <li key={i} style={styles.affirmItem}>{a}</li>
                  ))}
                </ul>
              </>
            )}

            <div style={styles.resultActions}>
              <button style={styles.secondaryButton} onClick={() => setShowShare(true)}>
                Share
              </button>
              <button style={styles.secondaryButton} onClick={() => { setStory(''); setIntention(''); }}>
                Write another
              </button>
            </div>

            {!isPro && (
              <button style={styles.upsellCard} onClick={() => setShowUpgrade(true)}>
                <span style={styles.upsellTitle}>See your best manifestation days</span>
                <span style={styles.upsellSub}>Numerology-based timing, with Pro →</span>
              </button>
            )}
          </section>
        )}
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showShare && <ShareModal story={story} onClose={() => setShowShare(false)} />}
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden'
  },
  starField: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: '50%',
    background: '#e8cd8f',
    animation: 'none'
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)'
  },
  logo: {
    fontFamily: 'var(--serif)',
    fontSize: 22,
    letterSpacing: 0.4,
    color: 'var(--gold-bright)'
  },
  upgradeChip: {
    background: 'transparent',
    border: '1px solid var(--gold)',
    color: 'var(--gold-bright)',
    borderRadius: 999,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 500
  },
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 560,
    margin: '0 auto',
    padding: '32px 20px 80px'
  },
  hero: {
    textAlign: 'center',
    marginBottom: 40
  },
  eyebrow: {
    fontFamily: 'var(--sans)',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: 12
  },
  heroTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 44,
    fontWeight: 500,
    lineHeight: 1.1,
    margin: '0 0 16px',
    color: 'var(--text)'
  },
  heroSub: {
    fontFamily: 'var(--sans)',
    fontSize: 15,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: 420,
    margin: '0 auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginTop: 12
  },
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 16,
    fontFamily: 'var(--sans)'
  },
  textarea: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 16,
    fontFamily: 'var(--sans)',
    resize: 'vertical'
  },
  error: {
    color: '#e29a9a',
    fontSize: 13,
    margin: '4px 0 0'
  },
  primaryButton: {
    display: 'inline-block',
    textAlign: 'center',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
    color: '#1a1206',
    border: 'none',
    borderRadius: 999,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    marginTop: 18
  },
  secondaryButton: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 999,
    padding: '10px 18px',
    fontSize: 14
  },
  textButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    marginTop: 12,
    textDecoration: 'underline'
  },
  result: {
    marginTop: 32
  },
  resultTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 24,
    color: 'var(--gold-bright)',
    marginBottom: 8
  },
  story: {
    fontFamily: 'var(--serif)',
    fontSize: 19,
    lineHeight: 1.7,
    color: 'var(--text)',
    fontStyle: 'italic'
  },
  affirmTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 20,
    color: 'var(--gold-bright)',
    marginTop: 28,
    marginBottom: 8
  },
  affirmList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  affirmItem: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 15,
    color: 'var(--text)'
  },
  resultActions: {
    display: 'flex',
    gap: 10,
    marginTop: 24
  },
  upsellCard: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--gold)',
    borderRadius: 14,
    padding: '16px 18px',
    marginTop: 28
  },
  upsellTitle: {
    display: 'block',
    fontFamily: 'var(--serif)',
    fontSize: 17,
    color: 'var(--gold-bright)'
  },
  upsellSub: {
    display: 'block',
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 4
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(4, 6, 20, 0.75)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 10
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '28px 24px 32px',
    textAlign: 'center'
  },
  modalEyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--gold)',
    margin: 0
  },
  modalTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 26,
    margin: '10px 0 12px',
    color: 'var(--text)'
  },
  modalBody: {
    fontSize: 14,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 20
  },
  shareText: {
    fontFamily: 'var(--serif)',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--text)',
    background: 'var(--bg-elevated)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    maxHeight: 200,
    overflowY: 'auto'
  }
};
