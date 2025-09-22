import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, CreditCard } from "lucide-react";
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

interface LetterOfCreditData {
  bankName?: string;
  lcTypes?: string[];
  maxAmount?: string;
  currencies?: string[];
  swiftCode?: string;
  experience?: string;
  documentaryRequirements?: string[];
  confirmationAvailable?: boolean;
  completeness: number;
}

export default function LetterOfCreditRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I\'m your specialized assistant for Letter of Credit registration. I\'ll help you register your trade finance services efficiently. Please provide details about your bank - name, types of LCs you issue, maximum amounts, supported currencies, documentary requirements, and your international trade finance experience...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lcData, setLcData] = useState<LetterOfCreditData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<LetterOfCreditData> => {
    const extracted: Partial<LetterOfCreditData> = {};
    
    // Extract bank name
    const bankPatterns = [
      /(?:bank|banking|financial)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:bank|banking))?/i
    ];
    
    for (const pattern of bankPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.bankName = match[1]?.trim();
        break;
      }
    }

    // Extract LC types
    const lcKeywords = ['sight LC', 'usance LC', 'standby LC', 'documentary', 'commercial', 'revolving', 'transferable', 'confirmed', 'unconfirmed'];
    const foundTypes = lcKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundTypes.length > 0) {
      extracted.lcTypes = foundTypes;
    }

    // Extract currencies
    const currencyKeywords = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    const foundCurrencies = currencyKeywords.filter(currency => 
      message.toUpperCase().includes(currency)
    );
    if (foundCurrencies.length > 0) {
      extracted.currencies = foundCurrencies;
    }

    // Extract amounts
    const amountMatch = message.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|billion|b|thousand|k)?\s*(USD|EUR|GBP)?/i);
    if (amountMatch) {
      extracted.maxAmount = amountMatch[0];
    }

    // Extract SWIFT code
    const swiftMatch = message.match(/\b([A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?)\b/);
    if (swiftMatch) {
      extracted.swiftCode = swiftMatch[1];
    }

    // Extract experience
    const experienceMatch = message.match(/(\d+)\s*years?\s*(?:of\s*)?(?:experience|exp)/i);
    if (experienceMatch) {
      extracted.experience = experienceMatch[0];
    }

    // Check for confirmation services
    if (message.toLowerCase().includes('confirm') || message.toLowerCase().includes('confirmation')) {
      extracted.confirmationAvailable = true;
    }

    // Extract documentary requirements
    const docKeywords = ['bill of lading', 'commercial invoice', 'packing list', 'certificate of origin', 'insurance certificate'];
    const foundDocs = docKeywords.filter(doc => 
      message.toLowerCase().includes(doc.toLowerCase())
    );
    if (foundDocs.length > 0) {
      extracted.documentaryRequirements = foundDocs;
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<LetterOfCreditData>, currentData: LetterOfCreditData): string => {
    const missingFields = [];
    
    if (!currentData.bankName && !userData.bankName) {
      missingFields.push('bank name');
    }
    if (!currentData.lcTypes?.length && !userData.lcTypes?.length) {
      missingFields.push('LC types offered');
    }
    if (!currentData.maxAmount && !userData.maxAmount) {
      missingFields.push('maximum LC amount');
    }
    if (!currentData.currencies?.length && !userData.currencies?.length) {
      missingFields.push('supported currencies');
    }
    if (!currentData.swiftCode && !userData.swiftCode) {
      missingFields.push('SWIFT/BIC code');
    }
    if (!currentData.experience && !userData.experience) {
      missingFields.push('trade finance experience');
    }
    if (!currentData.documentaryRequirements?.length && !userData.documentaryRequirements?.length) {
      missingFields.push('documentary requirements handling');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Excellent! I\'ve captured ";
      const extractedItems = [];
      
      if (userData.bankName) extractedItems.push(`bank: ${userData.bankName}`);
      if (userData.lcTypes) extractedItems.push(`LC types: ${userData.lcTypes.join(', ')}`);
      if (userData.maxAmount) extractedItems.push(`max amount: ${userData.maxAmount}`);
      if (userData.currencies) extractedItems.push(`currencies: ${userData.currencies.join(', ')}`);
      if (userData.swiftCode) extractedItems.push(`SWIFT: ${userData.swiftCode}`);
      if (userData.experience) extractedItems.push(`experience: ${userData.experience}`);
      if (userData.confirmationAvailable) extractedItems.push('LC confirmation services');
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your Letter of Credit registration, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('documentary requirements handling')) {
          response += "What documentary requirements do you handle (bill of lading, commercial invoice, etc.)? ";
        } else if (missingFields.includes('trade finance experience')) {
          response += "How many years of trade finance experience does your institution have? ";
        }
      } else {
        response += "\n\n💳 Registration nearly complete! Just finalizing trade finance credentials.";
      }
      
      return response;
    }

    if (missingFields.length > 0) {
      return `I understand! To proceed with the Letter of Credit registration, could you provide your ${missingFields[0]}?`;
    }

    return "Perfect! All Letter of Credit information collected. Processing your trade finance registration.";
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
      const newLcData = { ...lcData, ...extractedData };
      
      const totalFields = 7;
      let filledFields = 0;
      if (newLcData.bankName) filledFields++;
      if (newLcData.lcTypes?.length) filledFields++;
      if (newLcData.maxAmount) filledFields++;
      if (newLcData.currencies?.length) filledFields++;
      if (newLcData.swiftCode) filledFields++;
      if (newLcData.experience) filledFields++;
      if (newLcData.documentaryRequirements?.length) filledFields++;
      
      newLcData.completeness = Math.round((filledFields / totalFields) * 100);
      setLcData(newLcData);

      const aiResponse = generateAIResponse(extractedData, lcData);
      
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
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Letter of Credit Registration</h1>
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
                  <span className="font-semibold">{lcData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${lcData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${lcData.bankName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Bank Name</span>
                  {lcData.bankName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${lcData.lcTypes?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">LC Types</span>
                  {lcData.lcTypes?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${lcData.maxAmount ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Max Amount</span>
                  {lcData.maxAmount && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${lcData.currencies?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Currencies</span>
                  {lcData.currencies?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {lcData.bankName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">LC Services:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Bank:</strong> {lcData.bankName}</div>
                    {lcData.maxAmount && <div><strong>Max Amount:</strong> {lcData.maxAmount}</div>}
                    {lcData.swiftCode && <div><strong>SWIFT:</strong> {lcData.swiftCode}</div>}
                    {lcData.experience && <div><strong>Experience:</strong> {lcData.experience}</div>}
                    {lcData.confirmationAvailable && <div><strong>Service:</strong> LC Confirmation Available</div>}
                    {lcData.lcTypes?.length && (
                      <div>
                        <strong>LC Types:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lcData.lcTypes.map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {lcData.currencies?.length && (
                      <div>
                        <strong>Currencies:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lcData.currencies.map((currency, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {currency}
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
                          <span className="text-sm font-medium text-primary">Trade Finance AI</span>
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
                        <span className="text-sm font-medium text-primary">Trade Finance AI</span>
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
                    placeholder="Tell me about your Letter of Credit services..."
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