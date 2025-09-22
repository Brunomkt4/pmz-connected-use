import { Users, Shield, Globe, Clock, Award, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ExplanationSections = () => {
  return (
    <div className="space-y-16 py-12">
      {/* Why Choose Our Platform */}
      <section className="bg-gradient-card rounded-3xl p-8 md:p-12 shadow-soft card-hover">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 font-inter">
            Why Choose Our Platform?
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto font-inter">
            We connect premium meat suppliers and buyers securely and efficiently, 
            facilitating international trade of meat products with artificial intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center card-hover p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 font-inter">Guaranteed Security</h3>
            <p className="text-muted-foreground font-inter">
              All suppliers are verified and certified to ensure the highest product quality standards.
            </p>
          </div>
          
          <div className="text-center card-hover p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 font-inter">Global Reach</h3>
            <p className="text-muted-foreground font-inter">
              We connect businesses worldwide, facilitating international meat trade across continents.
            </p>
          </div>
          
          <div className="text-center card-hover p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 font-inter">Efficient AI</h3>
            <p className="text-muted-foreground font-inter">
              Our artificial intelligence accelerates negotiations and finds the best suppliers for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 font-inter">
            How Our AI Works
          </h2>
          <p className="text-muted-foreground text-lg font-inter">
            A simple and intelligent process to connect buyers and sellers efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-6 shadow-soft card-hover bg-gradient-card border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="w-14 h-14 bg-category-beef/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary font-inter">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 font-inter">Discover</h3>
              <p className="text-muted-foreground text-sm font-inter">
                Describe your needs and our AI finds relevant products instantly
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft card-hover bg-gradient-card border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="w-14 h-14 bg-category-chicken/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary font-inter">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 font-inter">Analyze</h3>
              <p className="text-muted-foreground text-sm font-inter">
                AI analyzes prices, quality and specifications automatically
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft card-hover bg-gradient-card border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="w-14 h-14 bg-category-pork/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary font-inter">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 font-inter">Connect</h3>
              <p className="text-muted-foreground text-sm font-inter">
                System suggests the best suppliers based on your specific requirements
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 shadow-soft card-hover bg-gradient-card border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="w-14 h-14 bg-category-others/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary font-inter">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 font-inter">Negotiate</h3>
              <p className="text-muted-foreground text-sm font-inter">
                AI assists in negotiation and secure contract closing processes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="bg-muted rounded-2xl p-8 md:p-12">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Quality Assurance
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            All our suppliers undergo rigorous verification processes 
            to ensure the highest standards of quality and food safety.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-tag-health" />
              <span className="text-foreground font-medium text-center">International Certifications</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-tag-health" />
              <span className="text-foreground font-medium text-center">Sanitary Inspection</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-tag-health" />
              <span className="text-foreground font-medium text-center">Refrigerated Transport</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-tag-health" />
              <span className="text-foreground font-medium text-center">Full Traceability</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <Card className="p-6 text-center shadow-card">
              <CardContent className="p-0">
                <Award className="h-8 w-8 text-brand-orange mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Certified Suppliers</div>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center shadow-card">
              <CardContent className="p-0">
                <Users className="h-8 w-8 text-brand-red mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Active Buyers</div>
              </CardContent>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <CardContent className="p-0">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Verified Quality</div>
              </CardContent>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <CardContent className="p-0">
                <Globe className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-ai rounded-3xl p-8 md:p-12 text-center shadow-glow card-hover">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 font-inter">
          Ready to Start?
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto font-inter">
          Join the first AI platform for premium meat trading. 
          Connect with trusted suppliers and expand your business today.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-center max-w-6xl mx-auto">
          <Button size="lg" variant="secondary" className="px-4 py-3 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Buyer
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Supplier
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm an Insurer
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Bank
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Letter of Credit Bank
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Logistics Company
          </Button>
          <Button size="lg" variant="outline" className="px-4 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium hover-scale font-inter h-auto whitespace-normal text-center">
            I'm a Certifier
          </Button>
        </div>
      </section>
    </div>
  );
};