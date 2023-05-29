"use client";

import { FormEvent, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast, ReturnButton } from "@/components/ui-lib";
import { useUserStore } from "@/store";
import { RegisterResponse, ResponseStatus } from "@/app/api/typing.d";

import Locales from "@/locales";
import styles from "@/app/login/login.module.scss";

const ifVerifyCode = !!process.env.NEXT_PUBLIC_EMAIL_SERVICE;

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
  const [invitationCode, setInvitationCode] = useState(
    searchParams.get("code") ?? ""
  );

  const [disableCode, setDisableCode] = useState(true);
  const [disableLog, setDisableLog] = useState(true);

  const [time, setTime] = useState(0);

  const [btnTitle, setBtnTitle] = useState("Get Code");
  const timeRef = useRef<NodeJS.Timeout>()
//倒计时
  useEffect(()=>{
      if(time&&time!==0) {
        timeRef.current=setTimeout(()=>{
          setTime(time=>time-1)
          setBtnTitle(`Pleaser Waite (${time})s`)
       },1000)
      } else {
        setBtnTitle('Get Code')
        setDisableCode(email.length < 2)
      }
      //清楚延时器
      return ()=>{
          clearTimeout(timeRef.current)
      }
  },[time])

  const [updateSessionToken, updateEmail] = useUserStore((state) => [
    state.updateSessionToken,
    state.updateEmail,
  ]);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !verificationCode) {
      showToast(Locales.Index.NoneData);
      return;
    }
    const res = (await (
      await fetch("/api/user/register", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          code: verificationCode,
          code_type: "email",
          invitation_code: invitationCode.toLowerCase() ?? "",
        }),
      })
    ).json()) as RegisterResponse;

    switch (res.status) {
      case ResponseStatus.Success: {
        updateSessionToken(res.sessionToken);
        updateEmail(email);
        router.replace("/");
        showToast(Locales.Index.Success(Locales.Index.Register), 3000);
        break;
      }
      case ResponseStatus.alreadyExisted: {
        showToast(Locales.Index.DuplicateRegistration);
        break;
      }
      case ResponseStatus.invalidCode: {
        showToast(Locales.Index.CodeError);
        break;
      }
      default: {
        showToast(Locales.UnknownError);
        break;
      }
    }
  };

  const handleButtonState = () => {
    setDisableCode(true)
    setTime(60)
  };


  const handleSendVerification = async () => {

    if (!email) {
      showToast("请输入邮箱");
      return;
    }

    handleButtonState()

    const res = await (
      await fetch(
        "/api/user/register/code?email=" + encodeURIComponent(email),
        {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        }
      )
    ).json();

    switch (res.status) {
      case ResponseStatus.Success: {
        switch (res.code_data.status) {
          case 0:
            showToast("验证码成功发送!");
            break;
          case 1:
            showToast(Locales.Index.DuplicateRegistration);
            break;
          case 2:
            showToast("请求验证码过快，请稍后再试!");
            break;
          case 4:
          default:
            showToast(Locales.UnknownError);
            break;
        }
        break;
      }
      case ResponseStatus.notExist: {
        showToast(Locales.Index.EmailNonExistent);
        setTime(0)
        break;
      }
      default: {
        showToast(Locales.UnknownError);
        break;
      }
    }
  };


  const emailChange = (val:string) => {
    setEmail(val)
    const state:boolean = email.length > 0 && password.length > 0 && verificationCode.length > 0
    setDisableLog(!state)
    setDisableCode(email.length < 2)
  }

  const passwordChange = (val:string) => {
    setPassword(val)
    const state:boolean = email.length > 0 && password.length > 0 && verificationCode.length > 0
    setDisableLog(!state) 
  }

  const verifyChange = (val:string) => {
    setVerificationCode(val)
    const state:boolean = email.length > 0 && password.length > 0 && verificationCode.length > 0
    setDisableLog(!state) 
  }

  return (
    <div className={styles["login-form-container"]}>
      <form className={styles["login-form"]} onSubmit={handleRegister}>
        <ReturnButton onClick={() => router.push("/enter")} />

        <h2 className={styles["login-form-title"]}>Register</h2>
        <div className={styles["login-form-input-group"]}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => emailChange(e.target.value)}
            required
          />
        </div>
        <div className={styles["login-form-input-group"]}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => passwordChange(e.target.value)}
          />
        </div>

        {ifVerifyCode && (
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="email">Verification Code</label>
            <div className={styles["verification-code-container"]}>
              <input
                type="text"
                id="verification-code"
                maxLength={6}
                pattern="\d{6}"
                onChange={(e) => verifyChange(e.target.value)}
              />
              <button
                className={styles["send-verification-button"]}
                onClick={handleSendVerification}
                disabled={disableCode}
                type="button"
              >
                { btnTitle }
              </button>
            </div>
          </div>
        )}

        <div className={styles["login-form-input-group"]}>
          <label htmlFor="email">Invitation Code</label>
          <div className={styles["verification-code-container"]}>
            <input
              type="text"
              id="invitation-code"
              placeholder="可选"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
          </div>
        </div>

        <div className={styles["button-container"]}>
          <button className={styles["login-form-submit"]} type="submit" disabled={disableLog}>
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
