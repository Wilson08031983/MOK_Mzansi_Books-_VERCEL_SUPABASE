
import React from 'react';
import { Smartphone, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Device {
  id: string;
  name: string;
  lastActive: string;
  location: string;
  browser: string;
  current: boolean;
}

interface ActiveDevicesSectionProps {
  activeDevices: Device[];
  onDeviceLogout: (deviceId: string) => void;
}

const ActiveDevicesSection = ({
  activeDevices,
  onDeviceLogout
}: ActiveDevicesSectionProps) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
        <Smartphone className="h-5 w-5 mr-2 text-mokm-orange-500" />
        Active Devices
      </h3>
      
      <div className="space-y-3">
        {activeDevices.map(device => (
          <div key={device.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
            <div className="flex items-start">
              <div className="mr-3">
                <Smartphone className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{device.name}</span>
                  {device.current && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {device.browser} • {new Date(device.lastActive).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {device.location}
                </div>
              </div>
            </div>
            {!device.current && (
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
                onClick={() => onDeviceLogout(device.id)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveDevicesSection;
