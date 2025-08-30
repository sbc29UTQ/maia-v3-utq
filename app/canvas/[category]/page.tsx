import CanvasClientPage from "./CanvasClientPage"

interface CanvasPageProps {
  params: {
    category: string
  }
}

const validCategories = ["deep-scope", "blueprint-ai", "nextleap", "flowops"]

export default function CanvasPage({ params }: CanvasPageProps) {
  return <CanvasClientPage category={params.category} />
}

export function generateStaticParams() {
  return validCategories.map((category) => ({
    category: category,
  }))
}
