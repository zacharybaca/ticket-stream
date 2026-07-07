import { useState } from 'react';

const PostmortemEditor = ({ value, onSave, onExport }) => {
  const [formState, setFormState] = useState({
    summary: value?.summary || '',
    impact: value?.impact || '',
    rootCause: value?.rootCause || '',
    timeline: value?.timeline || '',
    lessonsLearned: value?.lessonsLearned || '',
  });

  const handleChange = (event) => {
    const { name, value: fieldValue } = event.target;
    setFormState((current) => ({ ...current, [name]: fieldValue }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formState);
  };

  return (
    <section className="incident-form" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Postmortem</h3>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="pm-summary">
            Summary
          </label>
          <textarea
            id="pm-summary"
            name="summary"
            rows={3}
            value={formState.summary}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pm-impact">
            Impact
          </label>
          <textarea
            id="pm-impact"
            name="impact"
            rows={3}
            value={formState.impact}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pm-rootCause">
            Root cause
          </label>
          <textarea
            id="pm-rootCause"
            name="rootCause"
            rows={3}
            value={formState.rootCause}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pm-timeline">
            Timeline
          </label>
          <textarea
            id="pm-timeline"
            name="timeline"
            rows={3}
            value={formState.timeline}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pm-lessonsLearned">
            Lessons learned
          </label>
          <textarea
            id="pm-lessonsLearned"
            name="lessonsLearned"
            rows={3}
            value={formState.lessonsLearned}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="primary-btn">
            Save postmortem
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => onExport('json')}
          >
            Record export
          </button>
        </div>
      </form>
    </section>
  );
};

export default PostmortemEditor;
