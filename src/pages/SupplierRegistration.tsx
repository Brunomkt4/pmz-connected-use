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
      content: 'Hello! I am your intelligent assistant for supplier registration. I will help you register your company quickly and efficiently. To get started, tell me a bit about your company - name, products you offer, where it is located...',
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
      // First, check if user has a supplier record
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (suppliersError) throw suppliersError;

      const supplierData = {
        name: data.companyName || '',
        cnpj: data.cnpj,
        address: data.address,
        phone: data.phone,
        email: data.email,
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

      if (suppliers) {
        // Update existing supplier
        const { error: updateError } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', suppliers.id);

        if (updateError) throw updateError;
      } else {
        // Create new supplier
        const { error: insertError } = await supabase
          .from('suppliers')
          .insert([supplierData]);

        if (insertError) throw insertError;
      }

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

    // Extract SIF registration
    const sifMatch = message.match(/(?:sif|federal inspection service)[\s:]*(\d+)/i);
    if (sifMatch) {
      extracted.sifRegistration = sifMatch[1];
    }

    // Extract contact person
    const contactMatch = message.match(/(?:contact|representative|manager|responsible)[\s:]*([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (contactMatch) {
      extracted.contactPerson = contactMatch[1];
    }

    // Extract available certifications
    const certKeywords = ['haccp', 'brc', 'iso', 'fda', 'halal', 'kosher', 'organic', 'gmp', 'ssop'];
    const foundCerts = certKeywords.filter(cert => 
      message.toLowerCase().includes(cert)
    );
    if (foundCerts.length > 0) {
      extracted.availableCertifications = foundCerts;
    }

    // Extract available quantity
    const availableQuantityMatch = message.match(/(?:available|quantity|stock)[\s:]*(\d+[\s\w]*(?:kg|tons?|tonnes?|lbs?))/i);
    if (availableQuantityMatch) {
      extracted.availableQuantity = availableQuantityMatch[1];
    }

    // Extract price per unit
    const priceMatch = message.match(/(?:price|cost)[\s:]*(?:\$|R\$|USD|BRL)?[\s]*(\d+(?:[.,]\d+)?(?:\s*(?:per|\/)\s*(?:kg|ton|unit))?)/i);
    if (priceMatch) {
      extracted.pricePerUnit = priceMatch[1];
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

    // Extract shipping details
    if (message.toLowerCase().includes('shipping') || message.toLowerCase().includes('freight')) {
      extracted.shippingDetails = 'Mentioned';
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
    
    // Check all required fields
    if (!currentData.cnpj && !userData.cnpj) {
      missingFields.push('CNPJ registration number');
    }
    if (!currentData.sifRegistration && !userData.sifRegistration) {
      missingFields.push('SIF registration number');
    }
    if (!currentData.contactPerson && !userData.contactPerson) {
      missingFields.push('contact person name');
    }
    if (!currentData.address && !userData.address) {
      missingFields.push('company address');
    }
    if (!currentData.availableCertifications?.length && !userData.availableCertifications?.length) {
      missingFields.push('available certifications (HACCP, ISO, FDA, etc.)');
    }
    if (!currentData.availableQuantity && !userData.availableQuantity) {
      missingFields.push('available quantity');
    }
    if (!currentData.pricePerUnit && !userData.pricePerUnit) {
      missingFields.push('price per unit');
    }
    if (!currentData.incoterm && !userData.incoterm) {
      missingFields.push('Incoterm (FOB, CIF, etc.)');
    }
    if (!currentData.paymentMethod && !userData.paymentMethod) {
      missingFields.push('payment method');
    }
    if (!currentData.shippingDetails && !userData.shippingDetails) {
      missingFields.push('shipping details');
    }
    if (!currentData.packaging && !userData.packaging) {
      missingFields.push('packaging information');
    }
    if (!currentData.offerValidity && !userData.offerValidity) {
      missingFields.push('offer validity period');
    }
    if (!currentData.phone) {
      missingFields.push('phone number');
    }
    if (!currentData.email) {
      missingFields.push('email address');
    }

    // If we extracted new data
    if (Object.keys(userData).length > 0) {
      let response = "Perfect! I was able to identify ";
      const extractedItems = [];
      
      if (userData.cnpj) extractedItems.push(`CNPJ: ${userData.cnpj}`);
      if (userData.sifRegistration) extractedItems.push(`SIF registration: ${userData.sifRegistration}`);
      if (userData.contactPerson) extractedItems.push(`contact person: ${userData.contactPerson}`);
      if (userData.products) extractedItems.push(`products: ${userData.products.join(', ')}`);
      if (userData.address) extractedItems.push(`location: ${userData.address}`);
      if (userData.availableQuantity) extractedItems.push(`available quantity: ${userData.availableQuantity}`);
      if (userData.pricePerUnit) extractedItems.push(`price: ${userData.pricePerUnit}`);
      if (userData.incoterm) extractedItems.push(`Incoterm: ${userData.incoterm}`);
      if (userData.paymentMethod) extractedItems.push(`payment method: ${userData.paymentMethod}`);
      if (userData.packaging) extractedItems.push(`packaging: ${userData.packaging}`);
      if (userData.offerValidity) extractedItems.push(`offer validity: ${userData.offerValidity}`);
      
      response += extractedItems.join(', ') + ". ";
      
      if (missingFields.length > 0) {
        response += `\n\nTo complete your registration, I need some additional information: ${missingFields.slice(0, 2).join(' and ')}. `;
        
        if (missingFields.includes('available certifications (HACCP, ISO, FDA, etc.)')) {
          response += "What certifications do you have (HACCP, BRC, ISO, FDA, Halal, Kosher, etc.)? ";
        } else if (missingFields.includes('SIF registration number')) {
          response += "What is your SIF (Federal Inspection Service) registration number? ";
        } else if (missingFields.includes('Incoterm (FOB, CIF, etc.)')) {
          response += "What Incoterm do you prefer (FOB, CIF, CFR, DDP, etc.)? ";
        } else if (missingFields.includes('payment method')) {
          response += "What payment methods do you accept (bank transfer, letter of credit, etc.)? ";
        }
      } else {
        response += "\n\n🎉 Registration almost complete! I just need to confirm a few final details.";
      }
      
      return response;
    }

    if (missingFields.length === 0) {
      return "🎉 Perfect! All required information has been collected. Your registration is being processed and will be saved to our database.";
    }
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
      
      // Calculate completeness
      const totalFields = 21; // All required fields including new ones
      let filledFields = 0;
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
      if (newSupplierData.sifRegistration) filledFields++;
      if (newSupplierData.contactPerson) filledFields++;
      if (newSupplierData.availableCertifications?.length) filledFields++;
      if (newSupplierData.availableQuantity) filledFields++;
      if (newSupplierData.pricePerUnit) filledFields++;
      if (newSupplierData.incoterm) filledFields++;
      if (newSupplierData.paymentMethod) filledFields++;
      if (newSupplierData.shippingDetails) filledFields++;
      if (newSupplierData.packaging) filledFields++;
      if (newSupplierData.offerValidity) filledFields++;
      if (newSupplierData.additionalComments) filledFields++;
      
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