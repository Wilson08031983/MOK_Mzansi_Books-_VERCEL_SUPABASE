import handler from '../../src/pages/api/emails/confirmation';
export default async function vercelHandler(req: any, res: any) { return handler(req, res); }