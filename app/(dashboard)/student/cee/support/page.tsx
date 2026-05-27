import { Metadata } from "next";
import { Mail, Phone, MessageCircle, Bug, HelpCircle, MapPin, ExternalLink, Code } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";


export const metadata: Metadata = {
  title: "Help & Support | CEE Prep",
  description: "Get comprehensive help and support for your CEE preparation journey. Contact our administration or technical team.",
};

const faqs = [
  {
    question: "How do I enroll in a mock test series?",
    answer: "You can enroll by visiting our Pricing page and selecting the plan that suits you best. Once the payment is verified, you will get instant access to the mock tests."
  },
  {
    question: "Are the PYQs solved?",
    answer: "Yes, our Previous Year Questions (PYQs) come with detailed, step-by-step solutions to help you understand the concepts thoroughly."
  },
  {
    question: "I'm facing an issue with my login, what should I do?",
    answer: "If you've forgotten your password, use the 'Forgot Password' link on the login page. If the issue persists, please reach out to our technical support team."
  },
  {
    question: "Can I access the platform on my mobile phone?",
    answer: "Absolutely! Our platform is fully responsive and designed to work seamlessly on desktops, tablets, and mobile devices."
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              How can we help you?
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Whether you need help with your CEE preparation, have questions about our plans, or spotted a bug, our team is here to assist you.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Main Support Cards */}
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mb-4">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Primary Support</CardTitle>
              <CardDescription>General queries & Academic support</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Raj Bijoy Sarmah</h3>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center" asChild>
                  <a href="tel:+917399312760">
                    <Phone className="h-4 w-4" /> +91 7399312760
                  </a>
                </Button>
                <Button className="w-full flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700 text-white" asChild>
                  <a href="https://wa.me/917399312760" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Message
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mb-4">
                <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Secondary Support</CardTitle>
              <CardDescription>Enrollment & Technical assistance</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Alvis Khandakar</h3>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center" asChild>
                  <a href="tel:+919707433568">
                    <Phone className="h-4 w-4" /> +91 9707433568
                  </a>
                </Button>
                <Button className="w-full flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700 text-white" asChild>
                  <a href="https://wa.me/919707433568" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Message
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full w-fit mb-4">
                <Bug className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <CardTitle className="text-xl">Developer & Bug Reports</CardTitle>
              <CardDescription>Website glitches & Feedback</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">Jyotishman Pathak</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-2">
                Found a bug or have a feature request? Reach out to the developer directly.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center group" asChild>
                  <a href="https://jyotishmanpathak.vercel.app/" target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    Developer Portfolio
                    <ExternalLink className="h-3 w-3 ml-1 text-slate-400" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* FAQs Section */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8 mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Can't find the answer you're looking for? Reach out to our support team.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 pl-8 leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Email Contact CTA */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8 mt-24 mb-12">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none" />
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-4 relative z-10">
            Still need help?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10">
            Send us an email and we'll get back to you as soon as possible. Our typical response time is within 24 hours.
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold relative z-10" asChild>
            <a href="mailto:help@ceeprep.in">
              <Mail className="h-5 w-5 mr-2" /> Email Support
            </a>
          </Button>
        </div>
      </div>

    </div>
  );
}
