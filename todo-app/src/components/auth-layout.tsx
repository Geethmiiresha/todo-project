import type { ReactNode } from "react"

import { Check, Sparkles } from "lucide-react"
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
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid w-full gap-5 lg:grid-cols-[1fr_27rem] lg:items-stretch">
        <section className="relative hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#101c30] p-9 text-white shadow-2xl shadow-slate-900/10 dark:bg-[#070d18] lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-28 size-80 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-accent ring-1 ring-white/15">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <div>
              <p className="font-display text-xl font-bold">Taskboard</p>
              <p className="text-xs text-white/55">A calmer way to get things done</p>
            </div>
          </div>
          <div className="relative flex items-center gap-8">
            <div className="rounded-full bg-white/[0.06] p-3 ring-1 ring-white/10">
              <ProgressRing done={2} total={3} />
            </div>
            <div className="max-w-xs">
              <span className="eyebrow flex items-center gap-1.5 text-accent">
                <Sparkles className="size-3.5" /> Make space for focus
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
                Small steps.
                <br />
                Big momentum.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Keep your plans clear and your next step close.
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-white/50">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Your tasks stay private to your account
          </div>
        </section>

        <Card className="surface-card justify-center gap-5 rounded-[1.75rem] py-7 sm:py-8">
          <CardHeader>
            <p className="eyebrow lg:hidden">Taskboard · Your personal workspace</p>
            <CardTitle className="pt-1 text-3xl tracking-tight">{title}</CardTitle>
            <CardDescription className="text-[0.925rem]">{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
