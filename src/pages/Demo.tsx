
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Demo = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                See MOKMzansiBooks in Action
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Watch how our platform can transform your business finances in just minutes
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white space-y-6">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30">
                        <Play className="h-8 w-8 ml-1" fill="white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Product Demo Video</h3>
                        <p className="text-white/80">Learn how to streamline your business finances</p>
                      </div>
                      <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-slate-800 transition-all duration-300">
                        Watch Demo (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Quick Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Get started in under 5 minutes with our intuitive setup wizard.</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Smart Automation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Automate invoicing, reports, and RFQ processes to save time.</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">SA Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Built specifically for South African tax and business requirements.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">Ready to Get Started?</h3>
                  <p className="text-gray-600">Join thousands of South African businesses already using MOKMzansiBooks</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/signup">
                      <Button size="lg" className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/contact">
                      <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Demo;
