
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    email: '',
    contactNumber: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.message.length > 500) {
      toast({
        title: "Error",
        description: "Message must be 500 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock implementation for contact form submission
      // In a real implementation, this would connect to a backend service
      console.log('Contact form submitted:', formData);
      
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. The MOKMzansiBooks team will get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        type: '',
        name: '',
        email: '',
        contactNumber: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: '',
      name: '',
      email: '',
      contactNumber: '',
      message: ''
    });
    toast({
      title: "Form Cleared",
      description: "All fields have been reset.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We'd love to hear from you! Send us your compliments, complaints, or suggestions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-700 font-medium">Message Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue placeholder="Select message type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Compliment">Compliment</SelectItem>
                            <SelectItem value="Complaint">Complaint</SelectItem>
                            <SelectItem value="Suggestion">Suggestion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">Name Surname *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-gray-700 font-medium">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          placeholder="Enter your contact number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700 font-medium">
                          Message * 
                          <span className="text-sm text-gray-500 ml-2">
                            ({formData.message.length}/500 characters)
                          </span>
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              setFormData({ ...formData, message: e.target.value });
                            }
                          }}
                          className="min-h-32 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          placeholder="Enter your message (maximum 500 characters)"
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Email</p>
                        <p className="text-gray-600">mokgethwamoabelo@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">WhatsApp</p>
                        <p className="text-gray-600">064 550 4029</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Location</p>
                        <p className="text-gray-600">Pretoria, Atteridgeville, South Africa</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Business Hours</h4>
                    <div className="space-y-1 text-gray-600">
                      <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p>Saturday: 9:00 AM - 1:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Response Time</h4>
                    <div className="space-y-1 text-gray-600">
                      <p>We typically respond within 24 hours during business days.</p>
                      <p>For urgent matters, please contact us via WhatsApp.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
