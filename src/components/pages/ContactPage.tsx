import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export const ContactPage = ({ onNavigate }: ContactPageProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+61 3 9xxx xxxx",
      description: "Mon-Fri 9:00 AM - 6:00 PM"
    },
    {
      icon: Mail,
      title: "Email",
      value: "hello@skrobaki.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Melbourne, VIC",
      description: "Serving greater Melbourne area"
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "Mon-Fri 9:00-6:00",
      description: "Consultations by appointment"
    }
  ];

  const projectTypes = [
    "New Construction",
    "Renovation",
    "Extension",
    "Commercial",
    "Consultation Only"
  ];

  const process = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "We discuss your vision, requirements, and project scope during a complimentary consultation."
    },
    {
      step: "2", 
      title: "Proposal & Planning",
      description: "We develop a detailed proposal including timelines, budgets, and design concepts."
    },
    {
      step: "3",
      title: "Design Development",
      description: "Our team creates detailed designs, 3D visualizations, and technical documentation."
    },
    {
      step: "4",
      title: "Construction Management",
      description: "We oversee the entire construction process ensuring quality and timeline adherence."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background/95 to-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="heading-xl text-foreground mb-8 font-playfair">
              Contact <span className="text-gradient-gold">Us</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              Ready to transform your vision into reality? Get in touch with our team to discuss your architectural project and discover how we can bring your dreams to life.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, idx) => (
              <Card key={idx} className="glass-card border-brand-gold/10 text-center">
                <CardContent className="p-6">
                  <info.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">{info.title}</h3>
                  <p className="text-foreground text-sm font-medium mb-1">{info.value}</p>
                  <p className="text-muted-foreground text-xs">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="heading-lg text-foreground mb-8 font-playfair">
                Start Your Project
              </h2>
              <p className="body-md text-muted-foreground mb-8">
                Fill out the form below and we'll get back to you within 24 hours to schedule your complimentary consultation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-minimal"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-minimal"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input-minimal"
                      placeholder="+61 xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Type
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                      className="w-full input-minimal rounded-lg"
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Details *
                  </label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="input-minimal min-h-32"
                    placeholder="Tell us about your project vision, requirements, timeline, and any specific questions you have..."
                  />
                </div>

                <button 
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl w-full"
                  style={{ 
                    backgroundColor: 'rgb(54,119,159)',
                    boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                    border: 'none'
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Process Overview */}
            <div>
              <h3 className="heading-md text-foreground mb-8 font-playfair">
                Our Process
              </h3>
              <div className="space-y-6">
                {process.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-gold font-medium text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="glass-card border-brand-gold/10 mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-brand-gold" />
                    <h4 className="font-medium text-foreground">Complimentary Consultation</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your initial consultation is completely free. We'll discuss your project, answer questions, and provide preliminary insights with no obligation.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-8">
                <button 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl w-full"
                  style={{ 
                    backgroundColor: 'rgb(54,119,159)',
                    boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                    border: 'none'
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Direct Call
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="heading-lg text-card-foreground mb-12 text-center font-playfair">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "What's included in the initial consultation?",
                answer: "Our complimentary consultation includes project assessment, preliminary design discussion, timeline overview, and budget estimation. We'll also answer any questions about our process and services."
              },
              {
                question: "How long does a typical project take?",
                answer: "Project timelines vary based on scope and complexity. Residential projects typically range from 6-18 months, including design and construction phases. We provide detailed timelines during the planning phase."
              },
              {
                question: "Do you handle permits and approvals?",
                answer: "Yes, we manage all necessary permits, council submissions, and regulatory approvals as part of our comprehensive service. Our team has extensive experience with Melbourne's building regulations."
              },
              {
                question: "What areas do you service?",
                answer: "We primarily serve the greater Melbourne area, including inner suburbs and select regional projects. Contact us to discuss your specific location."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="glass-card border-brand-gold/10">
                <CardContent className="p-6">
                  <h4 className="font-medium text-card-foreground mb-3">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};