/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import { ArrowRight, Check, Star, Shield, Users, BarChart3, Globe, Cable, BookOpenCheck } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { MarketingCard, MarketingCardBody, MarketingCardDescription, MarketingCardFooter, MarketingCardHeader, MarketingCardTitle } from './marketing-card'
import { MarketingSection } from './marketing-section'

export default function LandingPage() {
    return <main>
        {/* Hero Section */}
        <MarketingSection className="xl:py-48">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-4">
                  🚀 New: AI-Powered Analytics
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Do more with 
                  <span className="text-primary"> RT+</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transform your data into actionable insights. Our AI-powered platform helps you make better decisions,
                  increase revenue, and grow faster than ever before.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="h-12 px-8">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited free trial
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
        </MarketingSection>

        {/* Features Section */}
        <MarketingSection id="features" className="bg-muted/50">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need to succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Powerful features designed to help you analyse, improve, and strengthen your team.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <MarketingCard>
                <MarketingCardHeader>
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>Competency Tracking</MarketingCardTitle>
                  <MarketingCardDescription>
                    Track and manage team competencies with real-time analytics and insights.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <Shield className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>Enterprise Security</MarketingCardTitle>
                  <MarketingCardDescription>
                    Industry standard security with granular access controls and data encryption.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <Users className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>Team Collaboration</MarketingCardTitle>
                  <MarketingCardDescription>
                    Work together seamlessly with real-time collaboration and sharing features.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <Cable className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>D4H Integration</MarketingCardTitle>
                  <MarketingCardDescription>
                    Integrates with D4H for synchronization and reporting.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <Globe className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>Global Scale</MarketingCardTitle>
                  <MarketingCardDescription>
                    Built to scale globally with high uptime and lightning-fast performance.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <BookOpenCheck className="h-10 w-10 text-primary" />
                  <MarketingCardTitle>Open Source</MarketingCardTitle>
                  <MarketingCardDescription>
                    All of our code is open source, allowing you to self-host or contribute to the project.
                  </MarketingCardDescription>
                </MarketingCardHeader>
              </MarketingCard>
            </div>
        </MarketingSection>

        {/* Pricing Section */}
        <MarketingSection id="pricing">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, transparent pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for your business. Upgrade or downgrade at any time.
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-5xl mx-auto mt-12">
              <MarketingCard>
                <MarketingCardHeader>
                    <MarketingCardTitle>Sandbox</MarketingCardTitle>
                    <MarketingCardDescription>Access to our sandbox environment.</MarketingCardDescription>
                    <div className="text-3xl font-bold">
                        $0<span className="text-sm font-normal">/month</span>
                    </div>
                </MarketingCardHeader>
                <MarketingCardBody className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Unlimited Team Members
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      1 User Account
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Basic analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Email support
                    </li>
                  </ul>
                </MarketingCardBody>
                <MarketingCardFooter>
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </MarketingCardFooter>
              </MarketingCard>
              <MarketingCard className="border-primary">
                <MarketingCardHeader>
                  <Badge className="w-fit">Most Popular</Badge>
                  <MarketingCardTitle>Free</MarketingCardTitle>
                  <MarketingCardDescription>Best for actual teams</MarketingCardDescription>
                  <div className="text-3xl font-bold">
                    $0<span className="text-sm font-normal">/month</span>
                  </div>
                </MarketingCardHeader>
                <MarketingCardBody className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Unlimited team members
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Email support
                    </li>
                  </ul>
                </MarketingCardBody>
                <MarketingCardFooter>
                  <Button className="w-full">Contact Sales</Button>
                </MarketingCardFooter>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <MarketingCardTitle>Professional</MarketingCardTitle>
                  <MarketingCardDescription>If you want to support our work.</MarketingCardDescription>
                  <div className="text-3xl font-bold">
                    $99<span className="text-sm font-normal">/month</span>
                  </div>
                </MarketingCardHeader>
                <MarketingCardBody className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Unlimited team members
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Feature requests
                    </li>
                  </ul>
                </MarketingCardBody>
                <MarketingCardFooter>
                  <Button className="w-full" variant="outline" disabled>Coming soon</Button>
                </MarketingCardFooter>
              </MarketingCard>
            </div>
        </MarketingSection>

        {/* Testimonials Section */}
        <MarketingSection id="testimonials" className="bg-muted/50">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Loved by some people</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what our customers have to say about their experience with RT+.
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mt-12">
              <MarketingCard>
                <MarketingCardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </MarketingCardHeader>
                <MarketingCardBody>
                  <p className="text-muted-foreground">
                    "RT+ has completely transformed how we track competencies. The insights we get are
                    incredible."
                  </p>
                </MarketingCardBody>
                <MarketingCardFooter className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    {/* <p className="text-sm text-muted-foreground">TL, NZ-RT13</p> */}
                  </div>
                </MarketingCardFooter>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </MarketingCardHeader>
                <MarketingCardBody>
                  <p className="text-muted-foreground">
                    "The feature are great, they help do do things we couldn't do before."
                  </p>
                </MarketingCardBody>
                <MarketingCardFooter className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Sarah Miller</p>
                    {/* <p className="text-sm text-muted-foreground">CTO, StartupXYZ</p> */}
                  </div>
                </MarketingCardFooter>
              </MarketingCard>
              <MarketingCard>
                <MarketingCardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </MarketingCardHeader>
                <MarketingCardBody>
                  <p className="text-muted-foreground">
                    "Customer support is amazing. They helped us get set up in no time and are always there when we need
                    them."
                  </p>
                </MarketingCardBody>
                <MarketingCardFooter className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Mike Johnson</p>
                    {/* <p className="text-sm text-muted-foreground">Founder, GrowthCo</p> */}
                  </div>
                </MarketingCardFooter>
              </MarketingCard>
            </div>
        </MarketingSection>

        {/* FAQ Section */}
        <MarketingSection id="faq">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about RT+.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do the free tiers work?</AccordionTrigger>
                  <AccordionContent>
                    You get full access to all features for as long as you want, no credit card required. You can cancel anytime.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What kind of support do you offer?</AccordionTrigger>
                  <AccordionContent>
                    We offer email support for as and when our time allows.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We use industry standard encryption and security practices to protect your data. Our platform is built with security in mind.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Do you offer custom integrations?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Enterprise customers can request custom integrations. We also have a comprehensive API for
                    building your own integrations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
        </MarketingSection>

        {/* CTA Section */}
        <MarketingSection className="bg-primary text-primary-foreground">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to improve your team?</h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join a couple of teams already using RT+ to make better decisions and grow faster.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {/* <Button size="lg" variant="secondary" className="h-12 px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button> */}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
        </MarketingSection>
    </main>

}




