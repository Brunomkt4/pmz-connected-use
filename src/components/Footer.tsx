import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { title: "Home", href: "/" },
    { title: "Transaction Intelligence", href: "/transaction-intelligence" },
    { title: "Search Results", href: "/search" },
    { title: "History", href: "/history" },
    { title: "Favorites", href: "/favorites" },
  ];

  const registrationLinks = [
    { title: "Supplier Registration", href: "/supplier-registration" },
    { title: "Buyer Registration", href: "/buyer-registration" },
    { title: "Transport Registration", href: "/transport-registration" },
    { title: "Bank Guarantee", href: "/bank-guarantee-registration" },
    { title: "Letter of Credit", href: "/letter-of-credit-registration" },
    { title: "Certification", href: "/certification-registration" },
  ];

  const supportLinks = [
    { title: "Messages", href: "/messages" },
    { title: "Settings", href: "/settings" },
    { title: "Help Center", href: "#" },
    { title: "Documentation", href: "#" },
    { title: "API Access", href: "#" },
  ];

  const legalLinks = [
    { title: "Privacy Policy", href: "#" },
    { title: "Terms of Service", href: "#" },
    { title: "Cookie Policy", href: "#" },
    { title: "GDPR Compliance", href: "#" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Protein Markaz</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Premier AI-driven B2B meat trading platform connecting global suppliers with buyers. 
                Facilitating premium meat transactions with advanced logistics, certifications, and financial guarantees.
              </p>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <div className="font-medium text-white">Protein Markaz DMCC</div>
                  <div>Jumeirah Lakes Towers, Cluster G</div>
                  <div>HDS Tower, Office 3307</div>
                  <div>Dubai, United Arab Emirates</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <div>+971 4 423 7890</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <div>info@meatflow.com</div>
                  <div>support@meatflow.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.title}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Registration Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              {registrationLinks.map((link) => (
                <li key={link.title}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 mb-6">
              {supportLinks.map((link) => (
                <li key={link.title}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-base font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.title}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © {currentYear} Protein Markaz DMCC. All rights reserved. | Licensed in Dubai, UAE
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            <div>
              <strong className="text-gray-300">Business Hours:</strong><br />
              Monday - Friday: 8:00 AM - 6:00 PM GST<br />
              Saturday: 9:00 AM - 2:00 PM GST
            </div>
            <div>
              <strong className="text-gray-300">Certifications:</strong><br />
              ISO 22000, HACCP, Halal Certified<br />
              Dubai Municipality Approved
            </div>
            <div>
              <strong className="text-gray-300">Payment Methods:</strong><br />
              Bank Transfer, Letter of Credit<br />
              Bank Guarantee Accepted
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;