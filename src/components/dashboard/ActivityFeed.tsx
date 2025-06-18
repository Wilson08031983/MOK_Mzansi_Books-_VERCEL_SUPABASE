
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Receipt } from 'lucide-react';

type ActivityItem = {
  id: number | string;
  type: 'client' | 'quotation' | 'invoice' | 'user';
  action: string;
  subject: string;
  date: string;
  user: string;
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-900 font-sf-pro">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-sf-pro text-lg">No recent activity</p>
            <p className="text-sm text-slate-400 mt-2 font-sf-pro">Your business activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-xl hover:bg-white/30 transition-all duration-300 animate-fade-in delay-${index * 100}`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                  activity.type === 'client' ? 'from-mokm-blue-500 to-mokm-purple-500' :
                  activity.type === 'invoice' ? 'from-mokm-orange-500 to-mokm-pink-500' :
                  'from-mokm-purple-500 to-mokm-pink-500'
                } flex items-center justify-center shadow-colored`}>
                  {activity.type === 'client' && <Users className="h-5 w-5 text-white" />}
                  {activity.type === 'invoice' && <FileText className="h-5 w-5 text-white" />}
                  {activity.type === 'quotation' && <Receipt className="h-5 w-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-sf-pro">
                    <span className="font-medium">{activity.user}</span> {activity.action} {activity.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-sf-pro">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
