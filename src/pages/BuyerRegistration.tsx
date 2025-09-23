import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, ShoppingCart } from "lucide-react";
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

interface BuyerData {
  companyName?: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  purchasingCategories?: string[];
  productRequirements?: string[];
  volume?: string;
  quantityRequired?: string;
  budget?: string;
  targetPrice?: string;
  deliveryDestination?: string;
  deliveryConditions?: string;
  requiredDeliveryDate?: string;
  preferredPaymentMethod?: string;
  financingNeeds?: string;
  certificationRequirements?: string[];
  insuranceRequirements?: string;
  bankGuaranteeDetails?: string;
  letterOfCreditDetails?: string;
  additionalComments?: string;
  completeness: number;
}

export default function BuyerRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your intelligent assistant for buyer registration. I\'ll help you set up your comprehensive purchasing profile efficiently. To get started, tell me about your company, what products you\'re looking to purchase, your requirements, quantities needed, and your location...',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [buyerData, setBuyerData] = useState<BuyerData>({ completeness: 0 });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveBuyerData = async (data: BuyerData) => {
    if (!user) {
      toast.error('You must be logged in to save buyer data');
      return;
    }

    try {
      // Save basic company information to companies table
      const companyData = {
        name: data.companyName || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        account_type_id: 2, // Buyer account type
        user_id: user.id
      };

      const { error: companyError } = await supabase
        .from('companies')
        .upsert(companyData, {
          onConflict: 'user_id'
        });

      if (companyError) throw companyError;

      // Save buyer-specific information to buyers table
      const buyerData = {
        name: data.companyName || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        business_number: data.businessNumber,
        contact_person: data.contactPerson,
        product_requirements: data.productRequirements,
        quantity_required: data.quantityRequired,
        target_price: data.targetPrice,
        delivery_destination: data.deliveryDestination,
        delivery_conditions: data.deliveryConditions,
        required_delivery_date: data.requiredDeliveryDate ? new Date(data.requiredDeliveryDate).toISOString().split('T')[0] : null,
        preferred_payment_method: data.preferredPaymentMethod,
        financing_needs: data.financingNeeds,
        certification_requirements: data.certificationRequirements,
        insurance_requirements: data.insuranceRequirements,
        bank_guarantee_details: data.bankGuaranteeDetails,
        letter_of_credit_details: data.letterOfCreditDetails,
        additional_comments: data.additionalComments,
        user_id: user.id
      };

      const { error: buyerError } = await supabase
        .from('buyers')
        .upsert(buyerData, {
          onConflict: 'user_id'
        });

      if (buyerError) throw buyerError;

      setIsRegistrationComplete(true);
      toast.success('Buyer registration completed successfully!');
    } catch (error) {
      console.error('Error saving buyer data:', error);
      toast.error('Failed to save buyer data. Please try again.');
    }
  };

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

    // Extract contact person
    const contactMatch = message.match(/(?:contact|representative|manager|responsible)[\s:]*([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (contactMatch) {
      extracted.contactPerson = contactMatch[1];
    }

    // Extract products/categories and requirements
    const productKeywords = ['meat', 'beef', 'chicken', 'pork', 'protein', 'food', 'fresh', 'frozen', 'organic'];
    const foundCategories = productKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundCategories.length > 0) {
      extracted.purchasingCategories = foundCategories;
      extracted.productRequirements = foundCategories;
    }

    // Extract quantity information
    const quantityMatch = message.match(/(?:need|require|looking for)[\s\w]*(\d+[\s\w]*(?:tons?|kg|lbs?|pounds?))/i);
    if (quantityMatch) {
      extracted.quantityRequired = quantityMatch[1];
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

    // Extract target price
    const priceMatch = message.match(/(?:target price|budget|willing to pay)[\s:]*\$?(\d+(?:[.,]\d+)?(?:\s*(?:per|\/)\s*(?:kg|ton|unit))?)/i);
    if (priceMatch) {
      extracted.targetPrice = priceMatch[1];
    }

    // Extract location/address
    const locationMatch = message.match(/(?:in|from|located|based|address)[\s:]+([^.,\n]+)/i);
    if (locationMatch) {
      extracted.address = locationMatch[1]?.trim();
    }

    // Extract delivery destination
    const deliveryMatch = message.match(/(?:deliver|delivery|ship)[\s\w]*(?:to|in|at)[\s:]*([^.,\n]+)/i);
    if (deliveryMatch) {
      extracted.deliveryDestination = deliveryMatch[1]?.trim();
    }

    // Extract delivery date
    const dateMatch = message.match(/(?:by|before|delivery date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i);
    if (dateMatch) {
      extracted.requiredDeliveryDate = dateMatch[1];
    }

    // Extract payment method
    const paymentKeywords = ['cash', 'credit', 'bank transfer', 'wire transfer', 'letter of credit', 'documentary collection', 'advance payment'];
    const foundPayment = paymentKeywords.find(method => 
      message.toLowerCase().includes(method)
    );
    if (foundPayment) {
      extracted.preferredPaymentMethod = foundPayment;
    }

    // Extract financing needs
    if (message.toLowerCase().includes('financing') || message.toLowerCase().includes('credit') || message.toLowerCase().includes('loan')) {
      extracted.financingNeeds = 'Required';
    }

    // Extract certifications
    const certKeywords = ['haccp', 'brc', 'iso', 'fda', 'halal', 'kosher', 'organic', 'gmp', 'ssop'];
    const foundCerts = certKeywords.filter(cert => 
      message.toLowerCase().includes(cert)
    );
    if (foundCerts.length > 0) {
      extracted.certificationRequirements = foundCerts;
    }

    // Extract insurance requirements
    if (message.toLowerCase().includes('insurance') || message.toLowerCase().includes('coverage')) {
      extracted.insuranceRequirements = 'Required';
    }

    // Extract bank guarantee details
    if (message.toLowerCase().includes('bank guarantee') || message.toLowerCase().includes('guarantee')) {
      extracted.bankGuaranteeDetails = 'Required';
    }

    // Extract letter of credit details
    if (message.toLowerCase().includes('letter of credit') || message.toLowerCase().includes('l/c')) {
      extracted.letterOfCreditDetails = 'Required';
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<BuyerData>, currentData: BuyerData): string => {
    const missingFields = [];
    
    // Check all required fields
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    if (!currentData.businessNumber) {
      missingFields.push('business registration number');
    }
    if (!currentData.address && !userData.address) {
      missingFields.push('business address');
    }
    if (!currentData.contactPerson && !userData.contactPerson) {
      missingFields.push('contact person');
    }
    if (!currentData.phone) {
      missingFields.push('contact phone');
    }
    if (!currentData.email) {
      missingFields.push('email address');
    }
    if (!currentData.productRequirements?.length && !userData.productRequirements?.length) {
      missingFields.push('product requirements');
    }
    if (!currentData.quantityRequired && !userData.quantityRequired) {
      missingFields.push('quantity required');
    }
    if (!currentData.targetPrice && !userData.targetPrice) {
      missingFields.push('target price');
    }
    if (!currentData.deliveryDestination && !userData.deliveryDestination) {
      missingFields.push('delivery destination');
    }
    if (!currentData.requiredDeliveryDate && !userData.requiredDeliveryDate) {
      missingFields.push('required delivery date');
    }
    if (!currentData.preferredPaymentMethod && !userData.preferredPaymentMethod) {
      missingFields.push('preferred payment method');
    }

    // If we extracted new data
    if (Object.keys(userData).length > 0) {
      let response = "Excellent! I've identified ";
      const extractedItems = [];
      
      if (userData.companyName) extractedItems.push(`company: ${userData.companyName}`);
      if (userData.contactPerson) extractedItems.push(`contact person: ${userData.contactPerson}`);
      if (userData.productRequirements) extractedItems.push(`products: ${userData.productRequirements.join(', ')}`);
      if (userData.address) extractedItems.push(`location: ${userData.address}`);
      if (userData.quantityRequired) extractedItems.push(`quantity: ${userData.quantityRequired}`);
      if (userData.targetPrice) extractedItems.push(`target price: ${userData.targetPrice}`);
      if (userData.deliveryDestination) extractedItems.push(`delivery destination: ${userData.deliveryDestination}`);
      if (userData.preferredPaymentMethod) extractedItems.push(`payment method: ${userData.preferredPaymentMethod}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your buyer profile, I need: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('product requirements')) {
          response += "What specific products are you looking to purchase? ";
        } else if (missingFields.includes('quantity required')) {
          response += "What quantities do you typically need? ";
        } else if (missingFields.includes('target price')) {
          response += "What is your target price range? ";
        } else if (missingFields.includes('delivery destination')) {
          response += "Where do you need the products delivered? ";
        }
      } else {
        response += "\n\n🎉 Registration almost complete! I just need to confirm a few final details.";
      }
      
      return response;
    }

    if (missingFields.length === 0) {
      return "🎉 Perfect! All required information has been collected. Your buyer registration is being processed and will be saved to our database.";
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

    setTimeout(async () => {
      const extractedData = analyzeMessage(currentMessage);
      const newBuyerData = { ...buyerData, ...extractedData };
      
      // Calculate completeness - all 16 main fields
      const totalFields = 16;
      let filledFields = 0;
      if (newBuyerData.companyName) filledFields++;
      if (newBuyerData.businessNumber) filledFields++;
      if (newBuyerData.address) filledFields++;
      if (newBuyerData.contactPerson) filledFields++;
      if (newBuyerData.phone) filledFields++;
      if (newBuyerData.email) filledFields++;
      if (newBuyerData.productRequirements?.length) filledFields++;
      if (newBuyerData.quantityRequired) filledFields++;
      if (newBuyerData.targetPrice) filledFields++;
      if (newBuyerData.deliveryDestination) filledFields++;
      if (newBuyerData.deliveryConditions) filledFields++;
      if (newBuyerData.requiredDeliveryDate) filledFields++;
      if (newBuyerData.preferredPaymentMethod) filledFields++;
      if (newBuyerData.financingNeeds) filledFields++;
      if (newBuyerData.certificationRequirements?.length) filledFields++;
      if (newBuyerData.insuranceRequirements) filledFields++;
      
      newBuyerData.completeness = Math.round((filledFields / totalFields) * 100);
      setBuyerData(newBuyerData);

      // Check if registration is complete and save to database
      if (newBuyerData.completeness === 100 && !isRegistrationComplete) {
        await saveBuyerData(newBuyerData);
        
        // Add completion message
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "🎉 Congratulations! Your buyer registration is now complete and has been saved to our database. You can now access our platform and connect with suppliers.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsTyping(false);
        return; // Don't show the regular AI response
      }

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
                {isRegistrationComplete && (
                  <Badge variant="default" className="ml-2 bg-primary">Complete</Badge>
                )}
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

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.companyName ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Company Info</span>
                  {buyerData.companyName && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.contactPerson ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Contact Person</span>
                  {buyerData.contactPerson && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.productRequirements?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Product Requirements</span>
                  {buyerData.productRequirements?.length && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.quantityRequired ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Quantity Required</span>
                  {buyerData.quantityRequired && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.targetPrice ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Target Price</span>
                  {buyerData.targetPrice && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.deliveryDestination ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Delivery Destination</span>
                  {buyerData.deliveryDestination && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.requiredDeliveryDate ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Required Delivery Date</span>
                  {buyerData.requiredDeliveryDate && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.preferredPaymentMethod ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Payment Method Preference</span>
                  {buyerData.preferredPaymentMethod && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.financingNeeds ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Financing or Credit Needs</span>
                  {buyerData.financingNeeds && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.certificationRequirements?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Certification Requirements</span>
                  {buyerData.certificationRequirements?.length && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.insuranceRequirements ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Insurance Requirements</span>
                  {buyerData.insuranceRequirements && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.bankGuaranteeDetails || buyerData.letterOfCreditDetails ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Bank Guarantee or L/C Details</span>
                  {(buyerData.bankGuaranteeDetails || buyerData.letterOfCreditDetails) && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${buyerData.additionalComments ? 'bg-primary' : 'bg-muted'}`} />
                  <span>Additional Comments</span>
                  {buyerData.additionalComments && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                </div>
              </div>

              {buyerData.companyName && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Collected Data:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company:</strong> {buyerData.companyName}</div>
                    {buyerData.contactPerson && <div><strong>Contact:</strong> {buyerData.contactPerson}</div>}
                    {buyerData.address && <div><strong>Address:</strong> {buyerData.address}</div>}
                    {buyerData.quantityRequired && <div><strong>Quantity:</strong> {buyerData.quantityRequired}</div>}
                    {buyerData.targetPrice && <div><strong>Price:</strong> {buyerData.targetPrice}</div>}
                    {buyerData.productRequirements?.length && (
                      <div>
                        <strong>Products:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {buyerData.productRequirements.map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {req}
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
                    placeholder={isRegistrationComplete ? "Registration completed!" : "Tell me about your purchasing requirements..."}
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