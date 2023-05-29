import { NextRequest, NextResponse } from "next/server";
import {
  UserDAL,
  UserLogic,
  User,
} from "database";
import { ResponseStatus } from "@/app/api/typing.d";
/**
 * Registered user
 * @param req
 * @constructor
 */
interface RegisterInfo {
  email: string;
  password: string;
  name: string;
  startsAt: number;
  endsAt: number;
  plan: string;

}
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { email, password, name, plan, startsAt, endsAt }: RegisterInfo  =
      await req.json();
      console.log("1111")
    const userDal = new UserDAL();
    if (await userDal.exists(email)) {
      // User already exists.
      return NextResponse.json({ status: ResponseStatus.alreadyExisted });
    }
    console.log("dsdsd")
    const user = new UserLogic();
    await user.register(email, password, {
      name: name,
      subscriptions:[{
        startsAt: startsAt,
        endsAt: endsAt,
        plan: plan,
        tradeOrderId: 'manual'
      }]
    });

    return NextResponse.json({
      status: ResponseStatus.Success});
  } catch (error) {
    console.error("[REGISTER]", error);
    return new Response("[INTERNAL ERROR]", { status: 500 });
  }
}

export const runtime = "edge";
