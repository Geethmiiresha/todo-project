import type { ReactNode } from "react"

import { ProgressRing } from "@/components/progress-ring"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AuthLayoutProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_26rem] lg:items-stretch">
        <section className="hidden flex-col justify-between rounded-lg bg-foreground p-8 text-background lg:flex">
          <h1 className="font-display text-4xl leading-tight font-bold">Taskboard</h1>
          <div aria-hidden="true">
            <ProgressRing done={2} total={3} />
          </div>
          <p className="max-w-xs text-white/70">
            Your own private to-do list. Sign in to pick up where you left off.
          </p>
        </section>

        <Card>
          <CardHeader>
            <p className="font-display text-sm font-bold text-primary lg:hidden">Taskboard</p>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>
        </Card>
      </div>
    </div>
  )
}
