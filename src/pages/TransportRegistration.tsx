import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface TransportData {
  companyName?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  vehicleTypes?: string[];
  capacity?: string;
  serviceAreas?: string[];
  certifications?: string[];
  insurance?: string;
  temperatureControl?: boolean;
  modeOfTransport?: string[];
  originDestinations?: string[];
  estimatedTransitTime?: string;
  shipmentSchedule?: string;
  containerDetails?: string;
  freightCost?: string;
  includedServices?: string[];
  documentsCompliance?: string[];
  trackingSupportDetails?: string;
  specialRequirements?: string;
  completeness: number;
}

export default function TransportRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I\'m your specialized assistant for transport company registration. I\'ll help you register your comprehensive logistics profile efficiently. Please tell me about your transport company - name, types of vehicles, service coverage areas, rates, schedules, and any special services...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>({ completeness: 0 });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveCarrierData = async (data: TransportData) => {
    if (!user) {
      toast.error('You must be logged in to save carrier data');
      return;
    }

    try {
      // Save basic company information to companies table
      const companyData = {
        name: data.companyName || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        account_type_id: 7, // Transport/Carrier account type
        user_id: user.id
      };

      const { error: companyError } = await supabase
        .from('companies')
        .upsert(companyData, {
          onConflict: 'user_id'
        });

      if (companyError) throw companyError;

      // Save carrier-specific information to carriers table
      const carrierData = {
        company_name: data.companyName || '',
        license_number: data.licenseNumber,
        phone: data.phone,
        email: data.email,
        address: data.address,
        vehicle_types: data.vehicleTypes,
        capacity: data.capacity,
        service_areas: data.serviceAreas,
        certifications: data.certifications,
        insurance_details: data.insurance,
        temperature_control: data.temperatureControl || false,
        mode_of_transport: data.modeOfTransport,
        origin_destinations: data.originDestinations,
        estimated_transit_time: data.estimatedTransitTime,
        shipment_schedule: data.shipmentSchedule,
        container_details: data.containerDetails,
        freight_cost: data.freightCost,
        included_services: data.includedServices,
        documents_compliance: data.documentsCompliance,
        tracking_support_details: data.trackingSupportDetails,
        special_requirements: data.specialRequirements,
        user_id: user.id
      };

      const { error: carrierError } = await supabase
        .from('carriers')
        .upsert(carrierData, {
          onConflict: 'user_id'
        });

      if (carrierError) throw carrierError;

      setIsRegistrationComplete(true);
      toast.success('Transport registration completed successfully!');
    } catch (error) {
      console.error('Error saving carrier data:', error);
      toast.error('Failed to save carrier data. Please try again.');
    }
  };

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

    // Extract contact info
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      extracted.email = emailMatch[1];
    }

    const phoneMatch = message.match(/(\+?[\d\s\-\(\)]{10,})/);
    if (phoneMatch) {
      extracted.phone = phoneMatch[1].trim();
    }

    // Extract mode of transport
    const transportModes = ['truck', 'rail', 'air', 'sea', 'road', 'maritime', 'intermodal'];
    const foundModes = transportModes.filter(mode => 
      message.toLowerCase().includes(mode)
    );
    if (foundModes.length > 0) {
      extracted.modeOfTransport = foundModes;
    }

    // Extract origin/destination routes
    const routeMatch = message.match(/(?:from|to|route)[\s:]*([^.,\n]+)/i);
    if (routeMatch) {
      extracted.originDestinations = [routeMatch[1].trim()];
    }

    // Extract transit time
    const timeMatch = message.match(/(\d+[\s\-]*(?:days?|hours?|weeks?))/i);
    if (timeMatch) {
      extracted.estimatedTransitTime = timeMatch[1];
    }

    // Extract scheduling info
    if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('weekly') || message.toLowerCase().includes('daily')) {
      const scheduleMatch = message.match(/(?:schedule|weekly|daily)[\s:]*([^.,\n]+)/i);
      if (scheduleMatch) {
        extracted.shipmentSchedule = scheduleMatch[1].trim();
      }
    }

    // Extract freight cost
    const costMatch = message.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|\/)\s*(?:kg|ton|mile|km)/i);
    if (costMatch) {
      extracted.freightCost = costMatch[0];
    }

    // Extract services
    const services = ['door-to-door', 'warehouse', 'packaging', 'loading', 'unloading', 'tracking', 'insurance'];
    const foundServices = services.filter(service => 
      message.toLowerCase().includes(service)
    );
    if (foundServices.length > 0) {
      extracted.includedServices = foundServices;
    }

    // Extract compliance/documents
    const docs = ['bill of lading', 'customs', 'freight bill', 'delivery receipt', 'insurance certificate'];
    const foundDocs = docs.filter(doc => 
      message.toLowerCase().includes(doc)
    );
    if (foundDocs.length > 0) {
      extracted.documentsCompliance = foundDocs;
    }

    // Extract tracking support
    if (message.toLowerCase().includes('tracking') || message.toLowerCase().includes('gps') || message.toLowerCase().includes('real-time')) {
      extracted.trackingSupportDetails = 'Available';
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
    if (!currentData.phone && !userData.phone) {
      missingFields.push('contact phone');
    }
    if (!currentData.email && !userData.email) {
      missingFields.push('email address');
    }
    if (!currentData.vehicleTypes?.length && !userData.vehicleTypes?.length) {
      missingFields.push('vehicle types');
    }
    if (!currentData.modeOfTransport?.length && !userData.modeOfTransport?.length) {
      missingFields.push('mode of transport');
    }
    if (!currentData.serviceAreas?.length && !userData.serviceAreas?.length) {
      missingFields.push('service coverage areas');
    }
    if (!currentData.capacity && !userData.capacity) {
      missingFields.push('transport capacity');
    }
    if (!currentData.freightCost && !userData.freightCost) {
      missingFields.push('freight rates');
    }
    if (!currentData.estimatedTransitTime && !userData.estimatedTransitTime) {
      missingFields.push('estimated transit time');
    }

    if (Object.keys(userData).length > 0) {
      let response = "Great! I\'ve captured ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`company: ${userData.companyName}`);
      if (userData.vehicleTypes) extractedItems.push(`vehicles: ${userData.vehicleTypes.join(', ')}`);
      if (userData.modeOfTransport) extractedItems.push(`transport modes: ${userData.modeOfTransport.join(', ')}`);
      if (userData.serviceAreas) extractedItems.push(`service areas: ${userData.serviceAreas.join(', ')}`);
      if (userData.capacity) extractedItems.push(`capacity: ${userData.capacity}`);
      if (userData.freightCost) extractedItems.push(`rates: ${userData.freightCost}`);
      if (userData.estimatedTransitTime) extractedItems.push(`transit time: ${userData.estimatedTransitTime}`);
      if (userData.temperatureControl) extractedItems.push('temperature-controlled transport capability');
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your transport registration, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('transport license number')) {
          response += "What\'s your DOT or transport license number? ";
        } else if (missingFields.includes('freight rates')) {
          response += "What are your freight rates? ";
        } else if (missingFields.includes('mode of transport')) {
          response += "What modes of transport do you offer? ";
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

    setTimeout(async () => {
      const extractedData = analyzeMessage(currentMessage);
      const newTransportData = { ...transportData, ...extractedData };
      
      // Calculate completeness - all 18 main fields
      const totalFields = 18;
      let filledFields = 0;
      if (newTransportData.companyName) filledFields++;
      if (newTransportData.licenseNumber) filledFields++;
      if (newTransportData.phone) filledFields++;
      if (newTransportData.email) filledFields++;
      if (newTransportData.address) filledFields++;
      if (newTransportData.vehicleTypes?.length) filledFields++;
      if (newTransportData.modeOfTransport?.length) filledFields++;
      if (newTransportData.serviceAreas?.length) filledFields++;
      if (newTransportData.capacity) filledFields++;
      if (newTransportData.insurance) filledFields++;
      if (newTransportData.certifications?.length) filledFields++;
      if (newTransportData.originDestinations?.length) filledFields++;
      if (newTransportData.estimatedTransitTime) filledFields++;
      if (newTransportData.shipmentSchedule) filledFields++;
      if (newTransportData.freightCost) filledFields++;
      if (newTransportData.includedServices?.length) filledFields++;
      if (newTransportData.trackingSupportDetails) filledFields++;
      if (newTransportData.documentsCompliance?.length) filledFields++;
      
      newTransportData.completeness = Math.round((filledFields / totalFields) * 100);
      setTransportData(newTransportData);

      // Check if registration is complete and save to database
      if (newTransportData.completeness === 100 && !isRegistrationComplete) {
        await saveCarrierData(newTransportData);
        
        // Add completion message
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "🎉 Congratulations! Your transport registration is now complete and has been saved to our database. You can now access our platform and connect with shippers.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsTyping(false);
        return; // Don't show the regular AI response
      }

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
                {isRegistrationComplete && (
                  <Badge variant="default" className="ml-2 bg-primary">Complete</Badge>
                )}
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

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.modeOfTransport?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Mode of Transport</span>
                  {transportData.modeOfTransport?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.originDestinations?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Origin & Destination</span>
                  {transportData.originDestinations?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.estimatedTransitTime ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Estimated Transit Time</span>
                  {transportData.estimatedTransitTime && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.shipmentSchedule ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Shipment Schedule</span>
                  {transportData.shipmentSchedule && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.freightCost ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Freight Cost</span>
                  {transportData.freightCost && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.includedServices?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Included Services</span>
                  {transportData.includedServices?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.documentsCompliance?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Documents & Compliance</span>
                  {transportData.documentsCompliance?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.trackingSupportDetails ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Tracking & Support</span>
                  {transportData.trackingSupportDetails && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transportData.specialRequirements ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Special Requirements</span>
                  {transportData.specialRequirements && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
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
                    placeholder={isRegistrationComplete ? "Registration completed!" : "Tell me about your transport company and fleet..."}
                    className="flex-1"
                    disabled={isTyping || isRegistrationComplete}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isTyping || isRegistrationComplete}
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