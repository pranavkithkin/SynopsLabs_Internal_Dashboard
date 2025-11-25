import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-cyan-500/20 bg-black text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-cyan-500">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Page Not Found
          </h1>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or is under construction.
          </p>
          <Link href="/">
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

