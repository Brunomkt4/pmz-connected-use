import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Building2 } from "lucide-react";
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
  isTyping?: boolean;
}

interface SupplierData {
  companyName?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  products?: string[];
  certifications?: string[];
  capacity?: string;
  experience?: string;
  technicalDatasheet?: string;
  productTypes?: string[];
  minimumOrderQuantity?: string;
  deliveryTime?: string;
  deliveryLocation?: string;
  completeness: number;
}

export default function SupplierRegistration() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I am your intelligent assistant for supplier registration. I will help you register your company quickly and efficiently. To get started, tell me a bit about your company - name, products you offer, where it is located...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supplierData, setSupplierData] = useState<SupplierData>({ completeness: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateDeliveryTime = (supplierLocation: string, deliveryLocation: string): string => {
    // Basic distance calculation logic - in a real app, you'd use a proper geolocation API
    const distances: { [key: string]: number } = {
      'same_city': 1,
      'same_state': 3,
      'same_region': 7,
      'different_region': 14,
      'international': 21
    };

    if (!supplierLocation || !deliveryLocation) return '';

    const supplier = supplierLocation.toLowerCase();
    const delivery = deliveryLocation.toLowerCase();

    // Simple logic - you could expand this with real geographic data
    if (supplier.includes(delivery.split(' ')[0]) || delivery.includes(supplier.split(' ')[0])) {
      return `${distances.same_city} business days`;
    } else if (supplier.includes('sp') && delivery.includes('sp') || 
               supplier.includes('rj') && delivery.includes('rj')) {
      return `${distances.same_state} business days`;
    } else {
      return `${distances.different_region} business days`;
    }
  };

  const analyzeMessage = (message: string): Partial<SupplierData> => {
    const extracted: Partial<SupplierData> = {};
    
    // Extract company name (basic pattern)
    const companyPatterns = [
      /(?:company|corporation|ltd|llc|inc|corp)\s+([^.,\n]+)/i,
      /^([A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÇA-Z][a-záéíóúâêîôûàèìòùça-z\s&]+)(?:\s+ltd|llc|inc|corp)?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }

    // Extract CNPJ
    const cnpjMatch = message.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/);
    if (cnpjMatch) {
      extracted.cnpj = cnpjMatch[1];
    }

    // Extract products
    const productKeywords = ['meat', 'chicken', 'pork', 'beef', 'poultry', 'protein', 'butcher', 'slaughterhouse'];
    const foundProducts = productKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundProducts.length > 0) {
      extracted.products = foundProducts;
    }

    // Extract location
    const locationMatch = message.match(/(?:in|at|located|situated)\s+([^.,\n]+)/i);
    if (locationMatch) {
      extracted.address = locationMatch[1]?.trim();
    }

    // Extract technical datasheet
    if (message.toLowerCase().includes('datasheet') || message.toLowerCase().includes('technical sheet')) {
      extracted.technicalDatasheet = 'Mentioned';
    }

    // Extract product types
    const productTypeKeywords = ['product type', 'categories', 'cuts', 'processed', 'fresh', 'frozen'];
    const foundProductTypes = productTypeKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundProductTypes.length > 0) {
      extracted.productTypes = foundProductTypes;
    }

    // Extract minimum order quantity
    const quantityMatch = message.match(/(?:minimum quantity|minimum order|minimum batch)[\s:]*(\d+[^\s]*)/i);
    if (quantityMatch) {
      extracted.minimumOrderQuantity = quantityMatch[1];
    }

    // Extract delivery location for time calculation
    const deliveryMatch = message.match(/(?:delivery|deliver|ship)[\s\w]*(?:to|in|at)\s+([^.,\n]+)/i);
    if (deliveryMatch) {
      extracted.deliveryLocation = deliveryMatch[1]?.trim();
      if (extracted.deliveryLocation && supplierData.address) {
        extracted.deliveryTime = calculateDeliveryTime(supplierData.address, extracted.deliveryLocation);
      }
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<SupplierData>, currentData: SupplierData): string => {
    const missingFields = [];
    
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    if (!currentData.cnpj && !userData.cnpj) {
      missingFields.push('registration number');
    }
    if (!currentData.address && !userData.address) {
      missingFields.push('address');
    }
    if (!currentData.phone) {
      missingFields.push('phone');
    }
    if (!currentData.email) {
      missingFields.push('email');
    }
    if (!currentData.certifications || currentData.certifications.length === 0) {
      missingFields.push('certifications (FDA, ISO, etc.)');
    }
    if (!currentData.capacity) {
      missingFields.push('production capacity');
    }
    if (!currentData.technicalDatasheet) {
      missingFields.push('product technical datasheet');
    }
    if (!currentData.productTypes || currentData.productTypes.length === 0) {
      missingFields.push('product types');
    }
    if (!currentData.minimumOrderQuantity) {
      missingFields.push('minimum order quantity');
    }
    if (!currentData.deliveryLocation) {
      missingFields.push('delivery location to calculate timeframe');
    }

    // If we extracted new data
    if (Object.keys(userData).length > 0) {
      let response = "Perfect! I was able to identify ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`company name: ${userData.companyName}`);
      if (userData.cnpj) extractedItems.push(`registration: ${userData.cnpj}`);
      if (userData.products) extractedItems.push(`products: ${userData.products.join(', ')}`);
      if (userData.address) extractedItems.push(`location: ${userData.address}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your registration, I need some additional information: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('certifications (FDA, ISO, etc.)')) {
          response += "Do you have certifications such as FDA, ISO 22000 or others? ";
        } else if (missingFields.includes('production capacity')) {
          response += "What is your monthly production capacity? ";
        }
      } else {
        response += "\n\n🎉 Registration almost complete! I just need to confirm a few final details.";
      }
      
      return response;
    }

    // No new data extracted
    if (missingFields.length > 0) {
      return `I understand! I'll need some additional information to complete the registration. Could you provide the ${missingFields[0]}?`;
    }

    return "Excellent! All main information has been collected. I will process your registration.";
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

    // Simulate AI processing
    setTimeout(() => {
      const extractedData = analyzeMessage(currentMessage);
      const newSupplierData = { ...supplierData, ...extractedData };
      
      // Calculate completeness
      const totalFields = 11; // companyName, cnpj, address, phone, email, certifications, capacity, technicalDatasheet, productTypes, minimumOrderQuantity, deliveryLocation
      let filledFields = 0;
      if (newSupplierData.companyName) filledFields++;
      if (newSupplierData.cnpj) filledFields++;
      if (newSupplierData.address) filledFields++;
      if (newSupplierData.phone) filledFields++;
      if (newSupplierData.email) filledFields++;
      if (newSupplierData.certifications?.length) filledFields++;
      if (newSupplierData.capacity) filledFields++;
      if (newSupplierData.technicalDatasheet) filledFields++;
      if (newSupplierData.productTypes?.length) filledFields++;
      if (newSupplierData.minimumOrderQuantity) filledFields++;
      if (newSupplierData.deliveryLocation) filledFields++;
      
      newSupplierData.completeness = Math.round((filledFields / totalFields) * 100);
      
      setSupplierData(newSupplierData);

      const aiResponse = generateAIResponse(extractedData, supplierData);
      
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
        {/* Header */}
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
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Intelligent Supplier Registration</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card border-0 shadow-soft">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Registration Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Completeness</span>
                  <span className="font-semibold">{supplierData.completeness}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-button h-2 rounded-full transition-all duration-500"
                    style={{ width: `${supplierData.completeness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.companyName ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Company Name</span>
                  {supplierData.companyName && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.cnpj ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">CNPJ</span>
                  {supplierData.cnpj && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.products?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Products</span>
                  {supplierData.products?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.address ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Location</span>
                  {supplierData.address && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.technicalDatasheet ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Technical Datasheet</span>
                  {supplierData.technicalDatasheet && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.productTypes?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Product Types</span>
                  {supplierData.productTypes?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.minimumOrderQuantity ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Min. Quantity</span>
                  {supplierData.minimumOrderQuantity && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.deliveryTime ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Delivery Time</span>
                  {supplierData.deliveryTime && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {supplierData.companyName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Collected Data:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company:</strong> {supplierData.companyName}</div>
                    {supplierData.cnpj && <div><strong>Registration:</strong> {supplierData.cnpj}</div>}
                    {supplierData.address && <div><strong>Location:</strong> {supplierData.address}</div>}
                    {supplierData.technicalDatasheet && <div><strong>Technical Datasheet:</strong> {supplierData.technicalDatasheet}</div>}
                    {supplierData.minimumOrderQuantity && <div><strong>Min. Quantity:</strong> {supplierData.minimumOrderQuantity}</div>}
                    {supplierData.deliveryTime && <div><strong>Delivery Time:</strong> {supplierData.deliveryTime}</div>}
                    {supplierData.products?.length && (
                      <div>
                        <strong>Products:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supplierData.products.map((product, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {supplierData.productTypes?.length && (
                      <div>
                        <strong>Product Types:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supplierData.productTypes.map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
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

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] bg-gradient-card border-0 shadow-soft flex flex-col">
              {/* Messages */}
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

              {/* Input Area */}
              <div className="p-6 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your company information..."
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