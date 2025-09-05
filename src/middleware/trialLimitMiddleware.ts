import { NextApiRequest, NextApiResponse } from 'next';
import TrialLimitService, { LimitKey } from '../services/trialLimitService';

export interface TrialLimitRequest extends NextApiRequest {
  userId?: string;
  trialValidation?: {
    allowed: boolean;
    currentCount: number;
    limit: number;
    message?: string;
  };
}

/**
 * Middleware to validate trial limits for API endpoints
 * @param limitKey - The feature limit to validate
 * @param getUserId - Function to extract user ID from request
 */
export function withTrialLimitValidation(
  limitKey: LimitKey,
  getUserId: (req: NextApiRequest) => string | null
) {
  return function middleware(
    handler: (req: TrialLimitRequest, res: NextApiResponse) => Promise<void> | void
  ) {
    return async (req: TrialLimitRequest, res: NextApiResponse) => {
      try {
        // Extract user ID from request
        const userId = getUserId(req);
        
        if (!userId) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'User authentication required'
          });
        }

        // Validate trial limits
        const validation = await TrialLimitService.validateTrialLimit(userId, limitKey);
        
        // If not allowed, return error
        if (!validation.allowed) {
          return res.status(403).json({
            error: 'Trial limit exceeded',
            message: validation.message,
            currentCount: validation.currentCount,
            limit: validation.limit,
            limitKey
          });
        }

        // Attach validation info to request for handler use
        req.userId = userId;
        req.trialValidation = validation;

        // Continue to the actual handler
        return handler(req, res);
      } catch (error) {
        console.error('Trial limit validation error:', error);
        // In case of validation error, allow request to proceed
        // to prevent blocking users due to system errors
        req.userId = getUserId(req) || undefined;
        return handler(req, res);
      }
    };
  };
}

/**
 * Helper function to extract user ID from JWT token in Authorization header
 */
export function getUserIdFromAuth(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // For now, we'll use a simple approach - in production, you'd verify the JWT
    // This is a placeholder that should be replaced with proper JWT verification
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.sub || decoded.user_id || decoded.id || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

/**
 * Helper function to extract user ID from session or cookies
 */
export function getUserIdFromSession(req: NextApiRequest): string | null {
  try {
    // Check for user ID in cookies or session
    const cookieUserId = req.cookies?.userId;
    const headerUserId = req.headers['x-user-id'];
    
    // Handle string array from headers
    const userId = cookieUserId || (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId);
    return userId || null;
  } catch (error) {
    console.error('Error extracting user ID from session:', error);
    return null;
  }
}

/**
 * Combined helper that tries multiple methods to extract user ID
 */
export function getUserId(req: NextApiRequest): string | null {
  // Try JWT token first
  let userId = getUserIdFromAuth(req);
  if (userId) return userId;

  // Try session/cookies
  userId = getUserIdFromSession(req);
  if (userId) return userId;

  // Try request body (for some endpoints)
  if (req.body && typeof req.body === 'object') {
    userId = req.body.userId || req.body.user_id;
    if (userId) return userId;
  }

  return null;
}

/**
 * Middleware factory for common trial limit validations
 */
export const trialLimitMiddleware = {
  clients: withTrialLimitValidation('clients', getUserId),
  projects: withTrialLimitValidation('projects', getUserId),
  quotations: withTrialLimitValidation('quotationsPerMonth', getUserId),
  invoices: withTrialLimitValidation('invoicesPerMonth', getUserId),
  inventoryItems: withTrialLimitValidation('inventoryItems', getUserId),
  suppliers: withTrialLimitValidation('suppliers', getUserId),
  storageLocations: withTrialLimitValidation('storageLocations', getUserId),
};

export default trialLimitMiddleware;