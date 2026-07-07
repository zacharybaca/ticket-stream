const PostmortemViewer = ({ postmortem }) => {
  if (!postmortem) {
    return <p className="muted-text">No postmortem documented yet.</p>;
  }

  return (
    <section className="incident-meta-card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Postmortem Summary</h3>
      <p>
        <strong>Summary:</strong> {postmortem.summary || 'n/a'}
      </p>
      <p>
        <strong>Impact:</strong> {postmortem.impact || 'n/a'}
      </p>
      <p>
        <strong>Root cause:</strong> {postmortem.rootCause || 'n/a'}
      </p>
      <p>
        <strong>Timeline:</strong> {postmortem.timeline || 'n/a'}
      </p>
      <p>
        <strong>Lessons learned:</strong> {postmortem.lessonsLearned || 'n/a'}
      </p>
    </section>
  );
};

export default PostmortemViewer;
