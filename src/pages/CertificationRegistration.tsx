import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface CertificationData {
  organizationName?: string;
  accreditationBody?: string;
  certificationTypes?: string[];
  industries?: string[];
  validityPeriod?: string;
  auditCapacity?: string;
  geographicCoverage?: string[];
  standardsSupported?: string[];
  completeness: number;
}

export default function CertificationRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your specialized assistant for certification body registration. I\'ll help you register your certification and audit services efficiently. Please tell me about your organization - name, accreditation details, types of certifications you provide, industries you serve, and the standards you\'re authorized to certify against...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [certificationData, setCertificationData] = useState<CertificationData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<CertificationData> => {
    const extracted: Partial<CertificationData> = {};
    
    // Extract organization name
    const orgPatterns = [
      /(?:certification|audit|standards|quality)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:certification|audit|standards))?/i
    ];
    
    for (const pattern of orgPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.organizationName = match[1]?.trim();
        break;
      }
    }

    // Extract accreditation body
    const accreditationKeywords = ['ANAB', 'UKAS', 'DAkkS', 'COFRAC', 'ACCREDIA', 'JAS-ANZ', 'INMETRO'];
    const foundAccreditation = accreditationKeywords.find(keyword => 
      message.toUpperCase().includes(keyword)
    );
    if (foundAccreditation) {
      extracted.accreditationBody = foundAccreditation;
    }

    // Extract certification types
    const certKeywords = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 22000', 'HACCP', 'BRC', 'SQF', 'IFS', 'FSSC 22000', 'organic', 'halal', 'kosher'];
    const foundCerts = certKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundCerts.length > 0) {
      extracted.certificationTypes = foundCerts;
    }

    // Extract industries
    const industryKeywords = ['food', 'agriculture', 'manufacturing', 'automotive', 'healthcare', 'aerospace', 'construction', 'energy'];
    const foundIndustries = industryKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundIndustries.length > 0) {
      extracted.industries = foundIndustries;
    }

    // Extract standards
    const standardsKeywords = ['ISO', 'ASTM', 'EN', 'ANSI', 'JIS', 'GB', 'ASME'];
    const foundStandards = standardsKeywords.filter(keyword => 
      message.toUpperCase().includes(keyword)
    );
    if (foundStandards.length > 0) {
      extracted.standardsSupported = foundStandards;
    }

    // Extract validity period
    const validityMatch = message.match(/(\d+)\s*(?:years?|months?)\s*(?:validity|valid|certification period)/i);
    if (validityMatch) {
      extracted.validityPeriod = validityMatch[0];
    }

    // Extract geographic coverage
    const geoKeywords = ['global', 'international', 'regional', 'national', 'local', 'North America', 'Europe', 'Asia', 'Africa', 'Latin America'];
    const foundCoverage = geoKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundCoverage.length > 0) {
      extracted.geographicCoverage = foundCoverage;
    }

    // Extract audit capacity
    const capacityMatch = message.match(/(\d+(?:,\d+)*)\s*(?:audits?|assessments?|certifications?)\s*(?:per|annually|yearly|monthly)/i);
    if (capacityMatch) {
      extracted.auditCapacity = capacityMatch[0];
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<CertificationData>, currentData: CertificationData): string => {
    const missingFields = [];
    
    if (!currentData.organizationName && !userData.organizationName) {
      missingFields.push('organization name');
    }
    if (!currentData.accreditationBody && !userData.accreditationBody) {
      missingFields.push('accreditation body');
    }
    if (!currentData.certificationTypes?.length && !userData.certificationTypes?.length) {
      missingFields.push('certification types offered');
    }
    if (!currentData.industries?.length && !userData.industries?.length) {
      missingFields.push('industries served');
    }
    if (!currentData.standardsSupported?.length && !userData.standardsSupported?.length) {
      missingFields.push('standards supported');
    }
    if (!currentData.geographicCoverage?.length && !userData.geographicCoverage?.length) {
      missingFields.push('geographic coverage');
    }
    if (!currentData.auditCapacity && !userData.auditCapacity) {
      missingFields.push('annual audit capacity');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Excellent! I\'ve identified ";
      const extractedItems = [];
      
      if (userData.organizationName) extractedItems.push(`organization: ${userData.organizationName}`);
      if (userData.accreditationBody) extractedItems.push(`accredited by: ${userData.accreditationBody}`);
      if (userData.certificationTypes) extractedItems.push(`certifications: ${userData.certificationTypes.join(', ')}`);
      if (userData.industries) extractedItems.push(`industries: ${userData.industries.join(', ')}`);
      if (userData.standardsSupported) extractedItems.push(`standards: ${userData.standardsSupported.join(', ')}`);
      if (userData.geographicCoverage) extractedItems.push(`coverage: ${userData.geographicCoverage.join(', ')}`);
      if (userData.auditCapacity) extractedItems.push(`capacity: ${userData.auditCapacity}`);
      if (userData.validityPeriod) extractedItems.push(`validity: ${userData.validityPeriod}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your certification body registration, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('accreditation body')) {
          response += "Which accreditation body has authorized you (ANAB, UKAS, etc.)? ";
        } else if (missingFields.includes('annual audit capacity')) {
          response += "What\'s your annual audit and certification capacity? ";
        }
      } else {
        response += "\n\n🏆 Registration nearly complete! Just finalizing certification credentials.";
      }
      
      return response;
    }

    if (missingFields.length > 0) {
      return `I understand! To proceed with the certification registration, could you provide your ${missingFields[0]}?`;
    }

    return "Perfect! All certification information collected. Processing your certification body registration.";
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const extractedData = analyzeMessage(currentMessage);
      const newCertificationData = { ...certificationData, ...extractedData };
      
      const totalFields = 7;
      let filledFields = 0;
      if (newCertificationData.organizationName) filledFields++;
      if (newCertificationData.accreditationBody) filledFields++;
      if (newCertificationData.certificationTypes?.length) filledFields++;
      if (newCertificationData.industries?.length) filledFields++;
      if (newCertificationData.standardsSupported?.length) filledFields++;
      if (newCertificationData.geographicCoverage?.length) filledFields++;
      if (newCertificationData.auditCapacity) filledFields++;
      
      newCertificationData.completeness = Math.round((filledFields / totalFields) * 100);
      setCertificationData(newCertificationData);

      const aiResponse = generateAIResponse(extractedData, certificationData);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Certification Body Registration</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card border-0 shadow-soft">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Registration Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Complete</span>
                  <span className="font-semibold">{certificationData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${certificationData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${certificationData.organizationName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Organization</span>
                  {certificationData.organizationName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${certificationData.accreditationBody ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Accreditation</span>
                  {certificationData.accreditationBody && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${certificationData.certificationTypes?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Certifications</span>
                  {certificationData.certificationTypes?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${certificationData.industries?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Industries</span>
                  {certificationData.industries?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {certificationData.organizationName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Certification Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Organization:</strong> {certificationData.organizationName}</div>
                    {certificationData.accreditationBody && <div><strong>Accredited by:</strong> {certificationData.accreditationBody}</div>}
                    {certificationData.auditCapacity && <div><strong>Capacity:</strong> {certificationData.auditCapacity}</div>}
                    {certificationData.validityPeriod && <div><strong>Validity:</strong> {certificationData.validityPeriod}</div>}
                    {certificationData.certificationTypes?.length && (
                      <div>
                        <strong>Certifications:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {certificationData.certificationTypes.map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {certificationData.industries?.length && (
                      <div>
                        <strong>Industries:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {certificationData.industries.map((industry, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {certificationData.geographicCoverage?.length && (
                      <div>
                        <strong>Coverage:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {certificationData.geographicCoverage.map((coverage, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {coverage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-primary">Certification AI</span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-4'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center ai-glow">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-primary">Certification AI</span>
                        <Clock className="h-4 w-4 text-muted-foreground animate-spin" />
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell me about your certification services and accreditations..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    size="icon"
                    className="bg-gradient-button hover:opacity-90 text-white border-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}