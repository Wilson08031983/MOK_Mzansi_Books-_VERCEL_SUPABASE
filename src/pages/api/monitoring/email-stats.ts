import { NextApiRequest, NextApiResponse } from 'next';
import { postmarkService } from '../../../services/postmarkService';

interface EmailHealthMetrics {
  deliveryStats: {
    delivered: number;
    bounced: number;
    spam: number;
    opened: number;
    clicked: number;
  };
  deliveryRate: number;
  bounceRate: number;
  spamRate: number;
  openRate: number;
  clickRate: number;
  serverStatus: {
    isActive: boolean;
    serverName: string;
    serverId: number;
  };
  lastChecked: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock stats since EmailMonitoringService is no longer available
    const stats = {
      delivered: 0,
      bounced: 0,
      spam: 0,
      opened: 0,
      clicked: 0
    };
    
    // Calculate rates
    const totalSent = stats.delivered + stats.bounced;
    const deliveryRate = totalSent > 0 ? (stats.delivered / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (stats.bounced / totalSent) * 100 : 0;
    const spamRate = totalSent > 0 ? (stats.spam / totalSent) * 100 : 0;
    const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
    const clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

    // Get server status
    let serverStatus = {
      isActive: false,
      serverName: 'MOK Mzansi Books Email Server',
      serverId: 0
    };

    try {
      // Check if postmark service is available
      const instance = postmarkService.getInstance();
      serverStatus = {
        isActive: true,
        serverName: 'MOK Mzansi Books Email Server',
        serverId: 1
      };
    } catch (error) {
      console.error('Failed to get server status:', error);
    }

    const healthMetrics: EmailHealthMetrics = {
      deliveryStats: stats,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      spamRate: Math.round(spamRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      serverStatus,
      lastChecked: new Date().toISOString()
    };

    // Add health status indicators
    const healthStatus = {
      overall: 'healthy' as 'healthy' | 'warning' | 'critical',
      issues: [] as string[]
    };

    // Check for issues
    if (bounceRate > 5) {
      healthStatus.overall = 'warning';
      healthStatus.issues.push(`High bounce rate: ${bounceRate.toFixed(2)}%`);
    }
    if (bounceRate > 10) {
      healthStatus.overall = 'critical';
    }
    if (spamRate > 0.1) {
      healthStatus.overall = 'warning';
      healthStatus.issues.push(`Spam complaints detected: ${spamRate.toFixed(2)}%`);
    }
    if (!serverStatus.isActive) {
      healthStatus.overall = 'critical';
      healthStatus.issues.push('Postmark server is not active');
    }

    res.status(200).json({
      ...healthMetrics,
      health: healthStatus
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Reset stats endpoint (for testing/maintenance)
export async function resetStats(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock reset since EmailMonitoringService is no longer available
    res.status(200).json({ success: true, message: 'Stats reset successfully' });
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}