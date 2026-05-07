"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function SignUpSuccessPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">PredictTrade</span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("checkYourEmail")}</CardTitle>
            <CardDescription>
              {t("sentConfirmationLink")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground text-left">
                {t("verifyEmailHelp")}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("didntReceiveEmail")}{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline underline-offset-4">
                {t("tryAgain")}
              </Link>
            </p>

            <div className="pt-4 border-t border-border">
              <Link 
                href="/auth/login" 
                className="text-sm text-primary font-medium hover:underline underline-offset-4"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
