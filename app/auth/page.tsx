"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrendingUp, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function AuthPanelPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const redirectTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/demo"
      : "/demo";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingSignUp, setIsLoadingSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingLogin(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (loginError) throw loginError;
      router.push(redirectTo);
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : t("authUnexpectedError"));
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingSignUp(true);
    setError(null);

    if (signUpPassword !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      setIsLoadingSignUp(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setError(t("passwordTooShort"));
      setIsLoadingSignUp(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName || signUpEmail.split("@")[0],
          },
        },
      });
      if (signUpError) throw signUpError;
      router.push("/auth/sign-up-success");
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : t("authUnexpectedError"));
    } finally {
      setIsLoadingSignUp(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">PredictTrade</span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">{t("authPanelTitle")}</CardTitle>
            <CardDescription>{t("authPanelDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("loginTab")}</TabsTrigger>
                <TabsTrigger value="signup">{t("signupTab")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder={t("enterPassword")}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isLoadingLogin}>
                    {isLoadingLogin ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("signingIn")}
                      </>
                    ) : (
                      <>
                        {t("goDemo")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t("displayName")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t("yourNickname")}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        placeholder={t("min6Chars")}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t("confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        required
                        placeholder={t("repeatPassword")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {confirmPassword && signUpPassword === confirmPassword && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isLoadingSignUp}>
                    {isLoadingSignUp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("creatingAccount")}
                      </>
                    ) : (
                      <>
                        {t("createAccount")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="mt-6 border-t border-border pt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t("backToHome")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
