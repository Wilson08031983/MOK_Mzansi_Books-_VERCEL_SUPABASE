import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { LockOpen, LockIcon, Eye, Edit2, AlertCircle, Check, X } from 'lucide-react';
import {
  UserPermissions,
  PagePermission,
  pagesToManage,
  saveUserPermissions,
  getUserPermissions,
  isAdminRole
} from '@/services/permissionService';
import { getAllTeamMembers } from '@/services/localAuthService';

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userRole: string;
  onPermissionsUpdated: () => void;
}

const ManagePermissionsModal: React.FC<ManagePermissionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userRole,
  onPermissionsUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions>({});

  // Load user's current permissions
  useEffect(() => {
    if (isOpen && userId) {
      const userPermissions = getUserPermissions(userId);
      setPermissions(userPermissions || {});
    }
  }, [isOpen, userId]);

  // Handle toggling read permission for a page
  const handleToggleReadPermission = (page: string) => {
    setPermissions((prevPermissions) => {
      const pagePermission = prevPermissions[page] || { read: false, write: false };
      const newPagePermission = { 
        ...pagePermission, 
        read: !pagePermission.read,
        // If turning off read, turn off write as well
        write: !pagePermission.read ? false : pagePermission.write
      };
      
      return {
        ...prevPermissions,
        [page]: newPagePermission
      };
    });
  };

  // Handle toggling write permission for a page
  const handleToggleWritePermission = (page: string) => {
    setPermissions((prevPermissions) => {
      const pagePermission = prevPermissions[page] || { read: false, write: false };
      // Can't set write if read is off
      if (!pagePermission.read) return prevPermissions;
      
      return {
        ...prevPermissions,
        [page]: {
          ...pagePermission,
          write: !pagePermission.write
        }
      };
    });
  };

  // Save updated permissions
  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      saveUserPermissions(userId, permissions);
      toast({
        title: "Permissions Updated",
        description: `Permissions for ${userEmail} have been updated successfully.`
      });
      onPermissionsUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass backdrop-blur-xl bg-white/95 border-white/20 shadow-business-lg max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-sf-pro text-2xl flex items-center">
            <LockOpen className="mr-2 h-5 w-5 text-mokm-purple-500" />
            Manage Permissions for {userEmail}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600 font-sf-pro">
                User has <span className="font-medium">{userRole}</span> role.
                {isAdminRole(userRole) && (
                  <span className="ml-2 text-mokm-orange-600 flex items-center gap-1 text-sm">
                    <AlertCircle className="h-4 w-4" /> Administrator roles have full access to all pages.
                  </span>
                )}
              </p>
              {!isAdminRole(userRole) && (
                <p className="text-slate-500 text-sm mt-1">
                  Configure which pages this user can access and edit.
                </p>
              )}
            </div>
            
            {!isAdminRole(userRole) && (
              <div className="flex gap-3">
                <div className="flex items-center text-slate-600 text-sm">
                  <Eye className="h-4 w-4 mr-1" /> Read Access
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <Edit2 className="h-4 w-4 mr-1" /> Write Access
                </div>
              </div>
            )}
          </div>

          {isAdminRole(userRole) ? (
            <div className="py-4 text-center">
              <Badge className="bg-mokm-purple-100 hover:bg-mokm-purple-200 text-mokm-purple-800 py-2 px-4">
                <Check className="h-4 w-4 mr-2 text-mokm-purple-600" /> 
                Full access to all pages and features
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass backdrop-blur-sm bg-white/30 border border-white/10 rounded-xl shadow-sm p-4">
                <p className="text-sm text-slate-500 font-sf-pro mb-2">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Dashboard is always accessible to all users
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pagesToManage.map((page) => (
                  <div 
                    key={page.name}
                    className="glass backdrop-blur-sm bg-white/40 border border-white/10 rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <page.icon className="h-5 w-5 mr-2 text-mokm-purple-600" />
                        <span className="font-medium text-slate-800">{page.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={permissions[page.name]?.read ? "default" : "outline"}
                        className={permissions[page.name]?.read 
                          ? "bg-mokm-blue-500 hover:bg-mokm-blue-600" 
                          : "text-slate-600"}
                        onClick={() => handleToggleReadPermission(page.name)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Read
                        {permissions[page.name]?.read ? (
                          <Check className="h-3.5 w-3.5 ml-1" />
                        ) : (
                          <X className="h-3.5 w-3.5 ml-1" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant={permissions[page.name]?.write ? "default" : "outline"}
                        className={permissions[page.name]?.write 
                          ? "bg-mokm-orange-500 hover:bg-mokm-orange-600" 
                          : "text-slate-600"}
                        disabled={!permissions[page.name]?.read}
                        onClick={() => handleToggleWritePermission(page.name)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Write
                        {permissions[page.name]?.write ? (
                          <Check className="h-3.5 w-3.5 ml-1" />
                        ) : (
                          <X className="h-3.5 w-3.5 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white/50"
          >
            Cancel
          </Button>

          {!isAdminRole(userRole) && (
            <Button
              type="button"
              onClick={handleSavePermissions}
              className="bg-gradient-to-r from-mokm-purple-600 to-mokm-blue-600 hover:from-mokm-purple-700 hover:to-mokm-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <LockIcon className="mr-2 h-4 w-4" /> Save Permissions
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePermissionsModal;
