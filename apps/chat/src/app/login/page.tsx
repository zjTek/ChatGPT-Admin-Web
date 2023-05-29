"use client";

import { FormEvent, useState } from "react";
import { useUserStore } from "@/store";
import { Loading } from "@/components/loading";
import { showToast } from "@/components/ui-lib";
import { ResponseStatus } from "@/app/api/typing.d";
import { useRouter } from "next/navigation";
import Locales from "@/locales";

import styles from "./login.module.scss";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  // 防止表单重复 提交
  const [submitting, setSubmitting] = useState(false);
  const [updateSessionToken, updateEmail] = useUserStore((state) => [
    state.updateSessionToken,
    state.updateEmail,
  ]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!email || !password) {
      showToast("请输入邮箱密码");
      setSubmitting(false);
      return;
    }
    
    setIsLoading(true)
    const res = await (
      await fetch("/api/user/login", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
    ).json();
    setIsLoading(false)
    switch (res.status) {
      case ResponseStatus.Success: {
        updateSessionToken(res.sessionToken);
        updateEmail(email);
        showToast(Locales.Index.Success(Locales.Index.Login), 3000);
        router.replace("/");
        break;
      }
      case ResponseStatus.notExist: {
        showToast(Locales.Index.NotYetRegister);
        break;
      }
      case ResponseStatus.wrongPassword: {
        showToast(Locales.Index.PasswordError);
        break;
      }
      default: {
        showToast(Locales.UnknownError);
        break;
      }
    }

    setSubmitting(false);
  };

  const emailChange = (value: string) => {
    setEmail(value)
    if (email && password) {
      setSubmitting(false)
    }
  }

  const passwordChange = (value: string) => {
    setPassword(value)
    if (email && password) {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className={styles["login-form-container"]}>
        <form className={styles["login-form"]} onSubmit={handleLogin}>
          <h2 className={styles["login-form-title"]}>Deer GPT</h2>
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="email">邮箱（用户名）</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => emailChange(e.target.value)}
              required
            />
          </div>
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => passwordChange(e.target.value)}
              required
            />
          </div>{}
          <div className={styles["button-container"]}>
            <button
              className={styles["login-form-submit"]}
              type="submit"
              disabled={submitting}
            >
              {isLoading ? "登录中..." :"登录"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
