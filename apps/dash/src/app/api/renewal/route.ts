import { NextRequest, NextResponse } from "next/server";
import {
  UserDAL,
  UserLogic,
  RegisterCodeLogic,
  InvitationCodeLogic,
  AccessControlLogic,
} from "database";
import { ResponseStatus } from "@/app/api/typing.d";
import { REPLServer } from "repl";
import md5 from 'spark-md5'
const ifVerifyCode = !!process.env.NEXT_PUBLIC_EMAIL_SERVICE;

/**
 * Registered user
 * @param req
 * @constructor
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { email, password, name,code, plan, startsAt, endsAt, tradeOrderId } =
      await req.json();

    const userDal = new UserDAL();
    if (!await userDal.exists(email)) {
      // User not exists.
      return NextResponse.json({ status: ResponseStatus.notExist });
    }
    const user = new UserLogic();



    const newInfo = {
      name: name,
      passwordHash: md5.hash(password.trim())
    }
    await user.update(email, password);

    // After registration, directly generate a JWT Token and return it.
    const accessControl = new AccessControlLogic();
    const tokenGenerator = await accessControl.newJWT(email);
    if (!tokenGenerator)
      return NextResponse.json({
        status: ResponseStatus.Failed,
      });
    const { token: sessionToken, exp } = tokenGenerator;
    return NextResponse.json({
      status: ResponseStatus.Success,
      sessionToken,
      exp,
    });
  } catch (error) {
    console.error("[REGISTER]", error);
    return new Response("[INTERNAL ERROR]", { status: 500 });
  }
}

export const runtime = "edge";
