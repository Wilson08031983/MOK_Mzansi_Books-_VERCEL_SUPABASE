import handler from '../../src/pages/api/billing/me';
export default async function vercelHandler(req: any, res: any) { return handler(req, res); }