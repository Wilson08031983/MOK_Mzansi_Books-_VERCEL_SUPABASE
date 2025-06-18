
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

const ContactSales = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Contact Sales
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to transform your business finances? Get in touch with our sales team to discuss your needs and find the perfect solution for your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <span>Email Sales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Send us an email and our sales team will get back to you within 24 hours.
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">Sales Email:</p>
                    <a 
                      href="mailto:mokgethwamoabelo@gmail.com"
                      className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
                    >
                      mokgethwamoabelo@gmail.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <span>WhatsApp Sales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Chat with us directly on WhatsApp for immediate assistance and quick responses.
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">WhatsApp Number:</p>
                    <a 
                      href="https://wa.me/27645504029"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-medium transition-colors duration-300"
                    >
                      064 550 4029
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="h-6 w-6 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Business Hours</h4>
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin className="h-6 w-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Location</h4>
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <p>Pretoria, Atteridgeville</p>
                    <p>South Africa</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-pink-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Why Choose MOKMzansiBooks?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Local Expertise</h4>
                      <p>Designed specifically for South African businesses and regulations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Personal Support</h4>
                      <p>Direct access to our team for personalized assistance.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Proven Results</h4>
                      <p>Trusted by South African entrepreneurs since 2018.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ContactSales;
