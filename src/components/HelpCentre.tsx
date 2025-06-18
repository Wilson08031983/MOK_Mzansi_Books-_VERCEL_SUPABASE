
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, MessageCircle, X } from 'lucide-react';

const HelpCentre = () => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('HelpCentre render, isOpen:', isOpen);

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog open state changing to:', open);
    setIsOpen(open);
  };

  const handleButtonClick = () => {
    console.log('Help Centre button clicked');
    setIsOpen(true);
  };

  const handleEmailClick = () => {
    console.log('Email button clicked');
    window.location.href = 'mailto:mokgethwamoabelo@gmail.com';
  };

  const handleWhatsAppClick = () => {
    console.log('WhatsApp button clicked');
    window.open('https://wa.me/27645504029', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
          onClick={handleButtonClick}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help Centre</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 pb-2">
            Help Centre
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Get in touch with our support team for assistance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <button
            onClick={handleEmailClick}
            className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer border-none"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-800">Email Support</h4>
              <span className="text-purple-600 hover:text-purple-800 transition-colors duration-300">
                mokgethwamoabelo@gmail.com
              </span>
            </div>
          </button>
          
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer border-none"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-800">WhatsApp Support</h4>
              <span className="text-green-600 hover:text-green-800 transition-colors duration-300">
                064 550 4029
              </span>
            </div>
          </button>
          
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            We're here to help you get the most out of MOKMzansiBooks
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpCentre;
