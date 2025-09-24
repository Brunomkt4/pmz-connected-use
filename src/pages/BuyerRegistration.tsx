import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Bot, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
      content: 'Welcome! I\'m your buyer registration assistant. I\'ll guide you through collecting the necessary information step by step. Let\'s start with your company name.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [buyerData, setBuyerData] = useState<BuyerData>({ completeness: 0 });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [showCompletionSheet, setShowCompletionSheet] = useState(false);
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

      // Check for existing company and handle upsert manually
      const { data: existingCompany, error: companyExistsErr } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (companyExistsErr) throw companyExistsErr;

      let companyError = null as unknown as { message?: string } | null;
      if (existingCompany?.id) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', existingCompany.id);
        companyError = error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData);
        companyError = error;
      }

      if (companyError) throw companyError;

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

      // Check for existing buyer and handle upsert manually
      const { data: existingBuyer, error: existsErr } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existsErr) throw existsErr;

      let buyerError = null as unknown as { message?: string } | null;
      if (existingBuyer?.id) {
        const { error } = await supabase
          .from('buyers')
          .update(buyerData)
          .eq('id', existingBuyer.id);
        buyerError = error;
      } else {
        const { error } = await supabase
          .from('buyers')
          .insert(buyerData);
        buyerError = error;
      }

      if (buyerError) throw buyerError;

      setIsRegistrationComplete(true);
      setShowCompletionSheet(true);
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
      /(?:company|corporation|corp|inc|ltd|llc|business)\s+([^.,\n]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+(?:company|corp|inc|ltd|llc))?/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.companyName = match[1]?.trim();
        break;
      }
    }

    // Extract contact person - more flexible pattern
    const contactPatterns = [
      // Pattern 1: Contact followed by name
      /(?:contact|representative|manager|responsible|person|buyer)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
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

    // Extract products/categories and requirements
    const productKeywords = ['meat', 'beef', 'chicken', 'pork', 'protein', 'food', 'fresh', 'frozen', 'organic'];
    const foundCategories = productKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    if (foundCategories.length > 0) {
      extracted.purchasingCategories = foundCategories;
      extracted.productRequirements = foundCategories;
    }

    // Extract quantity information - more flexible pattern
    const quantityPatterns = [
      /(?:need|require|want|buy|looking for|quantity|volume)[\s\w]*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:kg|tons?|tonnes?|lbs?|mt|t|kilos?|pounds?|units?|pieces?|containers?|pallets?))/i,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:kg|tons?|tonnes?|lbs?|mt|t|kilos?|pounds?|units?|pieces?|containers?|pallets?)\s*(?:per|\/|needed|required|monthly|annually|weekly)?/i,
      /(?:quantity|volume|amount)[\s:]*(\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:kg|tons?|tonnes?|lbs?|mt|t|kilos?|pounds?|units?|pieces?))?)/i,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:each|per|\/)\s*(?:month|year|week|day)/i
    ];
    
    for (const pattern of quantityPatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.quantityRequired = match[0].trim(); // Use full match for better context
        break;
      }
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

    // Extract target price - more flexible pattern
    const pricePatterns = [
      // Pattern 1: Currency symbols with various formats
      /(?:target price|budget|willing to pay|pay up to|price range)[\s:]*(?:\$|R\$|US\$|€|£|¥)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
      // Pattern 2: Numbers with currency words
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:dollars?|reais?|euros?|pounds?|usd|brl|eur|gbp)\s*(?:per|\/|each)/i,
      // Pattern 3: General price mentions
      /(?:price|budget|cost)[\s:]*(?:\$|R\$|US\$|€|£|¥)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
      // Pattern 4: Per unit pricing
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|\/)\s*(?:kg|unit|piece|ton|kilo)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match) {
        extracted.targetPrice = match[0]; // Use the full match for context
        break;
      }
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

    // Extract financing needs - more flexible pattern
    const financingKeywords = ['financing', 'credit', 'loan', 'payment terms', 'extended payment', 'installments'];
    if (financingKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      const financingMatch = message.match(/(?:financing|credit|loan|payment)[\s:]*([^.,\n]+)/i);
      if (financingMatch) {
        extracted.financingNeeds = financingMatch[0].trim();
      } else {
        extracted.financingNeeds = 'Required';
      }
    }

    // Extract bank guarantee/L/C details - more flexible pattern  
    const bankKeywords = ['bank guarantee', 'letter of credit', 'l/c', 'guarantee', 'documentary credit'];
    const foundBank = bankKeywords.find(keyword => message.toLowerCase().includes(keyword));
    if (foundBank) {
      if (foundBank.includes('guarantee')) {
        extracted.bankGuaranteeDetails = 'Required';
      } else {
        extracted.letterOfCreditDetails = 'Required';
      }
    }

    // Extract certification requirements - more flexible pattern
    const certificationKeywords = ['haccp', 'iso', 'brc', 'sqs', 'halal', 'kosher', 'organic', 'certification', 'certified', 'certificate'];
    const foundCertifications = [];
    
    for (const cert of certificationKeywords) {
      if (message.toLowerCase().includes(cert)) {
        foundCertifications.push(cert.toUpperCase());
      }
    }
    
    if (foundCertifications.length > 0) {
      extracted.certificationRequirements = foundCertifications;
    } else if (message.toLowerCase().includes('certification') || message.toLowerCase().includes('certified')) {
      // General certification mention
      const certMatch = message.match(/(?:certification|certified|certificate)[\s:]*([^.,\n]+)/i);
      if (certMatch) {
        extracted.certificationRequirements = [certMatch[1].trim()];
      } else {
        extracted.certificationRequirements = ['Required'];
      }
    }

    // Extract insurance requirements - more flexible pattern
    const insuranceKeywords = ['insurance', 'insured', 'coverage', 'liability', 'cargo insurance', 'product liability'];
    if (insuranceKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      const insuranceMatch = message.match(/(?:insurance|coverage|liability)[\s:]*([^.,\n]+)/i);
      if (insuranceMatch) {
        extracted.insuranceRequirements = insuranceMatch[0].trim();
      } else {
        extracted.insuranceRequirements = 'Required';
      }
    }

    // Extract additional comments - more flexible pattern
    const commentKeywords = ['comment', 'note', 'additional', 'special', 'requirement', 'important'];
    if (commentKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      const commentMatch = message.match(/(?:comment|note|additional|special|requirement)[\s:]*([^.,\n]+)/i);
      if (commentMatch) {
        extracted.additionalComments = commentMatch[0].trim();
      } else {
        extracted.additionalComments = 'Provided';
      }
    }

    return extracted;
  };

  const generateAIResponse = (userData: Partial<BuyerData>, currentData: BuyerData): string => {
    const missingFields = [];
    
    // Basic company info (only company name required)
    if (!currentData.companyName && !userData.companyName) {
      missingFields.push('company name');
    }
    
    // 13 required buyer fields
    if (!currentData.contactPerson && !userData.contactPerson) {
      missingFields.push('contact person');
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
      missingFields.push('payment method preference');
    }
    if (!currentData.financingNeeds && !userData.financingNeeds) {
      missingFields.push('financing or credit needs');
    }
    if (!currentData.certificationRequirements?.length && !userData.certificationRequirements?.length) {
      missingFields.push('certification requirements');
    }
    if (!currentData.insuranceRequirements && !userData.insuranceRequirements) {
      missingFields.push('insurance requirements');
    }
    if (!currentData.bankGuaranteeDetails && !currentData.letterOfCreditDetails && !userData.bankGuaranteeDetails && !userData.letterOfCreditDetails) {
      missingFields.push('bank guarantee or L/C details');
    }
    if (!currentData.additionalComments && !userData.additionalComments) {
      missingFields.push('additional comments');
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
          case 'contact person':
            response += ". Who is the main contact person for purchasing?";
            break;
          case 'product requirements':
            response += ". What specific products are you looking to purchase?";
            break;
          case 'quantity required':
            response += ". What quantities do you typically need?";
            break;
          case 'target price':
            response += ". What is your target price range?";
            break;
          case 'delivery destination':
            response += ". Where do you need the products delivered?";
            break;
          case 'required delivery date':
            response += ". When do you need delivery?";
            break;
          case 'payment method preference':
            response += ". What payment methods do you prefer?";
            break;
          case 'financing or credit needs':
            response += ". Do you need financing or credit arrangements?";
            break;
          case 'certification requirements':
            response += ". What certifications do you require? (HACCP, ISO, etc.)";
            break;
          case 'insurance requirements':
            response += ". Do you have any insurance requirements?";
            break;
          case 'bank guarantee or L/C details':
            response += ". Do you need bank guarantee or letter of credit arrangements?";
            break;
          case 'additional comments':
            response += ". Do you have any additional comments or special requirements?";
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
        case 'contact person':
          return "Who is the main contact person for purchasing?";
        case 'product requirements':
          return "What specific products are you looking to purchase?";
        default:
          return `Please provide your ${missingFields[0]}.`;
      }
    }

    return "🎉 Excellent! All buyer information collected. Your registration is now 100% complete!";
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
      
      // Calculate completeness - 14 required fields (1 basic + 13 buyer fields)
      const totalFields = 14;
      let filledFields = 0;
      // Basic info (1 field)
      if (newBuyerData.companyName) filledFields++;
      // 13 buyer fields
      if (newBuyerData.contactPerson) filledFields++;
      if (newBuyerData.productRequirements?.length) filledFields++;
      if (newBuyerData.quantityRequired) filledFields++;
      if (newBuyerData.targetPrice) filledFields++;
      if (newBuyerData.deliveryDestination) filledFields++;
      if (newBuyerData.requiredDeliveryDate) filledFields++;
      if (newBuyerData.preferredPaymentMethod) filledFields++;
      if (newBuyerData.financingNeeds) filledFields++;
      if (newBuyerData.certificationRequirements?.length) filledFields++;
      if (newBuyerData.insuranceRequirements) filledFields++;
      if (newBuyerData.bankGuaranteeDetails || newBuyerData.letterOfCreditDetails) filledFields++;
      if (newBuyerData.additionalComments) filledFields++;
      
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

        {/* Completion Sheet */}
        <Sheet open={showCompletionSheet} onOpenChange={setShowCompletionSheet}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Buyer registration saved</SheetTitle>
              <SheetDescription>Here’s a summary of your information.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2 text-sm">
              {buyerData.companyName && <div><strong>Company:</strong> {buyerData.companyName}</div>}
              {buyerData.contactPerson && <div><strong>Contact:</strong> {buyerData.contactPerson}</div>}
              {buyerData.productRequirements?.length ? <div><strong>Products:</strong> {buyerData.productRequirements.join(', ')}</div> : null}
              {buyerData.quantityRequired && <div><strong>Quantity:</strong> {buyerData.quantityRequired}</div>}
              {buyerData.targetPrice && <div><strong>Target Price:</strong> {buyerData.targetPrice}</div>}
              {buyerData.deliveryDestination && <div><strong>Destination:</strong> {buyerData.deliveryDestination}</div>}
              {buyerData.requiredDeliveryDate && <div><strong>Delivery Date:</strong> {buyerData.requiredDeliveryDate}</div>}
              {buyerData.preferredPaymentMethod && <div><strong>Payment:</strong> {buyerData.preferredPaymentMethod}</div>}
              {buyerData.financingNeeds && <div><strong>Financing:</strong> {buyerData.financingNeeds}</div>}
              {buyerData.certificationRequirements?.length ? <div><strong>Certifications:</strong> {buyerData.certificationRequirements.join(', ')}</div> : null}
              {buyerData.insuranceRequirements && <div><strong>Insurance:</strong> {buyerData.insuranceRequirements}</div>}
              {(buyerData.bankGuaranteeDetails || buyerData.letterOfCreditDetails) && <div><strong>Bank/L/C:</strong> Yes</div>}
              {buyerData.additionalComments && <div><strong>Comments:</strong> {buyerData.additionalComments}</div>}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => setShowCompletionSheet(false)} className="bg-gradient-button text-white">Close</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}