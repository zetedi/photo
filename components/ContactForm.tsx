
import React, { useState } from 'react';
import { generateConcept } from '../services/geminiService';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    idea: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const [concept, setConcept] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateConcept = async () => {
      if (!formData.idea) {
          setConcept('Please describe your photoshoot idea first.');
          return;
      }
      setIsGenerating(true);
      setConcept('');
      try {
          const generatedText = await generateConcept(formData.idea);
          setConcept(generatedText);
      } catch (error) {
          console.error("Error generating concept:", error);
          setConcept('Sorry, I couldn\'t generate a concept at this time. Please try again.');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormError('Please fill out all required fields.');
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setFormError('Please enter a valid email address.');
        return;
    }

    setStatus('submitting');
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form Submitted:', formData);
    setStatus('submitted');

    // Reset form after a delay
    setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', idea: '', message: '' });
        setConcept('');
        setStatus('idle');
    }, 5000);
  };

  return (
    <section id="contact" className="py-20 bg-brand-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif font-bold text-center text-white mb-12">Get In Touch</h2>
        <div className="max-w-3xl mx-auto">
          {status === 'submitted' ? (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-center">
              <h3 className="font-bold text-xl">Thank You!</h3>
              <p>Your message has been sent successfully. I'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input type="text" name="name" placeholder="Your Name *" value={formData.name} onChange={handleChange} className="bg-brand-bg border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" required />
                <input type="email" name="email" placeholder="Your Email *" value={formData.email} onChange={handleChange} className="bg-brand-bg border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" required />
              </div>
              <div className="mb-6">
                <input type="text" name="subject" placeholder="Subject *" value={formData.subject} onChange={handleChange} className="w-full bg-brand-bg border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" required />
              </div>
              
              <div className="mb-6 bg-brand-bg p-4 rounded-lg border border-gray-700">
                <label htmlFor="idea" className="block text-brand-text-secondary mb-2">Photoshoot Idea (Optional)</label>
                <textarea name="idea" id="idea" rows={2} placeholder="e.g., a moody, urban-style engagement shoot at night" value={formData.idea} onChange={handleChange} className="w-full bg-brand-surface border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"></textarea>
                <button type="button" onClick={handleGenerateConcept} disabled={isGenerating} className="mt-3 bg-brand-primary/20 text-brand-primary-hover font-bold py-2 px-5 rounded-full hover:bg-brand-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGenerating ? 'Generating...' : '✨ Generate Creative Concept'}
                </button>
                {concept && (
                    <div className="mt-4 p-4 bg-brand-surface rounded-md border border-brand-primary/30">
                        <p className="text-brand-text-secondary italic">{concept}</p>
                    </div>
                )}
              </div>

              <div className="mb-6">
                <textarea name="message" rows={5} placeholder="Your Message *" value={formData.message} onChange={handleChange} className="w-full bg-brand-bg border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" required></textarea>
              </div>

              {formError && <p className="text-red-400 text-center mb-4">{formError}</p>}

              <div className="text-center">
                <button type="submit" disabled={status === 'submitting'} className="bg-brand-primary text-brand-bg font-bold py-3 px-12 rounded-full hover:bg-brand-primary-hover transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait">
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
