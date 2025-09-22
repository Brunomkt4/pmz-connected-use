import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Ship } from "lucide-react";
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

interface TransportData {
  companyName?: string;
  licenseNumber?: string;
  vehicleTypes?: string[];
  capacity?: string;
  serviceAreas?: string[];
  certifications?: string[];
  insurance?: string;
  temperatureControl?: boolean;
  completeness: number;
}

export default function TransportRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I\'m your specialized assistant for transport company registration. I\'ll help you register your logistics services efficiently. Please tell me about your transport company - name, types of vehicles, service coverage areas, and any special capabilities like refrigerated transport...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = (message: string): Partial<TransportData> => {
    const extracted: Partial<TransportData> = {};
    
    // Extract company name
    const companyPatterns = [
      /(?:transport|logistics|trucking|freight|shipping)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:transport|logistics|trucking|freight))?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }

    // Extract vehicle types
    const vehicleKeywords = ['truck', 'trailer', 'refrigerated', 'freezer', 'dry van', 'flatbed', 'container'];
    const foundVehicles = vehicleKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundVehicles.length > 0) {
      extracted.vehicleTypes = foundVehicles;
    }

    // Extract capacity
    const capacityMatch = message.match(/(\d+(?:,\d+)*)\s*(?:tons?|kg|lbs?|cubic|m3|ft3)/i);
    if (capacityMatch) {
      extracted.capacity = capacityMatch[0];
    }

    // Extract service areas
    const locationKeywords = ['nationwide', 'regional', 'local', 'international', 'cross-border'];
    const areaMatch = message.match(/(?:serve|cover|operate|service)\s+([^.,\n]+)/i);
    if (areaMatch) {
      extracted.serviceAreas = [areaMatch[1].trim()];
    } else {
      const foundAreas = locationKeywords.filter(keyword => 
        message.toLowerCase().includes(keyword)
      );
      if (foundAreas.length > 0) {
        extracted.serviceAreas = foundAreas;
      }
    }

    // Check for temperature control
    if (message.toLowerCase().includes('refrigerat') || message.toLowerCase().includes('frozen') || message.toLowerCase().includes('cold chain')) {
      extracted.temperatureControl = true;
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<TransportData>, currentData: TransportData): string => {
    const missingFields = [];
    
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    if (!currentData.licenseNumber) {
      missingFields.push('transport license number');
    }
    if (!currentData.vehicleTypes?.length && !userData.vehicleTypes?.length) {
      missingFields.push('vehicle types');
    }
    if (!currentData.serviceAreas?.length && !userData.serviceAreas?.length) {
      missingFields.push('service coverage areas');
    }
    if (!currentData.capacity && !userData.capacity) {
      missingFields.push('transport capacity');
    }
    if (!currentData.insurance) {
      missingFields.push('insurance details');
    }
    if (!currentData.certifications?.length) {
      missingFields.push('transport certifications (DOT, HAZMAT, etc.)');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Great! I\'ve captured ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`company: ${userData.companyName}`);
      if (userData.vehicleTypes) extractedItems.push(`vehicles: ${userData.vehicleTypes.join(', ')}`);
      if (userData.serviceAreas) extractedItems.push(`service areas: ${userData.serviceAreas.join(', ')}`);
      if (userData.capacity) extractedItems.push(`capacity: ${userData.capacity}`);
      if (userData.temperatureControl) extractedItems.push('temperature-controlled transport capability');
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your transport registration, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('transport license number')) {
          response += "What\'s your DOT or transport license number? ";
        } else if (missingFields.includes('insurance details')) {
          response += "Please provide your cargo insurance information. ";
        }
      } else {
        response += "\n\n🚛 Registration nearly complete! Just finalizing transport credentials.";
      }
      
      return response;
    }

    if (missingFields.length > 0) {
      return `I see! To proceed with the transport registration, could you provide your ${missingFields[0]}?`;
    }

    return "Excellent! All transport information collected. Processing your logistics registration.";
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
      const newTransportData = { ...transportData, ...extractedData };
      
      const totalFields = 7;
      let filledFields = 0;
      if (newTransportData.companyName) filledFields++;
      if (newTransportData.licenseNumber) filledFields++;
      if (newTransportData.vehicleTypes?.length) filledFields++;
      if (newTransportData.serviceAreas?.length) filledFields++;
      if (newTransportData.capacity) filledFields++;
      if (newTransportData.insurance) filledFields++;
      if (newTransportData.certifications?.length) filledFields++;
      
      newTransportData.completeness = Math.round((filledFields / totalFields) * 100);
      setTransportData(newTransportData);

      const aiResponse = generateAIResponse(extractedData, transportData);
      
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
            <Ship className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Smart Transport Registration</h1>
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
                  <span className="font-semibold">{transportData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${transportData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.companyName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Company Name</span>
                  {transportData.companyName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.vehicleTypes?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Vehicle Fleet</span>
                  {transportData.vehicleTypes?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.serviceAreas?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Service Areas</span>
                  {transportData.serviceAreas?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.capacity ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Transport Capacity</span>
                  {transportData.capacity && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {transportData.companyName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Transport Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company:</strong> {transportData.companyName}</div>
                    {transportData.capacity && <div><strong>Capacity:</strong> {transportData.capacity}</div>}
                    {transportData.temperatureControl && <div><strong>Special:</strong> Temperature Control</div>}
                    {transportData.vehicleTypes?.length && (
                      <div>
                        <strong>Vehicles:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {transportData.vehicleTypes.map((vehicle, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {vehicle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {transportData.serviceAreas?.length && (
                      <div>
                        <strong>Coverage:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {transportData.serviceAreas.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {area}
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
                          <span className="text-sm font-medium text-primary">Transport AI</span>
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
                        <span className="text-sm font-medium text-primary">Transport AI</span>
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
                    placeholder="Tell me about your transport company and fleet..."
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