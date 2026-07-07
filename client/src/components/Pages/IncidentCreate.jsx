import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useFetcher } from '../../hooks/useFetcher.js';
import { createIncidentRequest } from '../../lib/incidentsApi.js';
import './incidents.css';

const createIncidentSchema = z.object({
  title: z.string().min(6, 'Please provide a descriptive title.'),
  description: z
    .string()
    .min(20, 'Description should include impact and symptoms.'),
  application: z.string().min(2, 'Application is required.'),
  service: z.string().min(2, 'Service is required.'),
  customer: z.string().optional(),
  environment: z.enum(['production', 'staging', 'development']),
  priority: z.enum(['p1', 'p2', 'p3', 'p4']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  tags: z.string().optional(),
});

const IncidentCreate = () => {
  const navigate = useNavigate();
  const { fetcher } = useFetcher();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      application: '',
      service: '',
      customer: '',
      environment: 'production',
      priority: 'p2',
      severity: 'high',
      tags: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    const response = await createIncidentRequest(fetcher, payload);
    setSubmitting(false);

    if (!response.success) {
      toast.error(response.error || 'Unable to create incident.');
      return;
    }

    toast.success('Incident created.');
    navigate(`/incidents/${response.data._id}`);
  };

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>Report New Incident</h1>
          <p className="muted-text">
            Capture impact details from client reports and route to engineering
            quickly.
          </p>
        </div>
      </div>

      <form className="incident-form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="field-label" htmlFor="title">
            Incident title
          </label>
          <input
            id="title"
            {...register('title')}
            placeholder="API checkout failures for enterprise clients"
          />
          {errors.title && (
            <p className="validation-text">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            placeholder="What is failing, who is impacted, and when did it start?"
          />
          {errors.description && (
            <p className="validation-text">{errors.description.message}</p>
          )}
        </div>

        <div className="form-grid">
          <div>
            <label className="field-label" htmlFor="application">
              Application
            </label>
            <input
              id="application"
              {...register('application')}
              placeholder="Billing Portal"
            />
            {errors.application && (
              <p className="validation-text">{errors.application.message}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="service">
              Service
            </label>
            <input
              id="service"
              {...register('service')}
              placeholder="Invoice API"
            />
            {errors.service && (
              <p className="validation-text">{errors.service.message}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="customer">
              Customer
            </label>
            <input
              id="customer"
              {...register('customer')}
              placeholder="Acme Telecom"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="environment">
              Environment
            </label>
            <select id="environment" {...register('environment')}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="priority">
              Priority
            </label>
            <select id="priority" {...register('priority')}>
              <option value="p1">P1</option>
              <option value="p2">P2</option>
              <option value="p3">P3</option>
              <option value="p4">P4</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="severity">
              Severity
            </label>
            <select id="severity" {...register('severity')}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="tags">
            Tags
          </label>
          <input
            id="tags"
            {...register('tags')}
            placeholder="payments, integration, outages"
          />
          <p className="muted-text">
            Comma separated tags for easier filtering.
          </p>
        </div>

        <div>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create incident'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentCreate;
