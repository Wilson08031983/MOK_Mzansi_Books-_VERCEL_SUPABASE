import handler from '../../src/pages/api/billing/start-trial';
export default async function vercelHandler(req: any, res: any) { return handler(req, res); }