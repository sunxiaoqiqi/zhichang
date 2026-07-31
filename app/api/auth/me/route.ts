import { getCurrentUser } from "../../../auth/session";
export async function GET(){const user=await getCurrentUser();return user?Response.json({user}):Response.json({error:"未登录"},{status:401})}
