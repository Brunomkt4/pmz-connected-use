import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, Building2 } from "lucide-react";
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
  sifRegistration?: string;
  contactPerson?: string;
  availableCertifications?: string[];
  availableQuantity?: string;
  pricePerUnit?: string;
  incoterm?: string;
  paymentMethod?: string;
  shippingDetails?: string;
  packaging?: string;
  offerValidity?: string;
  additionalComments?: string;
  completeness: number;
}

export default function SupplierRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome! I\'m your supplier registration assistant. I\'ll guide you through collecting the necessary information step by step. Let\'s start with your company name.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supplierData, setSupplierData] = useState<SupplierData>({ completeness: 0 });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveSupplierData = async (data: SupplierData) => {
    if (!user) {
      toast.error('You must be logged in to save supplier data');
      return;
    }

    try {
      // Save basic company information to companies table
      const companyData = {
        name: data.companyName || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        cnpj: data.cnpj,
        account_type_id: 1, // Supplier account type
        user_id: user.id
      };

      const { error: companyError } = await supabase
        .from('companies')
        .upsert(companyData, {
          onConflict: 'user_id'
        });

      if (companyError) throw companyError;

      // Save supplier-specific information to suppliers table
      const supplierData = {
        name: data.companyName || '',
        email: data.email,
        phone: data.phone,
        address: data.address,
        cnpj: data.cnpj,
        products: data.products,
        product_types: data.productTypes,
        sif_registration: data.sifRegistration,
        contact_person: data.contactPerson,
        available_certifications: data.availableCertifications,
        available_quantity: data.availableQuantity,
        price_per_unit: data.pricePerUnit,
        incoterm: data.incoterm,
        payment_method: data.paymentMethod,
        shipping_details: data.shippingDetails,
        packaging: data.packaging,
        offer_validity: data.offerValidity,
        additional_comments: data.additionalComments,
        user_id: user.id
      };

      // Check for existing supplier and handle upsert manually
      const { data: existingSupplier, error: existsErr } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existsErr) throw existsErr;

      let supplierError = null as unknown as { message?: string } | null;
      if (existingSupplier?.id) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', existingSupplier.id);
        supplierError = error;
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert(supplierData);
        supplierError = error;
      }

      if (supplierError) throw supplierError;

      setIsRegistrationComplete(true);
      toast.success('Supplier registration completed successfully!');
    } catch (error) {
      console.error('Error saving supplier data:', error);
      toast.error('Failed to save supplier data. Please try again.');
    }
  };

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

    // Extract company name
    const companyPatterns = [
      /(?:company|corporation|corp|inc|ltd|business)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:company|corporation|corp|inc|ltd))?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }
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

    // Extract SIF registration - more flexible pattern
    const sifPatterns = [
      // Pattern 1: SIF followed by numbers/text
      /(?:sif|federal inspection service)[\s:]*([a-zA-Z0-9\-\/]+)/i,
      // Pattern 2: Just numbers that might be SIF
      /(?:registration|license)[\s:]*([0-9\-\/]+)/i,
      // Pattern 3: When user mentions SIF in any context
      /sif[\s:]*([^\s.,\n]+)/i
    ];
    
    for (const pattern of sifPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.sifRegistration = match[1];
        break;
      }
    }

    // Extract contact person - more flexible pattern
    const contactPatterns = [
      // Pattern 1: Contact followed by name
      /(?:contact|representative|manager|responsible|person)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      // Pattern 2: Name after various contact words
      /(?:my name is|i am|contact me|speak with|talk to)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      // Pattern 3: Just capture any proper name mentioned
      /([A-Z][a-z]+\s+[A-Z][a-z]+)/,
      // Pattern 4: Names in different formats
      /(?:mr|mrs|ms|dr)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of contactPatterns) {
      const match = message.match(pattern);
      if (match && match[1].length > 3) { // Ensure it's a reasonable name length
        extracted.contactPerson = match[1].trim();
        break;
      }
    }

    // Extract available certifications
    const certKeywords = ['haccp', 'brc', 'iso', 'fda', 'halal', 'kosher', 'organic', 'gmp', 'ssop'];
    const foundCerts = certKeywords.filter(cert => 
      message.toLowerCase().includes(cert)
    );
    if (foundCerts.length > 0) {
      extracted.availableCertifications = foundCerts;
    }

    // Extract available quantity - more flexible pattern
    const quantityPatterns = [
      // Pattern 1: Numbers with units
      /(?:available|quantity|stock|have|supply)[\s:]*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:kg|tons?|tonnes?|lbs?|mt|t|kilos?|pounds?))/i,
      // Pattern 2: Numbers without specific units but with quantity context
      /(?:available|quantity|stock|have|supply)[\s:]*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:units?|pieces?|items?)?/i,
      // Pattern 3: General number mentions with quantity words
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:kg|tons?|tonnes?|lbs?|mt|t|kilos?|pounds?)\s*(?:available|in stock|ready)/i,
      // Pattern 4: Flexible quantity mentions
      /(?:we have|i have|available)[\s:]*(\d+[^\s.,\n]*)/i
    ];
    
    for (const pattern of quantityPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.availableQuantity = match[1];
        break;
      }
    }

    // Extract price per unit - more flexible pattern
    const pricePatterns = [
      // Pattern 1: Currency symbols with various formats
      /(?:\$|R\$|US\$|€|£|¥)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|\/|por)\s*(?:kg|ton|tons?|unit|piece|kilo)/i,
      // Pattern 2: Numbers with currency words
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:dollars?|reais?|euros?|pounds?|usd|brl|eur|gbp)\s*(?:per|\/|por)\s*(?:kg|ton|tons?|unit|piece|kilo)/i,
      // Pattern 3: Price mentions without strict format
      /(?:price|cost|costs?|preço|valor)[\s:]*(?:\$|R\$|US\$|€|£|¥)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
      // Pattern 4: Per unit pricing
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|\/|each|por)\s*(?:kg|unit|piece|ton|kilo)/i,
      // Pattern 5: General price format
      /(?:\$|price)[\s:]*(\d+(?:[.,]\d+)?)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.pricePerUnit = match[0]; // Use the full match for context
        break;
      }
    }

    // Extract Incoterm
    const incotermMatch = message.match(/(FOB|CIF|CFR|FCA|CPT|CIP|DAP|DDP|EXW|FAS|DPU)/i);
    if (incotermMatch) {
      extracted.incoterm = incotermMatch[1].toUpperCase();
    }

    // Extract payment method
    const paymentKeywords = ['cash', 'credit', 'bank transfer', 'wire transfer', 'letter of credit', 'documentary collection'];
    const foundPayment = paymentKeywords.find(method => 
      message.toLowerCase().includes(method)
    );
    if (foundPayment) {
      extracted.paymentMethod = foundPayment;
    }

    // Extract packaging
    const packagingMatch = message.match(/(?:packaging|packed in|package)[\s:]*([^.,\n]+)/i);
    if (packagingMatch) {
      extracted.packaging = packagingMatch[1]?.trim();
    }

    // Extract offer validity
    const validityMatch = message.match(/(?:valid|validity|expires?)[\s:]*(\d+[\s\w]*(?:days?|weeks?|months?))/i);
    if (validityMatch) {
      extracted.offerValidity = validityMatch[1];
    }

    // Extract shipping details - more flexible pattern
    const shippingKeywords = ['shipping', 'freight', 'transport', 'delivery', 'logistics'];
    if (shippingKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      // Try to extract the full shipping description
      const shippingMatch = message.match(/(?:shipping|freight|transport|delivery|logistics)[\s:]*([^.,\n]+)/i);
      if (shippingMatch) {
        extracted.shippingDetails = shippingMatch[0].trim();
      } else {
        // Just use the found keywords as shipping details
        const foundShipping = shippingKeywords.filter(keyword => 
          message.toLowerCase().includes(keyword)
        );
        extracted.shippingDetails = foundShipping.join(', ');
      }
    }

    // Extract additional comments
    if (message.toLowerCase().includes('note') || message.toLowerCase().includes('comment') || message.toLowerCase().includes('additional')) {
      extracted.additionalComments = 'Provided';
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
    
    // Basic company info (only company name required)
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    
    // 12 required supplier fields
    if (!currentData.cnpj && !userData.cnpj) {
      missingFields.push('CNPJ (Corporate Tax ID)');
    }
    if (!currentData.sifRegistration && !userData.sifRegistration) {
      missingFields.push('SIF registration');
    }
    if (!currentData.contactPerson && !userData.contactPerson) {
      missingFields.push('contact person');
    }
    if (!currentData.products?.length && !userData.products?.length) {
      missingFields.push('products');
    }
    if (!currentData.availableCertifications?.length && !userData.availableCertifications?.length) {
      missingFields.push('certifications');
    }
    if (!currentData.availableQuantity && !userData.availableQuantity) {
      missingFields.push('available quantity');
    }
    if (!currentData.pricePerUnit && !userData.pricePerUnit) {
      missingFields.push('price per unit');
    }
    if (!currentData.incoterm && !userData.incoterm) {
      missingFields.push('incoterm');
    }
    if (!currentData.paymentMethod && !userData.paymentMethod) {
      missingFields.push('payment method');
    }
    if (!currentData.shippingDetails && !userData.shippingDetails) {
      missingFields.push('shipping details');
    }
    if (!currentData.packaging && !userData.packaging) {
      missingFields.push('packaging');
    }
    if (!currentData.offerValidity && !userData.offerValidity) {
      missingFields.push('offer validity');
    }

    // If data was extracted, acknowledge it and ask for next item
    if (Object.keys(userData).length > 0) {
      let response = "Perfect! I've captured that information. ";
      
      if (missingFields.length > 0) {
        response += `\n\nNext, please tell me about your ${missingFields[0]}`;
        
        // Add specific prompts for each field type
        switch (missingFields[0]) {
          case 'company name':
            response += ".";
            break;
          case 'CNPJ (Corporate Tax ID)':
            response += ". What is your CNPJ number?";
            break;
          case 'SIF registration':
            response += ". What is your SIF registration number?";
            break;
          case 'contact person':
            response += ". Who is the main contact person for your company?";
            break;
          case 'products':
            response += ". What products do you supply?";
            break;
          case 'certifications':
            response += ". What certifications do you have? (HACCP, ISO, FDA, etc.)";
            break;
          case 'available quantity':
            response += ". What quantities are currently available?";
            break;
          case 'price per unit':
            response += ". What are your prices per unit?";
            break;
          case 'incoterm':
            response += ". What incoterm do you prefer? (FOB, CIF, CFR, etc.)";
            break;
          case 'payment method':
            response += ". What payment methods do you accept?";
            break;
          case 'shipping details':
            response += ". What are your shipping arrangements?";
            break;
          case 'packaging':
            response += ". How do you package your products?";
            break;
          case 'offer validity':
            response += ". How long are your offers valid?";
            break;
          default:
            response += ".";
        }
      } else {
        response += "\n\n🎉 All information collected! Your registration is 100% complete.";
      }
      
      return response;
    }

    // If no data was extracted, ask for the first missing field
    if (missingFields.length > 0) {
      switch (missingFields[0]) {
        case 'company name':
          return "Let's start with your company name.";
        case 'CNPJ (Corporate Tax ID)':
          return "What is your CNPJ (Corporate Tax ID) number?";
        case 'products':
          return "What products do you supply?";
        default:
          return `Please provide your ${missingFields[0]}.`;
      }
    }

    return "🎉 Excellent! All supplier information collected. Your registration is now 100% complete!";
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
    setTimeout(async () => {
      const extractedData = analyzeMessage(currentMessage);
      const newSupplierData = { ...supplierData, ...extractedData };
      
      // Calculate completeness - 13 required fields (1 basic + 12 supplier fields)
      const totalFields = 13;
      let filledFields = 0;
      // Basic info (1 field)
      if (newSupplierData.companyName) filledFields++;
      // 12 supplier fields
      if (newSupplierData.cnpj) filledFields++;
      if (newSupplierData.sifRegistration) filledFields++;
      if (newSupplierData.contactPerson) filledFields++;
      if (newSupplierData.products?.length) filledFields++;
      if (newSupplierData.availableCertifications?.length) filledFields++;
      if (newSupplierData.availableQuantity) filledFields++;
      if (newSupplierData.pricePerUnit) filledFields++;
      if (newSupplierData.incoterm) filledFields++;
      if (newSupplierData.paymentMethod) filledFields++;
      if (newSupplierData.shippingDetails) filledFields++;
      if (newSupplierData.packaging) filledFields++;
      if (newSupplierData.offerValidity) filledFields++;
      
      newSupplierData.completeness = Math.round((filledFields / totalFields) * 100);
      
      setSupplierData(newSupplierData);

      // Check if registration is complete and save to database
      if (newSupplierData.completeness === 100 && !isRegistrationComplete) {
        await saveSupplierData(newSupplierData);
        
        // Add completion message
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "🎉 Congratulations! Your supplier registration is now complete and has been saved to our database. You can now participate in our platform and receive purchase orders from buyers.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        return; // Don't show the regular AI response
      }

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
                {isRegistrationComplete && (
                  <div className="mt-2 flex items-center gap-2 text-primary text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Registration Complete!
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.cnpj ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">CNPJ</span>
                  {supplierData.cnpj && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.sifRegistration ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">SIF Registration</span>
                  {supplierData.sifRegistration && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.contactPerson ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Contact Person</span>
                  {supplierData.contactPerson && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.products?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Products</span>
                  {supplierData.products?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.availableCertifications?.length ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Certifications</span>
                  {supplierData.availableCertifications?.length && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.availableQuantity ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Available Quantity</span>
                  {supplierData.availableQuantity && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.pricePerUnit ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Price per Unit</span>
                  {supplierData.pricePerUnit && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.incoterm ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Incoterm</span>
                  {supplierData.incoterm && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.paymentMethod ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Payment Method</span>
                  {supplierData.paymentMethod && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.shippingDetails ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Shipping Details</span>
                  {supplierData.shippingDetails && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.packaging ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Packaging</span>
                  {supplierData.packaging && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${supplierData.offerValidity ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Offer Validity</span>
                  {supplierData.offerValidity && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </div>
              </div>

              {(supplierData.cnpj || supplierData.sifRegistration || supplierData.contactPerson || 
                supplierData.address || supplierData.technicalDatasheet || 
                supplierData.minimumOrderQuantity || supplierData.deliveryTime || 
                supplierData.products?.length || supplierData.productTypes?.length ||
                supplierData.availableCertifications?.length || supplierData.availableQuantity ||
                supplierData.pricePerUnit || supplierData.incoterm || supplierData.paymentMethod ||
                supplierData.shippingDetails || supplierData.packaging || supplierData.offerValidity ||
                supplierData.additionalComments) && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Collected Data:</h4>
                  <div className="space-y-2 text-sm">
                    {supplierData.cnpj && <div><strong>CNPJ:</strong> {supplierData.cnpj}</div>}
                    {supplierData.sifRegistration && <div><strong>SIF Registration:</strong> {supplierData.sifRegistration}</div>}
                    {supplierData.contactPerson && <div><strong>Contact Person:</strong> {supplierData.contactPerson}</div>}
                    {supplierData.address && <div><strong>Location:</strong> {supplierData.address}</div>}
                    {supplierData.availableQuantity && <div><strong>Available Quantity:</strong> {supplierData.availableQuantity}</div>}
                    {supplierData.pricePerUnit && <div><strong>Price per Unit:</strong> {supplierData.pricePerUnit}</div>}
                    {supplierData.incoterm && <div><strong>Incoterm:</strong> {supplierData.incoterm}</div>}
                    {supplierData.paymentMethod && <div><strong>Payment Method:</strong> {supplierData.paymentMethod}</div>}
                    {supplierData.packaging && <div><strong>Packaging:</strong> {supplierData.packaging}</div>}
                    {supplierData.offerValidity && <div><strong>Offer Validity:</strong> {supplierData.offerValidity}</div>}
                    {supplierData.technicalDatasheet && <div><strong>Technical Datasheet:</strong> {supplierData.technicalDatasheet}</div>}
                    {supplierData.minimumOrderQuantity && <div><strong>Min. Quantity:</strong> {supplierData.minimumOrderQuantity}</div>}
                    {supplierData.deliveryTime && <div><strong>Delivery Time:</strong> {supplierData.deliveryTime}</div>}
                    {supplierData.shippingDetails && <div><strong>Shipping Details:</strong> {supplierData.shippingDetails}</div>}
                    {supplierData.additionalComments && <div><strong>Additional Comments:</strong> {supplierData.additionalComments}</div>}
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
                {!isRegistrationComplete ? (
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
                ) : (
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    Registration completed! Your data has been saved successfully.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}