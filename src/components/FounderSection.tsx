
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const FounderSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
            Meet Our Founder
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-purple-600 mx-auto animate-scale-in delay-300"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-business p-8 md:p-12 relative overflow-hidden animate-slide-up delay-500">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 shadow-business-lg animate-float">
                <AvatarImage 
                  src="/lovable-uploads/9df5b2f8-e248-4efd-90ef-8cf2cf67bd9a.png" 
                  alt="Wilson Mokgethwa Moabelo"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-purple-600 text-white text-2xl font-bold">
                  WM
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Wilson Mokgethwa Moabelo</h3>
              <p className="text-purple-600 font-semibold mb-6">Founder & CEO</p>
              
              <blockquote className="text-lg text-gray-600 leading-relaxed italic">
                "As an entrepreneur, I explored nearly every type of business imaginable. Through countless trials, errors, and financial losses, I came to realize that many other South Africans may be facing the same challenges daily.
                <br /><br />
                Struggling to complete tender documents, encountering constant roadblocks, and spending money on stationery with no return — it became clear that something needed to change. This inspired me to develop an automated business platform designed to save time and reduce the cost of filling out endless RFQs, especially for those operating without funding or support."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
