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
    description: "Accurate cost estimation and budgeting services to ensure project financial viability and competitive pricing.",
    scope: "Detailed cost analysis and budget preparation.",
    typicalFee: "Fixed fee per estimate",
    whoIsFor: "Clients needing accurate project costing for planning or tendering.",
    benefits: [
      "Precise cost forecasting",
      "Market-based pricing analysis",
      "Risk assessment and contingency planning",
      "Competitive advantage in tendering"
    ]
  },
  inspection: {
    title: "SITE INSPECTION SERVICES",
    description: "Comprehensive site inspections and condition assessments to identify potential issues and ensure compliance with standards.",
    scope: "Detailed site surveys and condition reporting.",
    typicalFee: "Per inspection basis",
    whoIsFor: "Property owners and developers requiring professional assessments.",
    benefits: [
      "Comprehensive condition assessments",
      "Compliance verification",
      "Risk identification and mitigation",
      "Professional reporting and documentation"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{details.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-700 text-lg leading-relaxed">{details.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Scope</h3>
              <p className="text-gray-600">{details.scope}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Typical Fee Basis*</h3>
              <p className="text-gray-600">{details.typicalFee}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Who is this for?</h3>
              <p className="text-gray-600">{details.whoIsFor}</p>
            </div>
          </div>

          {/* Value Added Section */}
          <div className="bg-blue-900 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Value Added</h3>
            <ul className="space-y-2">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};