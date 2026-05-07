import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
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
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {params?.error ? (
                  <>Error: {params.error}</>
                ) : (
                  <>An unexpected error occurred during authentication.</>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Try again
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
