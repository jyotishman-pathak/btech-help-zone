import Link from "next/link";
import { Brain, Mail, Phone, MapPin, } from "lucide-react";
import { SocialIcon } from "react-social-icons";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">B Tech Help Zone</span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Empowering engineering students with quality study materials.
            </p>
            <div className="mt-4 flex gap-4">
              <SocialIcon url="https://x.com/home" className="h-5 w-5 text-gray-500 hover:text-blue-500 cursor-pointer" />
              <SocialIcon url="https://www.linkedin.com/feed/" className="h-5 w-5 text-gray-500 hover:text-blue-700 cursor-pointer" />
             
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/papers" className="text-gray-600 hover:text-blue-600">Question Papers</Link></li>
              <li><Link href="/notes" className="text-gray-600 hover:text-blue-600">Notes</Link></li>
              <li><Link href="/mock-tests" className="text-gray-600 hover:text-blue-600">Mock Tests</Link></li>
              <li><Link href="/premium" className="text-gray-600 hover:text-blue-600">Premium Plans</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> help@btechhelpzone.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 63626263626262</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Online platform for India's engineers</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          © 2025 B Tech Help Zone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}