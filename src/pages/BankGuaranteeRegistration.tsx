import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Shield } from "lucide-react";
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

interface BankGuaranteeData {
  bankName?: string;
  guaranteeTypes?: string[];
  maxAmount?: string;
  currency?: string;
  validityPeriod?: string;
  swiftCode?: string;
  contactPerson?: string;
  rating?: string;
  completeness: number;
}

export default function BankGuaranteeRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your specialized assistant for bank guarantee registration. I\'ll help you set up your financial guarantee services efficiently. Please provide information about your bank - name, types of guarantees you issue, maximum guarantee amounts, supported currencies, and your international banking credentials...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [guaranteeData, setGuaranteeData] = useState<BankGuaranteeData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<BankGuaranteeData> => {
    const extracted: Partial<BankGuaranteeData> = {};
    
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

    // Extract guarantee types
    const guaranteeKeywords = ['performance', 'payment', 'advance payment', 'bid bond', 'warranty', 'maintenance', 'financial', 'standby LC'];
    const foundTypes = guaranteeKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundTypes.length > 0) {
      extracted.guaranteeTypes = foundTypes;
    }

    // Extract amounts and currency
    const amountMatch = message.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|billion|b|thousand|k)?\s*(USD|EUR|GBP|JPY|CAD|AUD)?/i);
    if (amountMatch) {
      extracted.maxAmount = amountMatch[0];
      if (amountMatch[2]) {
        extracted.currency = amountMatch[2].toUpperCase();
      }
    }

    // Extract SWIFT code
    const swiftMatch = message.match(/\b([A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?)\b/);
    if (swiftMatch) {
      extracted.swiftCode = swiftMatch[1];
    }

    // Extract validity period
    const validityMatch = message.match(/(\d+)\s*(?:days?|months?|years?)/i);
    if (validityMatch) {
      extracted.validityPeriod = validityMatch[0];
    }

    // Extract rating
    const ratingMatch = message.match(/(AAA|AA\+|AA|AA-|A\+|A|A-|BBB\+|BBB|BBB-|BB\+|BB|BB-)/i);
    if (ratingMatch) {
      extracted.rating = ratingMatch[1].toUpperCase();
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<BankGuaranteeData>, currentData: BankGuaranteeData): string => {
    const missingFields = [];
    
    if (!currentData.bankName && !userData.bankName) {
      missingFields.push('bank name');
    }
    if (!currentData.guaranteeTypes?.length && !userData.guaranteeTypes?.length) {
      missingFields.push('guarantee types offered');
    }
    if (!currentData.maxAmount && !userData.maxAmount) {
      missingFields.push('maximum guarantee amount');
    }
    if (!currentData.swiftCode && !userData.swiftCode) {
      missingFields.push('SWIFT/BIC code');
    }
    if (!currentData.currency && !userData.currency) {
      missingFields.push('supported currencies');
    }
    if (!currentData.rating && !userData.rating) {
      missingFields.push('credit rating');
    }
    if (!currentData.contactPerson) {
      missingFields.push('authorized contact person');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Excellent! I\'ve identified ";
      const extractedItems = [];
      
      if (userData.bankName) extractedItems.push(`bank: ${userData.bankName}`);
      if (userData.guaranteeTypes) extractedItems.push(`guarantee types: ${userData.guaranteeTypes.join(', ')}`);
      if (userData.maxAmount) extractedItems.push(`max amount: ${userData.maxAmount}`);
      if (userData.currency) extractedItems.push(`currency: ${userData.currency}`);
      if (userData.swiftCode) extractedItems.push(`SWIFT code: ${userData.swiftCode}`);
      if (userData.rating) extractedItems.push(`rating: ${userData.rating}`);
      if (userData.validityPeriod) extractedItems.push(`validity: ${userData.validityPeriod}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your bank guarantee registration, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('SWIFT/BIC code')) {
          response += "What\'s your bank\'s SWIFT/BIC code for international transactions? ";
        } else if (missingFields.includes('credit rating')) {
          response += "What\'s your bank\'s current credit rating (Moody\'s, S&P, etc.)? ";
        }
      } else {
        response += "\n\n🏦 Registration nearly complete! Just finalizing guarantee credentials.";
      }
      
      return response;
    }

    if (missingFields.length > 0) {
      return `I understand! To proceed with the bank guarantee registration, could you provide your ${missingFields[0]}?`;
    }

    return "Perfect! All bank guarantee information collected. Processing your financial services registration.";
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
      const newGuaranteeData = { ...guaranteeData, ...extractedData };
      
      const totalFields = 7;
      let filledFields = 0;
      if (newGuaranteeData.bankName) filledFields++;
      if (newGuaranteeData.guaranteeTypes?.length) filledFields++;
      if (newGuaranteeData.maxAmount) filledFields++;
      if (newGuaranteeData.swiftCode) filledFields++;
      if (newGuaranteeData.currency) filledFields++;
      if (newGuaranteeData.rating) filledFields++;
      if (newGuaranteeData.contactPerson) filledFields++;
      
      newGuaranteeData.completeness = Math.round((filledFields / totalFields) * 100);
      setGuaranteeData(newGuaranteeData);

      const aiResponse = generateAIResponse(extractedData, guaranteeData);
      
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
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bank Guarantee Registration</h1>
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
                  <span className="font-semibold">{guaranteeData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${guaranteeData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.bankName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Bank Name</span>
                  {guaranteeData.bankName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.guaranteeTypes?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Guarantee Types</span>
                  {guaranteeData.guaranteeTypes?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.maxAmount ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Max Amount</span>
                  {guaranteeData.maxAmount && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${guaranteeData.swiftCode ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">SWIFT Code</span>
                  {guaranteeData.swiftCode && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {guaranteeData.bankName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Bank Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Bank:</strong> {guaranteeData.bankName}</div>
                    {guaranteeData.maxAmount && <div><strong>Max Amount:</strong> {guaranteeData.maxAmount}</div>}
                    {guaranteeData.currency && <div><strong>Currency:</strong> {guaranteeData.currency}</div>}
                    {guaranteeData.swiftCode && <div><strong>SWIFT:</strong> {guaranteeData.swiftCode}</div>}
                    {guaranteeData.rating && <div><strong>Rating:</strong> {guaranteeData.rating}</div>}
                    {guaranteeData.validityPeriod && <div><strong>Validity:</strong> {guaranteeData.validityPeriod}</div>}
                    {guaranteeData.guaranteeTypes?.length && (
                      <div>
                        <strong>Services:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guaranteeData.guaranteeTypes.map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {type}
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
                          <span className="text-sm font-medium text-primary">Banking AI</span>
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
                        <span className="text-sm font-medium text-primary">Banking AI</span>
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
                    placeholder="Tell me about your bank guarantee services..."
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