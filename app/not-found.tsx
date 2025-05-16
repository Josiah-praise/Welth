import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
const NotFoundPage = () => {
  return (
      <div className="flex justify-center items-center flex-col gap-5 min-h-screen">
          <h1 className="text-6xl gradient-text font-bold">400</h1>
          <p className="text-4xl">Page not found</p>
          <p>Opps! the page you are looking for does not exist</p>
          <Link href={'/'}>
              <Button variant={'outline'}>
                  <Home/>
                  Go home
              </Button>
          </Link>
    </div>
  )
}
export default NotFoundPage