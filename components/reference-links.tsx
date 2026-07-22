import { Card, CardContent } from "@/components/ui/card"
import { FileText, Building2 } from "lucide-react"

export function ReferenceLinks() {
  return (
    <section id="rules" className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
          官方<span className="text-secondary">資源</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="https://docs.google.com/document/d/your-rulebook-link"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="border-border hover:border-secondary transition-all hover:shadow-lg hover:shadow-secondary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="size-14 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <FileText className="size-7 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">官方規則手冊</h3>
                  <p className="text-sm text-muted-foreground">完整的賽事規則與規範</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="https://hkmahjong.org" target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="border-border hover:border-secondary transition-all hover:shadow-lg hover:shadow-secondary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="size-14 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Building2 className="size-7 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">香港麻雀協會</h3>
                  <p className="text-sm text-muted-foreground">了解更多競技麻雀資訊</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </section>
  )
}
