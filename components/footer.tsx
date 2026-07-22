import { Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-primary">香港立直無雙聯賽</h3>
            <p className="text-sm text-muted-foreground text-pretty">
              香港首個專業立直麻雀團體聯賽，為本地帶來世界級競技水平。
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">快速連結</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  關於聯賽
                </a>
              </li>
              <li>
                <a href="#rules" className="text-muted-foreground hover:text-primary transition-colors">
                  規則資源
                </a>
              </li>
              <li>
                <a href="#teams" className="text-muted-foreground hover:text-primary transition-colors">
                  參賽隊伍
                </a>
              </li>
              <li>
                <a
                  href="https://3ma.summermj.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  三麻聯賽
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">關注我們</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/summer.mj.hk"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.youtube.com/@summermjhk"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
              >
                <Youtube className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 香港立直無雙聯賽。版權所有。</p>
        </div>
      </div>
    </footer>
  )
}
