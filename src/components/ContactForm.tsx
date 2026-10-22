import { useState, type ChangeEvent, type FormEvent } from 'react';
import { cx } from '@/lib/util';
import { Reveal } from './Reveal';

type Field = 'name' | 'email' | 'subject' | 'message';

const EMPTY: Record<Field, string> = { name: '', email: '', subject: '', message: '' };

function Input({
  name,
  label,
  type = 'text',
  value,
  onChange,
  multiline = false,
  autoComplete,
}: {
  name: Field;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const shared = {
    id: name,
    name,
    value,
    onChange,
    required: true,
    placeholder: ' ',
    className:
      'peer block w-full resize-none border-0 border-b border-line bg-transparent pt-7 pb-3 text-lg text-ink outline-none transition-colors focus:border-ink',
  };
  return (
    <div className="relative">
      {multiline ? <textarea rows={4} {...shared} /> : <input type={type} autoComplete={autoComplete} {...shared} />}
      <label
        htmlFor={name}
        className="eyebrow pointer-events-none absolute top-8 left-0 origin-left transition-all duration-500 ease-(--ease-silk) peer-focus:top-0 peer-[:not(:placeholder-shown)]:top-0"
      >
        {label}
      </label>
    </div>
  );
}

const ContactForm = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [formError, setFormError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormError('Please fill out every field.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    // TODO: deliver the message — there is no backend yet, so this only simulates sending.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('Form Submitted:', formData);
    setStatus('submitted');

    setTimeout(() => {
      setFormData(EMPTY);
      setStatus('idle');
    }, 6000);
  };

  return (
    <section id="contact" className="bg-paper-2 px-gutter py-[clamp(6rem,14vw,12rem)] transition-colors">
      <div className="grid gap-x-gutter gap-y-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">03 — Contact</p>
          <h2 className="display mt-5 text-[clamp(2.75rem,5.4vw,5.75rem)]">
            Let’s create your <em>new&nbsp;world</em>.
          </h2>
          <p className="mt-8 max-w-sm leading-relaxed text-ink-2">
            Your time, the place of your choice. Tell me about the moment you’d like to hold on to.
          </p>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
          {status === 'submitted' ? (
            <div role="status" className="flex min-h-[24rem] flex-col justify-center border-t border-line pt-10">
              <p className="display text-[clamp(2.25rem,3.6vw,3.5rem)]">
                Thank <em>you</em>.
              </p>
              <p className="mt-5 max-w-sm leading-relaxed text-ink-2">Your message is on its way. I’ll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid gap-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <Input name="name" label="Your name" value={formData.name} onChange={handleChange} autoComplete="name" />
                <Input name="email" label="Email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" />
              </div>
              <Input name="subject" label="Subject" value={formData.subject} onChange={handleChange} />
              <Input name="message" label="Message" value={formData.message} onChange={handleChange} multiline />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
                <p role="alert" className={cx('text-sm text-ink-2 transition-opacity', !formError && 'opacity-0')}>
                  {formError || ' '}
                </p>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="eyebrow group inline-flex h-14 items-center gap-4 rounded-full bg-ink px-8 text-paper! transition-[opacity,transform] duration-500 ease-(--ease-silk) hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send message'}
                  <span aria-hidden="true" className="transition-transform duration-500 ease-(--ease-silk) group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default ContactForm;
