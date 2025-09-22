import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, ShoppingCart } from "lucide-react";
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

interface BuyerData {
  companyName?: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  purchasingCategories?: string[];
  volume?: string;
  budget?: string;
  certificationRequirements?: string[];
  completeness: number;
}

export default function BuyerRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your intelligent assistant for buyer registration. I\'ll help you set up your purchasing profile efficiently. To get started, tell me about your company - name, what products you\'re looking to purchase, your location, and your typical order volumes...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [buyerData, setBuyerData] = useState<BuyerData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<BuyerData> => {
    const extracted: Partial<BuyerData> = {};
    
    // Extract company name
    const companyPatterns = [
      /(?:company|corporation|corp|inc|ltd|llc)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:company|corp|inc|ltd|llc))?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }

    // Extract products/categories
    const productKeywords = ['meat', 'beef', 'chicken', 'pork', 'protein', 'food', 'restaurant', 'retail', 'wholesale'];
    const foundCategories = productKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundCategories.length > 0) {
      extracted.purchasingCategories = foundCategories;
    }

    // Extract volume/budget information
    const volumeMatch = message.match(/(\d+(?:,\d+)*)\s*(?:tons?|kg|lbs?|pounds?)/i);
    if (volumeMatch) {
      extracted.volume = volumeMatch[0];
    }

    const budgetMatch = message.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|million|m)?/i);
    if (budgetMatch) {
      extracted.budget = budgetMatch[0];
    }

    // Extract location
    const locationMatch = message.match(/(?:in|from|located|based)\s+([^.,\n]+)/i);
    if (locationMatch) {
      extracted.address = locationMatch[1]?.trim();
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<BuyerData>, currentData: BuyerData): string => {
    const missingFields = [];
    
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    if (!currentData.businessNumber) {
      missingFields.push('business registration number');
    }
    if (!currentData.address && !userData.address) {
      missingFields.push('business address');
    }
    if (!currentData.phone) {
      missingFields.push('contact phone');
    }
    if (!currentData.email) {
      missingFields.push('email address');
    }
    if (!currentData.purchasingCategories?.length && !userData.purchasingCategories?.length) {
      missingFields.push('product categories you purchase');
    }
    if (!currentData.volume && !userData.volume) {
      missingFields.push('typical order volumes');
    }

    // If we extracted new data
    if (Object.keys(userData).length > 0) {
      let response = "Excellent! I\'ve identified ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`company name: ${userData.companyName}`);
      if (userData.businessNumber) extractedItems.push(`business number: ${userData.businessNumber}`);
      if (userData.purchasingCategories) extractedItems.push(`product categories: ${userData.purchasingCategories.join(', ')}`);
      if (userData.address) extractedItems.push(`location: ${userData.address}`);
      if (userData.volume) extractedItems.push(`volume: ${userData.volume}`);
      if (userData.budget) extractedItems.push(`budget: ${userData.budget}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your buyer profile, I need a few more details: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('typical order volumes')) {
          response += "What are your typical monthly order volumes? ";
        } else if (missingFields.includes('product categories you purchase')) {
          response += "What specific products do you typically purchase? ";
        }
      } else {
        response += "\n\n🎉 Registration almost complete! Just need to confirm a few final details.";
      }
      
      return response;
    }

    // No new data extracted
    if (missingFields.length > 0) {
      return `I understand! I'll need some additional information to complete the registration. Could you please provide your ${missingFields[0]}?`;
    }

    return "Perfect! All main information has been collected. I'll process your buyer registration.";
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
      const newBuyerData = { ...buyerData, ...extractedData };
      
      const totalFields = 7;
      let filledFields = 0;
      if (newBuyerData.companyName) filledFields++;
      if (newBuyerData.businessNumber) filledFields++;
      if (newBuyerData.address) filledFields++;
      if (newBuyerData.phone) filledFields++;
      if (newBuyerData.email) filledFields++;
      if (newBuyerData.purchasingCategories?.length) filledFields++;
      if (newBuyerData.volume) filledFields++;
      
      newBuyerData.completeness = Math.round((filledFields / totalFields) * 100);
      setBuyerData(newBuyerData);

      const aiResponse = generateAIResponse(extractedData, buyerData);
      
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
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Smart Buyer Registration</h1>
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
                  <span className="font-semibold">{buyerData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${buyerData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.companyName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Company Name</span>
                  {buyerData.companyName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.businessNumber ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Business Number</span>
                  {buyerData.businessNumber && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.purchasingCategories?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Purchase Categories</span>
                  {buyerData.purchasingCategories?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.volume ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Order Volume</span>
                  {buyerData.volume && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {buyerData.companyName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Collected Data:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company:</strong> {buyerData.companyName}</div>
                    {buyerData.address && <div><strong>Location:</strong> {buyerData.address}</div>}
                    {buyerData.volume && <div><strong>Volume:</strong> {buyerData.volume}</div>}
                    {buyerData.budget && <div><strong>Budget:</strong> {buyerData.budget}</div>}
                    {buyerData.purchasingCategories?.length && (
                      <div>
                        <strong>Categories:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buyerData.purchasingCategories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat}
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
                          <span className="text-sm font-medium text-primary">AI Assistant</span>
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
                        <span className="text-sm font-medium text-primary">AI Assistant</span>
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
                    placeholder="Tell me about your company and purchasing needs..."
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