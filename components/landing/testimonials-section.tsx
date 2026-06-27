import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    content: "StockFlow Pro transformed how we manage our wholesale operations. We've reduced inventory discrepancies by 90% and our retailers love the real-time visibility.",
    author: "Sarah Chen",
    role: "Operations Director",
    company: "Pacific Distributors",
    avatar: "SC",
  },
  {
    content: "The credit tracking feature alone has saved us thousands in bad debt. We can now confidently extend credit to retailers knowing exactly where we stand.",
    author: "Michael Okonkwo",
    role: "Finance Manager",
    company: "Lagos Trade Hub",
    avatar: "MO",
  },
  {
    content: "As a manufacturer, coordinating with multiple wholesalers was a nightmare. StockFlow Pro gave us a single dashboard to manage all our B2B relationships.",
    author: "Rajesh Patel",
    role: "CEO",
    company: "Patel Manufacturing",
    avatar: "RP",
  },
  {
    content: "The invoice automation has cut our billing time in half. Our cash flow improved within the first month of using StockFlow Pro.",
    author: "Emma Thompson",
    role: "Owner",
    company: "Thompson Retail Group",
    avatar: "ET",
  },
  {
    content: "We discovered amazing suppliers through the marketplace feature. Our product range has expanded 40% since joining the platform.",
    author: "David Kim",
    role: "Procurement Lead",
    company: "Metro Supermarkets",
    avatar: "DK",
  },
  {
    content: "The POS integration works flawlessly. Our inventory updates in real-time and we never have to worry about overselling again.",
    author: "Amira Hassan",
    role: "Store Manager",
    company: "QuickMart Stores",
    avatar: "AH",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-sm font-semibold text-chart-1 uppercase tracking-wider">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by businesses worldwide
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about transforming their supply chain operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
