import handler from '../../src/pages/api/emails/quotation';
export default async function vercelHandler(req: any, res: any) { return handler(req, res); }