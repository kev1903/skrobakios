
import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const SupportPage = () => {
  const faqs = [
    {
      question: "How accurate are the cost estimates?",
      answer: "Our AI-powered estimates are typically within 10-15% of actual costs for most construction projects. Accuracy improves with more detailed project documentation and historical data."
    },
    {
      question: "What types of documents can I upload?",
      answer: "You can upload PDF files including architectural plans, engineering reports, soil studies, and any other relevant project documentation. Our system works best with detailed technical drawings and specifications."
    },
    {
      question: "How long does it take to process estimates?",
      answer: "Most projects are processed within 2-4 hours, depending on the complexity and number of documents. You'll receive email notifications as each WBS component is completed."
    },
    {
      question: "Can I modify the estimates?",
      answer: "Yes, you can adjust individual WBS components and add custom items. The system will recalculate totals automatically and maintain a history of your changes."
    },
    {
      question: "Is my project data secure?",
      answer: "Absolutely. All uploaded documents and project data are encrypted and stored securely. We never share your project information with third parties."
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support & FAQ</h1>
            <p className="text-gray-600">Get help with your construction estimating projects</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get detailed help via email</p>
                <Button variant="outline" className="w-full">
                  support@estimateai.com
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Speak with our experts</p>
                <Button variant="outline" className="w-full">
                  1-800-ESTIMATE
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Chat with us in real-time</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Getting Started Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Your Documents</h4>
                    <p className="text-gray-600">Upload PDF files including architectural plans, engineering reports, and project specifications.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Processing</h4>
                    <p className="text-gray-600">Our AI analyzes your documents and identifies WBS components for cost estimation.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Review Estimates</h4>
                    <p className="text-gray-600">Review detailed cost breakdowns for each component and export data as needed.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
