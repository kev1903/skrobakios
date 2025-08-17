import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string | null;
}

const serviceDetails = {
  advisory: {
    title: "ADVISORY",
    description: "Robust front-end planning has been shown to lower total capital cost 10%, shorten schedule 7% and trim change-orders 5%.",
    scope: "Stages 1-3 only - brief, concept, definition. PDF reports & meeting workshops.",
    typicalFee: "Lump-sum",
    whoIsFor: "Ideal for clients who just want early clarity before committing.",
    benefits: [
      "Front-end clarity prevents downstream chaos.",
      "Aligns brief, scope & budget before design spend.",
      "Early risk workshops cut late design changes and permit re-submissions.",
      "Owners get a 'go / no-go' decision for < 2 % of project cost."
    ]
  },
  project: {
    title: "PROJECT MANAGEMENT",
    description: "End-to-end management of projects, ensuring they are delivered on time, within budget, and to the highest quality standards while protecting the client's interest.",
    scope: "Full project lifecycle management from inception to completion.",
    typicalFee: "Percentage of construction cost",
    whoIsFor: "Clients who want professional oversight and coordination throughout their project.",
    benefits: [
      "Expert project coordination and scheduling",
      "Budget management and cost control",
      "Quality assurance and compliance oversight",
      "Risk management and mitigation strategies"
    ]
  },
  construction: {
    title: "CONSTRUCTION MANAGEMENT",
    description: "Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution.",
    scope: "On-site construction oversight and coordination.",
    typicalFee: "Fixed fee or percentage",
    whoIsFor: "Projects requiring dedicated on-site management and coordination.",
    benefits: [
      "Direct trade coordination and scheduling",
      "Quality control and safety oversight",
      "Progress monitoring and reporting",
      "Issue resolution and problem-solving"
    ]
  },
  estimating: {
    title: "ESTIMATING SERVICES",
    description: "Comprehensive cost estimation and budget management services to maintain financial control throughout your project lifecycle.",
    scope: "Single-point estimates to detailed quantity take-offs and ongoing cost monitoring.",
    typicalFee: "Fixed fee per service",
    whoIsFor: "Clients requiring accurate cost control and competitive tendering strategies.",
    benefits: [
      "Single-Point Budget Estimate: Reality-check the design early",
      "Cost Plan — 3 Updates: DD → Tender → Pre-let. Keep the budget honest at every design gate",
      "Detailed Quantity Take-Off & BoQ: Apples-to-apples tendering",
      "Trade Bid Analysis: Close scope gaps and cut 3-7% from trade prices",
      "Variation Review: Independent check that stops inflated claims",
      "Progress-Claim Assessment: Pay only for work actually done"
    ]
  },
  inspection: {
    title: "SITE INSPECTION SERVICES",
    description: "Professional inspection services to protect your investment and optimize building performance throughout its lifecycle.",
    scope: "Comprehensive health-checks from construction through post-occupancy performance monitoring.",
    typicalFee: "Per inspection basis / A$250 call-out (first 60 min incl.)",
    whoIsFor: "Property owners seeking to maximize asset performance and protect final payments.",
    benefits: [
      "Schedule Health-Check: Recover lost days on the critical path",
      "Defects & Practical Completion Inspection: Snag list with severity coding to protect final-payment retention",
      "Post-Occupancy Health Check Audit: 12-month operating-cost benchmark to uncover lifecycle savings",
      "On-Site Issue Diagnosis & Advice: A$250 call-out (first 60 min incl.) for rapid defect triage, with photo log and next-step guidance"
    ]
  },
  design: {
    title: "DESIGN & VISUALISATION",
    description: "Creative design solutions and 3D visualizations to bring your vision to life with cutting-edge technology.",
    scope: "Concept through detailed design with 3D modeling.",
    typicalFee: "Design fee percentage",
    whoIsFor: "Clients wanting innovative design solutions and clear visualizations.",
    benefits: [
      "Creative and functional design solutions",
      "Photorealistic 3D visualizations",
      "Design optimization and value engineering",
      "Clear communication of design intent"
    ]
  },
  bim: {
    title: "BIM SERVICES",
    description: "Building Information Modeling services for enhanced project coordination, clash detection, and digital collaboration.",
    scope: "3D modeling, coordination, and digital project delivery.",
    typicalFee: "Project-based fee",
    whoIsFor: "Complex projects requiring advanced coordination and collaboration.",
    benefits: [
      "Enhanced project coordination",
      "Clash detection and resolution",
      "Improved collaboration and communication",
      "Digital asset creation and management"
    ]
  },
  digital: {
    title: "DIGITAL DELIVERY & ANALYTICS",
    description: "Advanced digital delivery solutions and analytics to optimize project performance and data-driven decision making.",
    scope: "Digital tools implementation and performance analytics.",
    typicalFee: "Technology licensing and consulting",
    whoIsFor: "Forward-thinking clients embracing digital transformation.",
    benefits: [
      "Data-driven decision making",
      "Performance optimization",
      "Digital workflow automation",
      "Advanced analytics and reporting"
    ]
  }
};

export const ServiceModal = ({ isOpen, onClose, service }: ServiceModalProps) => {
  if (!isOpen || !service) return null;

  const details = serviceDetails[service as keyof typeof serviceDetails];
  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-gray-900/90 border border-gray-700/50 shadow-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto font-inter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-100">{details.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-100 hover:bg-gray-800/50">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-300 text-lg leading-relaxed">{details.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-200">Scope</h3>
              <p className="text-gray-400">{details.scope}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-200">Typical Fee Basis*</h3>
              <p className="text-gray-400">{details.typicalFee}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-200">Who is this for?</h3>
              <p className="text-gray-400">{details.whoIsFor}</p>
            </div>
          </div>

          {/* Value Added Section */}
          <div className="backdrop-blur-lg bg-gray-800/80 border border-gray-600/50 text-white p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-100">Value Added</h3>
            <ul className="space-y-2">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 backdrop-blur-lg bg-gray-900/50">
          <Button onClick={onClose} className="w-full bg-gray-700/80 hover:bg-gray-600/80 text-gray-100 border border-gray-600/50">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};